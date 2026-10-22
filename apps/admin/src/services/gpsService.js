/**
 * Servicio de Rutas, Geocodificación y Seguimiento Satelital GPS
 * Específico para el territorio de Lima, Perú.
 */

export const CENTRAL_WAREHOUSE = {
  name: 'Almacén Central San Isidro',
  address: 'Av. Rivera Navarrete 501, San Isidro, Lima, Perú',
  lat: -12.0969,
  lng: -77.0354
};

export const PERU_BOUNDS = [
  [-18.35, -81.33], // Suroeste
  [-0.03, -68.65]   // Noreste
];

export const CARTO_API_KEY = 'cb1_4pm2_1_200f6c4d689008428bc823c8';

export const TILE_CONFIG = {
  cartoVoyager: `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
  cartoPositronFallback: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  osmFallback: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
};

export const VEHICLES = {
  moto: {
    id: 'moto',
    label: 'Moto Reparto',
    icon: '🛵',
    baseSpeedKmH: 45,
    tag: 'Ágil • Tráfico Ligero',
    desc: 'Mayor agilidad en avenidas estrechas y pasajes. Menor tiempo de llegada estimado (ETA).'
  },
  auto: {
    id: 'auto',
    label: 'Auto Express',
    icon: '🚗',
    baseSpeedKmH: 35,
    tag: 'Urbano Estándar',
    desc: 'Desplazamiento por vías principales y avenidas autorizadas de tráfico regular.'
  },
  camion: {
    id: 'camion',
    label: 'Camión Logístico',
    icon: '🚚',
    baseSpeedKmH: 25,
    tag: 'Carga Pesada',
    desc: 'Distribución mayorista con velocidad regulada y restricciones de tonelaje.'
  }
};

// Fallbacks deterministas en Lima Metropolitana para garantizar 100% de confiabilidad
export const LIMA_FALLBACK_LOCATIONS = [
  { match: /miraflores|larco|pardo|kennedy/i, name: 'Miraflores', lat: -12.1218, lng: -77.0298 },
  { match: /san borja|javier prado|aviaci[oó]n/i, name: 'San Borja', lat: -12.0864, lng: -77.0016 },
  { match: /surco|chacarilla|benavides|primavera/i, name: 'Santiago de Surco', lat: -12.1345, lng: -76.9823 },
  { match: /jes[uú]s mar[ií]a|salaverry|cuba/i, name: 'Jesús María', lat: -12.0782, lng: -77.0494 },
  { match: /san isidro|begonias|navarrete|canaval/i, name: 'San Isidro (Las Begonias)', lat: -12.0925, lng: -77.0287 },
  { match: /barranco|grau|pedro de osma/i, name: 'Barranco', lat: -12.1489, lng: -77.0210 },
  { match: /magdalena|brasil|sucre/i, name: 'Magdalena del Mar', lat: -12.0901, lng: -77.0706 },
  { match: /san miguel|la marina|universitaria/i, name: 'San Miguel', lat: -12.0776, lng: -77.0862 },
  { match: /molina|ra[uú]l ferrero|corregidor/i, name: 'La Molina', lat: -12.0841, lng: -76.9452 }
];

/**
 * Carga perezosa (lazy load) de Leaflet JS y CSS
 */
let leafletPromise = null;
export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window no disponible'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    // 1. Inyectar CSS si no existe
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // 2. Inyectar Script
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.crossOrigin = '';
    script.onload = () => {
      resolve(window.L);
    };
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error('No se pudo cargar la librería Leaflet'));
    };
    document.head.appendChild(script);
  });

  return leafletPromise;
}

/**
 * Geocodifica una dirección hacia coordenadas en Perú usando Nominatim con fallback determinista.
 */
export async function geocodeAddress(addressText) {
  if (!addressText) {
    return { ...LIMA_FALLBACK_LOCATIONS[0], isFallback: true };
  }

  // 1. Intentar consulta externa a Nominatim OSM (con timeout defensivo de 2.5s)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const query = encodeURIComponent(`${addressText}, Lima, Peru`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=pe&format=json&limit=1`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        // Validar que esté dentro de límites razonables de Perú
        if (lat >= -18.5 && lat <= -0.01 && lng >= -81.5 && lng <= -68.5) {
          return {
            name: data[0].display_name || addressText,
            lat,
            lng,
            isFallback: false
          };
        }
      }
    }
  } catch (err) {
    // Si falla o timeout, cae al sistema de contingencia
  }

  // 2. Fallback determinista inteligente basado en texto
  for (const loc of LIMA_FALLBACK_LOCATIONS) {
    if (loc.match.test(addressText)) {
      return {
        name: `${loc.name}, Lima`,
        lat: loc.lat,
        lng: loc.lng,
        isFallback: true
      };
    }
  }

  // Fallback por defecto: Miraflores
  return {
    name: addressText || 'Miraflores, Lima',
    lat: -12.1218,
    lng: -77.0298,
    isFallback: true
  };
}

