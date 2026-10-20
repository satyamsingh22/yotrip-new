// ---------------------------------------------------------------------------
// Popular Destinations quick-pick chips (Flight "From" / "To" dropdown)
//
// Edit this list to control which destinations show up as chips when the
// airport dropdown is opened with no search term. Use IATA codes (3 letters).
// Any code not found in airports.json is silently skipped, so it's safe to
// add/remove freely. Order here = order shown on screen.
// ---------------------------------------------------------------------------

export const POPULAR_AIRPORT_CODES: string[] = [
  // India
  "DEL", // New Delhi
  "BOM", // Mumbai
  "BLR", // Bangalore
  "MAA", // Chennai
  "HYD", // Hyderabad
  "COK", // Kochi

  // Saudi Arabia
  "RUH", // Riyadh
  "JED", // Jeddah
  "DMM", // Dammam
  "MED", // Medina
  "AHB", // Abha
  "TUU", // Tabuk
  "ELQ", // Buraidah (Qassim)
  "GIZ", // Jizan
  "YNB", // Yanbu
  "TIF", // Ta'if

  // Gulf / Middle East
  "DXB", // Dubai
  "AUH", // Abu Dhabi
  "DOH", // Doha

  // International
  "SIN", // Singapore
  "BKK", // Bangkok
  "LHR", // London
  "JFK", // New York
  "CDG", // Paris
];
