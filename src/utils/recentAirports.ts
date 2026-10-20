import type { AirportOption } from "./airports";

const STORAGE_KEY = "yotrip_recent_airports";
const MAX_RECENT = 6;

export function getRecentAirports(): AirportOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentAirport(airport: AirportOption): void {
  if (!airport?.value) return;
  try {
    const existing = getRecentAirports().filter(
      (a) => a.value !== airport.value,
    );
    const next = [airport, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
}