/**
 * Obtiene la ruta por calles reales entre origen y destino mediante OSRM.
 * Si falla, genera una polilínea urbana realista interpolada.
 */
export async function getStreetRoute(start, dest) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM devuelve [lng, lat], Leaflet usa [lat, lng]
        const points = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const distanceKm = Number((route.distance / 1000).toFixed(2));
        const durationSec = Math.round(route.duration);

        return {
          points,
          distanceKm,
          durationSec,
          isSimulated: false
        };
      }
    }
  } catch (err) {
    // Continuar al generador de ruta simulada de alta fidelidad
  }

  // Generador de polilínea realista urbana interpolada con curvas de avenidas
  return generateInterpolatedUrbanRoute(start, dest);
}

/**
 * Genera una ruta por calles simuladas entre dos puntos de Lima
 */
function generateInterpolatedUrbanRoute(start, dest) {
  const points = [];
  const steps = 40;
  
  // Distancia euclidiana aproximada convertida a km
  const dLat = dest.lat - start.lat;
  const dLng = dest.lng - start.lng;
  const approxDistanceKm = Number((Math.sqrt(dLat * dLat + dLng * dLng) * 111).toFixed(2));
  const finalDistanceKm = Math.max(1.8, Number((approxDistanceKm * 1.35).toFixed(2))); // Factor de desvío de calles

  // Punto intermedio de quiebre urbano (avenidas Javier Prado / Vía Expresa / Arequipa)
  const midLat = (start.lat + dest.lat) / 2 + (dLng > 0 ? 0.004 : -0.004);
  const midLng = (start.lng + dest.lng) / 2 + (dLat > 0 ? -0.003 : 0.003);

  // Segmento 1: Almacén a punto medio
  const halfSteps = Math.floor(steps / 2);
  for (let i = 0; i <= halfSteps; i++) {
    const t = i / halfSteps;
    // Agrega micro-variaciones de calles reales
    const jitter = Math.sin(t * Math.PI) * 0.0006;
    const lat = start.lat + (midLat - start.lat) * t + jitter;
    const lng = start.lng + (midLng - start.lng) * t - jitter * 0.5;
    points.push([lat, lng]);
  }

  // Segmento 2: Punto medio a destino
  for (let i = 1; i <= halfSteps; i++) {
    const t = i / halfSteps;
    const jitter = Math.sin(t * Math.PI) * 0.0005;
    const lat = midLat + (dest.lat - midLat) * t - jitter;
    const lng = midLng + (dest.lng - midLng) * t + jitter * 0.5;
    points.push([lat, lng]);
  }

  // Duración estimada a velocidad media (35 km/h)
  const durationSec = Math.round((finalDistanceKm / 35) * 3600);

  return {
    points,
    distanceKm: finalDistanceKm,
    durationSec,
    isSimulated: true
  };
}

/**
 * Calcula ETA formateado MM:SS a partir de la distancia restante y la velocidad del vehículo.
 */
export function calculateEtaFormatted(remainingKm, speedKmH) {
  if (remainingKm <= 0.02) return '00:00';
  const effectiveSpeed = Math.max(10, speedKmH);
  const totalSeconds = Math.round((remainingKm / effectiveSpeed) * 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}
