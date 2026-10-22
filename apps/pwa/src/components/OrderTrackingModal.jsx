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

  const [selectedVehicle, setSelectedVehicle] = useState(order?.vehicle || order?.defaultVehicle || 'moto');
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  const [routeData, setRouteData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [remainingKm, setRemainingKm] = useState(0);
  const [currentEta, setCurrentEta] = useState('--:--');
  const [currentSpeed, setCurrentSpeed] = useState(VEHICLES.moto.baseSpeedKmH);
  const [destinationInfo, setDestinationInfo] = useState(null);

  const vehicleConfig = VEHICLES[selectedVehicle] || VEHICLES.moto;

  useEffect(() => {
    let isCancelled = false;

    async function initTracking() {
      setIsLoadingRoute(true);
      setIsCompleted(false);
      setProgress(0);

      const L = await loadLeaflet();
      if (isCancelled || !mapContainerRef.current) return;

      const destAddress = order?.deliveryAddress || order?.clientAddress || order?.address || 'Av. Larco 450, Miraflores, Lima';
      const destCoords = order?.deliveryCoords || await geocodeAddress(destAddress);
      
      if (isCancelled) return;
      setDestinationInfo({
        name: order?.clientName || 'Cliente PWA',
        address: destCoords.name || destAddress,
        coords: destCoords
      });

      const start = { lat: CENTRAL_WAREHOUSE.lat, lng: CENTRAL_WAREHOUSE.lng };
      const dest = { lat: destCoords.lat, lng: destCoords.lng };
      const route = await getStreetRoute(start, dest);

      if (isCancelled) return;
      setRouteData(route);
      setRemainingKm(route.distanceKm);
      setCurrentEta(calculateEtaFormatted(route.distanceKm, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(vehicleConfig.baseSpeedKmH);
      setIsLoadingRoute(false);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        maxBounds: PERU_BOUNDS,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: false
      });
      // Move zoom control to bottom right for mobile friendliness
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer(TILE_CONFIG.cartoVoyager, {
        attribution: TILE_CONFIG.attribution,
        maxZoom: 19
      });

      tileLayer.on('tileerror', () => {
        tileLayer.setUrl(TILE_CONFIG.cartoPositronFallback);
      });
      tileLayer.addTo(map);

      const warehouseIcon = L.divIcon({
        className: 'gps-custom-pin',
        html: `
          <div style="background:#1e293b; color:#f8fafc; border:2px solid #38bdf8; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3); font-size:16px;">
            🏭
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const clientIcon = L.divIcon({
        className: 'gps-custom-pin',
        html: `
          <div style="background:#b45309; color:#ffffff; border:2px solid #fef08a; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3); font-size:16px;">
            📍
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([start.lat, start.lng], { icon: warehouseIcon }).addTo(map)
        .bindPopup(`<b>${CENTRAL_WAREHOUSE.name}</b><br/>Av. Rivera Navarrete 501, San Isidro`);

      L.marker([dest.lat, dest.lng], { icon: clientIcon }).addTo(map)
        .bindPopup(`<b>Destino:</b><br/>${destCoords.name || destAddress}`);

      const routeLine = L.polyline(route.points, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routePolylineRef.current = routeLine;

      const traveledLine = L.polyline([route.points[0]], {
        color: '#10b981',
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      traveledPolylineRef.current = traveledLine;

      map.fitBounds(routeLine.getBounds(), { padding: [35, 35] });

      const initialPos = route.points[0];
      const vehicleIcon = createVehicleDivIcon(L, vehicleConfig.icon);
      const vehicleMarker = L.marker(initialPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      vehicleMarkerRef.current = vehicleMarker;
      vehicleMarker.bindTooltip(`<b>${vehicleConfig.label}</b>`, { direction: 'top', offset: [0, -14] });
    }

    initTracking();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order]);

  function createVehicleDivIcon(L, iconEmoji) {
    return L.divIcon({
      className: 'gps-vehicle-marker',
      html: `
        <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(2,132,199,0.3); animation:gpsPulse 2s infinite ease-out;"></div>
          <div style="width:32px; height:32px; border-radius:50%; background:#ffffff; border:2px solid #0284c7; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 3px 8px rgba(0,0,0,0.25); z-index:2;">
            ${iconEmoji}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  useEffect(() => {
    if (!window.L || !vehicleMarkerRef.current) return;
    const icon = createVehicleDivIcon(window.L, vehicleConfig.icon);
    vehicleMarkerRef.current.setIcon(icon);

    if (routeData) {
      const remainingDistance = routeData.distanceKm * (1 - progress / 100);
      setCurrentEta(calculateEtaFormatted(remainingDistance, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(vehicleConfig.baseSpeedKmH * simSpeed);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (!isPlaying || !routeData || isCompleted) return;

    let localProgress = progress;
    lastTimeRef.current = performance.now();

    const points = routeData.points;
    const totalPoints = points.length;
    if (totalPoints < 2) return;

    const baseDurationMs = 28000;
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

        const finalPoint = points[points.length - 1];
        if (vehicleMarkerRef.current && finalPoint) vehicleMarkerRef.current.setLatLng(finalPoint);
        if (traveledPolylineRef.current) traveledPolylineRef.current.setLatLngs(points);
        return;
      }

      setProgress(localProgress);

      const floatIndex = Math.max(0, Math.min(totalPoints - 1, (localProgress / 100) * (totalPoints - 1)));
      const lowIndex = Math.max(0, Math.min(totalPoints - 1, Math.floor(floatIndex)));
      const highIndex = Math.max(0, Math.min(totalPoints - 1, lowIndex + 1));
      const t = floatIndex - lowIndex;

      const p1 = points[lowIndex] || points[0];
      const p2 = points[highIndex] || p1;
      const currentLat = p1[0] + (p2[0] - p1[0]) * t;
      const currentLng = p1[1] + (p2[1] - p1[1]) * t;
      const currentPos = [currentLat, currentLng];

      if (vehicleMarkerRef.current) vehicleMarkerRef.current.setLatLng(currentPos);
      if (traveledPolylineRef.current) {
        const coveredPoints = points.slice(0, lowIndex + 1);
        coveredPoints.push(currentPos);
        traveledPolylineRef.current.setLatLngs(coveredPoints);
      }

      const remDistance = Number((routeData.distanceKm * (1 - localProgress / 100)).toFixed(2));
      setRemainingKm(remDistance);
      setCurrentEta(calculateEtaFormatted(remDistance, vehicleConfig.baseSpeedKmH));
      setCurrentSpeed(Math.round(vehicleConfig.baseSpeedKmH * simSpeed));

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, routeData, isCompleted, simSpeed, selectedVehicle]);

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
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
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
          maxWidth: '540px',
          height: '92vh',
          maxHeight: '740px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* HEADER PWA */}
        <div
          style={{
            padding: '12px 16px',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🛵</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc' }}>
                  GPS Delivery en Vivo
                </span>
                <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '12px' }}>
                  {order?.id || 'ORDEN'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Destino: {destinationInfo?.address || 'Cargando...'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* SELECTOR DE VEHÍCULO */}
        <div
          style={{
            padding: '8px 12px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {Object.values(VEHICLES).map((veh) => (
              <button
                key={veh.id}
                onClick={() => setSelectedVehicle(veh.id)}
                style={{
                  border: 'none',
                  background: selectedVehicle === veh.id ? '#0284c7' : '#e2e8f0',
                  color: selectedVehicle === veh.id ? '#ffffff' : '#334155',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{veh.icon}</span>
                <span>{veh.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* SIMULATION MULTIPLIER & CONTROLS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleTogglePlay}
              style={{
                border: '1px solid #cbd5e1',
                background: isPlaying ? '#ffffff' : '#0284c7',
                color: isPlaying ? '#0f172a' : '#ffffff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isCompleted ? '🔄' : isPlaying ? '⏸️' : '▶️'}
            </button>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                style={{
                  border: '1px solid #cbd5e1',
                  background: simSpeed === spd ? '#0f172a' : '#ffffff',
                  color: simSpeed === spd ? '#ffffff' : '#334155',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* TELEMETRÍA */}
        <div
          style={{
            padding: '8px 12px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>DISTANCIA</div>
            <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              {isLoadingRoute ? '--' : `${remainingKm.toFixed(1)} km`}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>LLEGADA (ETA)</div>
            <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7' }}>
              {isLoadingRoute ? '--:--' : currentEta}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>VELOCIDAD</div>
            <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706' }}>
              {currentSpeed} km/h
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={{ width: '100%', height: '4px', background: '#f1f5f9' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: isCompleted ? '#059669' : '#0284c7',
              transition: 'width 0.1s linear'
            }}
          />
        </div>

        {isCompleted && (
          <div style={{ padding: '6px 12px', background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }}>
            🎉 ¡Pedido entregado en tu dirección!
          </div>
        )}

        {/* MAPA */}
        <div style={{ flex: 1, position: 'relative', width: '100%' }}>
          {isLoadingRoute && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '24px' }}>🛰️</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Calculando ruta OSRM...</div>
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
}
