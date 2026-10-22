import React, { useState, useEffect, useRef } from 'react';
import {
  CENTRAL_WAREHOUSE,
  PERU_BOUNDS,
  TILE_CONFIG,
  VEHICLES,
  loadLeaflet,
  geocodeAddress,
  getStreetRoute,
  calculateEtaFormatted
} from '../services/gpsService';

export default function OrderTrackingModal({ order, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Estados de control y simulación
  const [selectedVehicle, setSelectedVehicle] = useState(order?.defaultVehicle || 'moto');
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  // Telemetría en vivo
  const [routeData, setRouteData] = useState(null);
  const [progress, setProgress] = useState(0); // 0 a 100%
  const [remainingKm, setRemainingKm] = useState(0);
  const [currentEta, setCurrentEta] = useState('--:--');
  const [currentSpeed, setCurrentSpeed] = useState(VEHICLES.moto.baseSpeedKmH);
  const [destinationInfo, setDestinationInfo] = useState(null);

  const vehicleConfig = VEHICLES[selectedVehicle] || VEHICLES.moto;

  // 1. Inicialización y Geocodificación
  useEffect(() => {
    let isCancelled = false;

    async function initTracking() {
      setIsLoadingRoute(true);
      setIsCompleted(false);
      setProgress(0);

      // Cargar librería Leaflet bajo demanda (Lazy loading anti-bloqueo)
      const L = await loadLeaflet();
      if (isCancelled || !mapContainerRef.current) return;

      // Geocodificar la dirección de entrega del cliente
      const destAddress = order?.deliveryAddress || order?.clientAddress || order?.address || 'Av. Larco 812, Miraflores, Lima';
      const destCoords = order?.deliveryCoords || await geocodeAddress(destAddress);
      
      if (isCancelled) return;
      setDestinationInfo({
        name: order?.clientName || 'Cliente Gourmet',
        address: destCoords.name || destAddress,
        coords: destCoords
      });

      // Obtener ruta vial real vía OSRM
      const start = { lat: CENTRAL_WAREHOUSE.lat, lng: CENTRAL_WAREHOUSE.lng };
      const dest = { lat: destCoords.lat, lng: destCoords.lng };
      const route = await getStreetRoute(start, dest);

      if (isCancelled) return;
      setRouteData(route);
      setRemainingKm(route.distanceKm);
      setCurrentEta(calculateEtaFormatted(route.distanceKm, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(vehicleConfig.baseSpeedKmH);
      setIsLoadingRoute(false);

      // Inicializar o resetear Mapa Leaflet
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Crear instancia con límites estrictos de Perú
      const map = L.map(mapContainerRef.current, {
        maxBounds: PERU_BOUNDS,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: true
      });
      mapInstanceRef.current = map;

      // Capa de mosaicos oficial Carto Voyager con API Key (fallback Carto Positron / OSM)
      const tileLayer = L.tileLayer(TILE_CONFIG.cartoVoyager, {
        attribution: TILE_CONFIG.attribution,
        maxZoom: 19
      });

      tileLayer.on('tileerror', () => {
        // Fallback defensivo si el CDN de Carto requiere capa Positron libre
        tileLayer.setUrl(TILE_CONFIG.cartoPositronFallback);
      });
      tileLayer.addTo(map);

      // Iconos personalizados HTML sobrios (cero AI slop)
      const warehouseIcon = L.divIcon({
        className: 'gps-custom-pin',
        html: `
          <div style="background:#1e293b; color:#f8fafc; border:2px solid #38bdf8; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-size:18px;">
            🏭
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const clientIcon = L.divIcon({
        className: 'gps-custom-pin',
        html: `
          <div style="background:#b45309; color:#ffffff; border:2px solid #fef08a; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-size:18px;">
            📍
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Marcador Almacén Central (San Isidro)
      const warehouseMarker = L.marker([start.lat, start.lng], { icon: warehouseIcon }).addTo(map);
      warehouseMarker.bindPopup(`
        <div style="font-family:system-ui; font-size:13px; line-height:1.4;">
          <strong style="color:#0284c7;">🏭 ${CENTRAL_WAREHOUSE.name}</strong><br/>
          <span style="color:#475569;">${CENTRAL_WAREHOUSE.address}</span><br/>
          <span style="display:inline-block; margin-top:4px; font-size:11px; color:#166534; background:#dcfce7; padding:2px 6px; border-radius:4px; font-weight:700;">Centro Logístico Activo</span>
        </div>
      `);

      // Marcador Destino Cliente
      const clientMarker = L.marker([dest.lat, dest.lng], { icon: clientIcon }).addTo(map);
      clientMarker.bindPopup(`
        <div style="font-family:system-ui; font-size:13px; line-height:1.4;">
          <strong style="color:#b45309;">📍 Destino de Entrega</strong><br/>
          <strong style="color:#0f172a;">${order?.clientName || 'Cliente'}</strong><br/>
          <span style="color:#475569;">${destCoords.name || destAddress}</span>
        </div>
      `);

      // Trazado de Polilínea de Ruta en Azul Azure (#0284c7)
      const routeLine = L.polyline(route.points, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = routeLine;

      // Polilínea de tramo recorrido (verde esmeralda #10b981)
      const traveledLine = L.polyline([route.points[0]], {
        color: '#10b981',
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      traveledPolylineRef.current = traveledLine;

      // Auto-encuadre de cámara con padding
      map.fitBounds(routeLine.getBounds(), { padding: [45, 45] });

      // Marcador móvil del Vehículo de Reparto
      const initialPos = route.points[0];
      const vehicleIcon = createVehicleDivIcon(L, vehicleConfig.icon, vehicleConfig.label);
      const vehicleMarker = L.marker(initialPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      vehicleMarkerRef.current = vehicleMarker;
      vehicleMarker.bindTooltip(`<b>${vehicleConfig.label}</b> • En camino`, { direction: 'top', offset: [0, -16] });
    }

    initTracking();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order]);

  // Función auxiliar para generar icono del vehículo
  function createVehicleDivIcon(L, iconEmoji, label) {
    return L.divIcon({
      className: 'gps-vehicle-marker',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(2,132,199,0.3); animation:gpsPulse 2s infinite ease-out;"></div>
          <div style="width:36px; height:36px; border-radius:50%; background:#ffffff; border:2px solid #0284c7; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 12px rgba(0,0,0,0.25); z-index:2;">
            ${iconEmoji}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  }

  // 2. Actualizar icono cuando cambia el vehículo
  useEffect(() => {
    if (!window.L || !vehicleMarkerRef.current) return;
    const icon = createVehicleDivIcon(window.L, vehicleConfig.icon, vehicleConfig.label);
    vehicleMarkerRef.current.setIcon(icon);
    vehicleMarkerRef.current.setTooltipContent(`<b>${vehicleConfig.label}</b> • ${vehicleConfig.baseSpeedKmH} km/h`);

    // Recalcular ETA y velocidad actual
    if (routeData) {
      const remainingDistance = routeData.distanceKm * (1 - progress / 100);
      setCurrentEta(calculateEtaFormatted(remainingDistance, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(vehicleConfig.baseSpeedKmH * simSpeed);
    }
  }, [selectedVehicle]);

  // 3. Bucle de Simulación de Movimiento en Tiempo Real
  useEffect(() => {
    if (!isPlaying || !routeData || isCompleted) return;

    let localProgress = progress;
    lastTimeRef.current = performance.now();

    const points = routeData.points;
    const totalPoints = points.length;
    if (totalPoints < 2) return;

    // Velocidad de simulación: a velocidad base (ej. 45 km/h) el viaje dura unos 30-40s en demo a 1x
    // simSpeed multiplica el avance (1x, 2x, 5x)
    const baseDurationMs = 28000; // 28 segundos para recorrer la ruta completa a 1x
    const stepDurationMs = baseDurationMs / simSpeed;

    const animateLoop = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = Math.max(0, time - lastTimeRef.current);
      lastTimeRef.current = time;

      localProgress = Math.max(0, Math.min(100, localProgress + (delta / stepDurationMs) * 100));

      if (localProgress >= 100) {
        localProgress = 100;
        setProgress(100);
        setRemainingKm(0);
        setCurrentEta('00:00');
        setIsCompleted(true);
        setIsPlaying(false);

        // Posicionar vehículo exactamente en el destino final
        const finalPoint = points[points.length - 1];
        if (vehicleMarkerRef.current && finalPoint) {
          vehicleMarkerRef.current.setLatLng(finalPoint);
        }
        if (traveledPolylineRef.current) {
          traveledPolylineRef.current.setLatLngs(points);
        }
        return;
      }

      setProgress(localProgress);

      // Calcular punto actual interpolado a lo largo del array de coordenadas
      const floatIndex = Math.max(0, Math.min(totalPoints - 1, (localProgress / 100) * (totalPoints - 1)));
      const lowIndex = Math.max(0, Math.min(totalPoints - 1, Math.floor(floatIndex)));
      const highIndex = Math.max(0, Math.min(totalPoints - 1, lowIndex + 1));
      const t = floatIndex - lowIndex;

      const p1 = points[lowIndex] || points[0];
      const p2 = points[highIndex] || p1;
      const currentLat = p1[0] + (p2[0] - p1[0]) * t;
      const currentLng = p1[1] + (p2[1] - p1[1]) * t;
      const currentPos = [currentLat, currentLng];

      // Actualizar posición del marcador del vehículo
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng(currentPos);
      }

      // Actualizar polilínea de recorrido avanzado
      if (traveledPolylineRef.current) {
        const coveredPoints = points.slice(0, lowIndex + 1);
        coveredPoints.push(currentPos);
        traveledPolylineRef.current.setLatLngs(coveredPoints);
      }

      // Recalcular telemetría en tiempo real
      const remDistance = Number((routeData.distanceKm * (1 - localProgress / 100)).toFixed(2));
      setRemainingKm(remDistance);
      setCurrentEta(calculateEtaFormatted(remDistance, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(Math.round(vehicleConfig.baseSpeedKmH * simSpeed));

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, routeData, isCompleted, simSpeed, selectedVehicle]);

  // Controles de reproducción
  const handleTogglePlay = () => {
    if (isCompleted) {
      handleResetRoute();
      return;
    }
    setIsPlaying(prev => !prev);
  };

  const handleResetRoute = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setProgress(0);
    setIsCompleted(false);
    setIsPlaying(true);

    if (routeData && routeData.points.length > 0) {
      const initialPos = routeData.points[0];
      if (vehicleMarkerRef.current) vehicleMarkerRef.current.setLatLng(initialPos);
      if (traveledPolylineRef.current) traveledPolylineRef.current.setLatLngs([initialPos]);
      setRemainingKm(routeData.distanceKm);
      setCurrentEta(calculateEtaFormatted(routeData.distanceKm, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(vehicleConfig.baseSpeedKmH * simSpeed);
    }
  };

  const handleSpeedChange = (spd) => {
    setSimSpeed(spd);
    setCurrentSpeed(Math.round(vehicleConfig.baseSpeedKmH * spd));
  };

  // Manejo de teclado (Escape cierra el modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes gpsPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .tabular-nums {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
      `}</style>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1080px',
          height: '92vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* HEADER MODAL */}
        <div
          style={{
            padding: '14px 20px',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}
            >
              🛰️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Seguimiento GPS en Tiempo Real
                </h3>
                <span
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  {order?.id || 'ORD-DEMO'}
                </span>
                <span
                  style={{
                    background: isCompleted ? '#059669' : '#d97706',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  {isCompleted ? '✓ ENTREGADO' : 'EN RUTA'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Ruta activa: San Isidro (Almacén) ➔ {destinationInfo?.address || 'Destino del Cliente'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '22px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = '#334155'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* PANEL DE CONTROL SUPERIOR: SELECTOR DE VEHÍCULO Y CONTROLES */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Selector de Vehículo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Transporte:
            </span>
            <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
              {Object.values(VEHICLES).map((veh) => {
                const isSelected = selectedVehicle === veh.id;
                return (
                  <button
                    key={veh.id}
                    onClick={() => setSelectedVehicle(veh.id)}
                    style={{
                      border: 'none',
                      background: isSelected ? '#0284c7' : 'transparent',
                      color: isSelected ? '#ffffff' : '#334155',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    title={`${veh.tag} - ${veh.baseSpeedKmH} km/h base`}
                  >
                    <span>{veh.icon}</span>
                    <span>{veh.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controles de Simulación (Play, Reset, Velocidad) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              style={{
                border: '1px solid #cbd5e1',
                background: isPlaying ? '#ffffff' : '#0284c7',
                color: isPlaying ? '#0f172a' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isCompleted ? '🔄 Repetir' : isPlaying ? '⏸️ Pausar' : '▶️ Reanudar'}
            </button>

            {/* Reiniciar */}
            <button
              onClick={handleResetRoute}
              style={{
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Volver al Almacén San Isidro"
            >
              🔄 Reiniciar
            </button>

            {/* Selector de Velocidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Simulador:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: simSpeed === spd ? '#0f172a' : '#ffffff',
                    color: simSpeed === spd ? '#ffffff' : '#334155',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BARRA DE TELEMETRÍA EN VIVO */}
        <div
          style={{
            padding: '10px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          {/* Distancia Restante */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Distancia Restante
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {isLoadingRoute ? '--' : `${remainingKm.toFixed(2)} km`}
            </div>
          </div>

          {/* Tiempo Estimado (ETA) */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Tiempo Estimado (ETA)
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
              {isLoadingRoute ? '--:--' : currentEta}
            </div>
          </div>

          {/* Velocidad Actual */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Velocidad Simulada
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
              {currentSpeed} km/h
            </div>
          </div>

          {/* Progreso del Despacho */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <span>Progreso de Ruta</span>
              <span className="tabular-nums" style={{ color: isCompleted ? '#059669' : '#0284c7' }}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: isCompleted ? '#059669' : '#0284c7',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>
        </div>

        {/* ALERTA DE ENTREGA COMPLETADA */}
        {isCompleted && (
          <div
            style={{
              padding: '10px 20px',
              background: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🎉 ¡Pedido Entregado con Éxito en destino! Despacho completado por {vehicleConfig.label}.</span>
            <button
              onClick={handleResetRoute}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Simular de Nuevo
            </button>
          </div>
        )}

        {/* CONTENEDOR DEL MAPA LEAFLET */}
        <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '360px' }}>
          {isLoadingRoute && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '32px' }}>🛰️</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Trazando ruta por calles reales de Lima (OSRM)...
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Conectando Almacén Central San Isidro con {destinationInfo?.address || 'Destino'}
              </div>
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* FOOTER INFORMATIVO */}
        <div
          style={{
            padding: '10px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div>
            <strong>Punto Fijo:</strong> San Isidro (-12.0969, -77.0354) | <strong>Destino:</strong> {destinationInfo?.address || 'Cargando...'}
          </div>
          <div>
            <span>Motor: <strong>OSRM + Carto Voyager</strong> | Cobertura: <strong>Perú (`countrycodes=pe`)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
