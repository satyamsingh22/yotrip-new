import type { HotelCityRecord } from "./hotelCitySearch";

// Recently selected hotel cities, persisted to localStorage.
// Mirrors recentAirports.ts (flight search).

const STORAGE_KEY = "yotrip_recent_hotel_cities";
const MAX_RECENT = 6;

export function getRecentHotelCities(): HotelCityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentHotelCity(city: HotelCityRecord): void {
  if (!city?.id) return;
  try {
    const existing = getRecentHotelCities().filter((c) => c.id !== city.id);
    const next = [city, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
}
