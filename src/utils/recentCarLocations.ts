import type { CarLocationOption } from "./carLocations";

const STORAGE_KEY = "yotrip_recent_car_locations";
const MAX_RECENT = 6;

export function getRecentCarLocations(): CarLocationOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentCarLocation(location: CarLocationOption): void {
  if (!location?.id) return;
  try {
    const existing = getRecentCarLocations().filter((item) => item.id !== location.id);
    const next = [location, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
}
