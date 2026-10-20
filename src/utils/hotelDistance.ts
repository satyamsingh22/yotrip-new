const MILES_TO_KM = 1.609344;
const EARTH_RADIUS_KM = 6371;

export type HotelDistanceSource = {
  distance?: number | string | null;
  provider?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
  } | null;
};

export type CityCoords = {
  lat?: number | string | null;
  lng?: number | string | null;
};

const toCoord = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function hotelLatLng(
  hotel?: HotelDistanceSource | null,
): { lat: number; lng: number } | null {
  const lat = toCoord(hotel?.latitude ?? hotel?.address?.latitude);
  const lng = toCoord(hotel?.longitude ?? hotel?.address?.longitude);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

/**
 * Sabre search is requested in miles (`UOM: "MI"`). Tripjack catalog
 * distance is already kilometres (haversine). Details payloads omit
 * `distance`, so fall back to hotel coords vs the searched city.
 */
export function hotelDistanceKm(
  hotel?: HotelDistanceSource | null,
  city?: CityCoords | null,
): number | null {
  const raw = Number(hotel?.distance);
  if (Number.isFinite(raw) && raw >= 0) {
    if (String(hotel?.provider || "").toLowerCase() === "sabre") {
      return raw * MILES_TO_KM;
    }
    return raw;
  }

  const coords = hotelLatLng(hotel);
  const cityLat = toCoord(city?.lat);
  const cityLng = toCoord(city?.lng);
  if (!coords || cityLat == null || cityLng == null) return null;
  return haversineKm(cityLat, cityLng, coords.lat, coords.lng);
}

/** One decimal, trimmed (`2.5`, `8`, `0.3`). */
export function formatDistanceKm(km: number): string {
  const rounded = Math.round(km * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export const CITY_CENTER_KM = 0.2;
