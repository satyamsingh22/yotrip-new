// ---------------------------------------------------------------------------
// Popular Destinations quick-pick chips (Hotel city search dropdown)
//
// Edit this list to control which destinations show up as chips when the hotel
// city field is focused with no search term. Each entry is matched against
// cities500.json by { name, country } and resolved to the highest-population
// city for that pair. Names MUST match the spelling in cities500.json (not the
// user-facing label — that's handled by DISPLAY_ALIASES in hotelCitySearch.ts).
// Any entry that doesn't resolve is silently skipped, so it's safe to add/remove
// freely. Order here = order shown on screen.
//
// Mirrors the flight curation in popularDestinations.ts.
// ---------------------------------------------------------------------------

export interface PopularHotelCity {
  name: string; // exact name as stored in cities500.json
  country: string; // ISO-3166 alpha-2 country code
  // Optional inline coordinates. Present only for FOOTER_DESTINATIONS, so a footer
  // click can build a searchable city without fetching the 26 MB catalog. Kept
  // honest by the drift test in popularHotelDestinations.test.ts — never hand-edit
  // these without re-running it.
  lat?: number;
  lng?: number;
}

export const POPULAR_HOTEL_CITIES: PopularHotelCity[] = [
  // India
  { name: "Delhi", country: "IN" }, // shown as "Delhi" (metro, ~11M)
  { name: "Mumbai", country: "IN" },
  { name: "Bengaluru", country: "IN" }, // shown as "Bangalore"
  { name: "Chennai", country: "IN" },
  { name: "Hyderabad", country: "IN" },
  { name: "Kochi", country: "IN" },

  // Saudi Arabia
  { name: "Riyadh", country: "SA" },
  { name: "Jeddah", country: "SA" },
  { name: "Dammam", country: "SA" },
  { name: "Madinah", country: "SA" }, // shown as "Medina"
  { name: "Abha", country: "SA" },
  { name: "Tabuk", country: "SA" },
  { name: "Buraydah", country: "SA" },
  { name: "Jizan", country: "SA" },
  { name: "Yanbu", country: "SA" },
  { name: "Ta’if", country: "SA" }, // curly apostrophe — matches cities500.json

  // Gulf / Middle East
  { name: "Dubai", country: "AE" },
  { name: "Abu Dhabi", country: "AE" },
  { name: "Doha", country: "QA" },

  // International
  { name: "Singapore", country: "SG" },
  { name: "Bangkok", country: "TH" },
  { name: "London", country: "GB" },
  { name: "New York City", country: "US" }, // shown as "New York"
  { name: "Paris", country: "FR" },
];

// ---------------------------------------------------------------------------
// Destinations shown in the site footer.
//
// A curated subset of POPULAR_HOTEL_CITIES rather than a slice of it: that list
// is grouped by region, so its first six entries are all Indian. Every entry
// here MUST also appear in POPULAR_HOTEL_CITIES so both surfaces resolve the
// same way — enforced by popularHotelDestinations.test.ts.
//
// Names MUST match the spelling in cities500.json; user-facing labels come from
// getCityDisplayName() in utils/hotelCitySearch.ts.
// ---------------------------------------------------------------------------

export const FOOTER_DESTINATIONS: PopularHotelCity[] = [
  { name: "Riyadh", country: "SA", lat: 24.68773, lng: 46.72185 },
  { name: "Jeddah", country: "SA", lat: 21.49012, lng: 39.18624 },
  { name: "Dubai", country: "AE", lat: 25.07725, lng: 55.30927 },
  { name: "Delhi", country: "IN", lat: 28.65195, lng: 77.23149 },
  { name: "Mumbai", country: "IN", lat: 19.07283, lng: 72.88261 },
  { name: "London", country: "GB", lat: 51.50853, lng: -0.12574 },
];
