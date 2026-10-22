# 🛰️ Prompt Maestro: Implementación de Módulo de Seguimiento GPS Satelital en Tiempo Real

> **Instrucción de uso**: Copia y pega el siguiente prompt en cualquier proyecto web (React, Astro, Vue, Next.js o Vanilla JS) para implementar un sistema integral de simulación y seguimiento GPS satelital de pedidos de alta fidelidad, con ruteo vial real, telemetría en vivo y soporte multidispositivo.

---

```markdown
Actúa como un Ingeniero Frontend Senior y Especialista en Sistemas de Información Geográfica (GIS). Necesito que diseñes e implementes un **Módulo Completo de Seguimiento Satelital GPS en Tiempo Real** para el seguimiento y tracking de entregas/pedidos a domicilio.

La solución debe ser completamente operativa en frontend (zero-backend dependency para la simulación), visualmente impactante ("Gourmet/Premium UI"), ultra fluida y resiliente ante caídas de red o fallos de geocodificación.

---

### 🗺️ 1. Pila Tecnológica & Servicios Cartográficos
1. **Librería de Mapas**: Leaflet.js (v1.9.4). Incluir estilos CSS y scripts oficiales (o vía npm si es SPA).
2. **Capa de Mosaicos (Tiles)**: 
   - Principal: Carto Voyager (`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4pm2_1_200f6c4d689008428bc823c8`) con `maxZoom: 19`.
   - Fallback 1: Carto Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`).
   - Fallback 2: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
3. **Geocodificación Automática**:
   - Servicio: Nominatim OpenStreetMap (`https://nominatim.openstreetmap.org/search?q={direccion}&countrycodes={codigo_pais}&format=json&limit=1`).
   - Requisito de seguridad: `AbortController` con timeout de 2.5 segundos.
   - Fallback determinista: Si Nominatim no responde o no encuentra la dirección, resolver a coordenadas predeterminadas de la ciudad objetivo sin detener la aplicación.
4. **Cálculo de Ruteo Vial Real**:
   - Servicio: OSRM Public Driving API (`https://router.project-osrm.org/route/v1/driving/{origen_lng},{origen_lat};{destino_lng},{destino_lat}?overview=full&geometries=geojson`).
   - Rápido timeout de 3.5 segundos con `AbortController`.
   - Fallback de trazado geométrico: Si OSRM falla, generar una ruta polinómica curvada urbana realista de al menos 40 puntos entre origen y destino para garantizar que la simulación nunca se bloquee.

---

### 📍 2. Parámetros Geográficos & Límites
- **Punto de Origen Fijo (Almacén / Tienda)**: Definir coordenadas fijas representativas (ej. `-12.0969, -77.0354` en San Isidro, Lima).
- **Límites Territoriales (Bounding Box)**: Restringir el mapa con `maxBounds: [[latMin, lngMin], [latMax, lngMax]]` y `minZoom: 6` para evitar que el usuario se desplace fuera del territorio nacional/regional.
- **Trazado de Polilíneas**:
  - Ruta Total Planificada: Polilínea azul azure (`#0284c7`, grosor: 4px, opacidad: 0.85).
  - Tramo Recorrido en Tiempo Real: Polilínea verde esmeralda dinámica (`#10b981`, grosor: 4px) que avanza sincrónicamente con el vehículo.

---

### 🛵 3. Física de Simulación, Vehículos & Telemetría
1. **Selector de Vehículos Activo**:
   - 🛵 **Moto Reparto**: Velocidad base 45 km/h, icono distintivo, ETA más corto.
   - 🚗 **Auto Express**: Velocidad base 35 km/h, tráfico regular urbano.
   - 🚚 **Camión Logístico**: Velocidad base 25 km/h, traslados de mayor volumen.
2. **Motor de Animación por Delta de Tiempo (`requestAnimationFrame`)**:
   - Usar `performance.now()` para calcular `delta = time - lastTime`. La animación debe avanzar a la misma velocidad independientemente de la tasa de refresco del monitor (60Hz, 120Hz o 144Hz).
   - Multiplicador de Velocidad de Simulación: Controles interactivos `1x`, `2x` y `5x` para demos ágiles.
   - Controles de Flujo: Botón "Pausar / Reanudar", Botón "Reiniciar Trayecto", Botón "Repetir Ruta".
3. **HUD de Telemetría en Vivo (con `font-variant-numeric: tabular-nums`)**:
   - **Distancia Restante**: En kilómetros con 2 decimales (ej. `3.42 km`).
   - **ETA (Tiempo Estimado)**: Cuenta regresiva en formato `MM:SS`.
   - **Velocidad Actual**: En `km/h` ajustada según el multiplicador activo.
   - **Barra de Progreso**: Porcentaje del 0% al 100% con barra visual animada.
   - **Estado de Entrega**: Al alcanzar el 100%, cambiar el badge a `✓ ENTREGADO` y desplegar banner de confirmación con felicitaciones.

---

### 🛡️ 4. Reglas Críticas de Implementación (Anti-Bugs)
- **Trampa de Re-inicialización de Leaflet**: Antes de llamar a `L.map('mapElement')`, destruir la instancia anterior con `map.remove()` y limpiar el identificador interno del contenedor: `delete container._leaflet_id;` para evitar el error `Map container is already initialized`.
- **Ajuste de Dimensiones del Modal (`invalidateSize`)**: Inmediatamente tras abrir el modal y luego a los 250ms, ejecutar `map.invalidateSize()` para evitar baldosas grises causadas por transiciones CSS.
- **Trampa de Visibilidad CSS en Overlays**: Si el modal utiliza clases de opacidad (`.modal-overlay` con `opacity: 0; pointer-events: none;`), asegurarse de activar la clase `.active` que establezca `display: flex !important; opacity: 1 !important; pointer-events: auto !important; visibility: visible !important;`.
- **Protección de Índices de Coordenadas**: En el bucle de interpolación, verificar que `points[low]` y `points[high]` existan y sean números válidos antes de calcular `p1[0]` para evitar `TypeError: Cannot read properties of undefined (reading '0')`.
- **Accesibilidad y Salida Rápida**: Permitir cerrar el modal mediante botón de cierre `✕`, clic en el fondo oscuro exterior (`backdrop click`) y la tecla `Escape`.

---

### 🎨 5. Puntos de Entrada Sugeridos
1. **Navbar**: Botón interactivo píldora con ícono 🛰️, texto "Rastrear Pedido" y punto pulsante `• En Vivo`.
2. **Checkout / Confirmación de Compra**: Al completar un pedido en el carrito, abrir automáticamente el modal de seguimiento satelital contextualizado con el ID de la orden generada.
3. **Bandeja de Pedidos**: Botón "Ver Mapa / Rastrear" en cada tarjeta o fila de orden activa.
```
