// Utilitários de geolocalização

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Distância em km entre dois pontos (fórmula de Haversine)
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Converte para número finito ou null (tolera string vinda do backend Java)
export function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : null;
}

// Formata um par de coordenadas; retorna null se qualquer uma for inválida
export function formatCoords(lat: unknown, lon: unknown): string | null {
  const a = toFiniteNumber(lat);
  const b = toFiniteNumber(lon);
  if (a == null || b == null) return null;
  return `${a.toFixed(5)}, ${b.toFixed(5)}`;
}

// Formata distância para exibição (m abaixo de 1 km, senão km)
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
