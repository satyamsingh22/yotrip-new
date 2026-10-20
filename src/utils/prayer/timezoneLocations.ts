/**
 * IANA timezone → representative city and coordinates.
 *
 * Lets the homepage show a traveller their own city's prayer times instantly:
 * no permission prompt, no geolocation API, no network round-trip. City-centre
 * coordinates are accurate to a minute or two of prayer time, which is all the
 * marketing card claims; the "use my location" affordance refines it.
 */

export type TimeZoneLocation = { city: string; latitude: number; longitude: number };

export type ResolvedLocation = TimeZoneLocation & { timeZone: string };

export const TIMEZONE_LOCATIONS: Record<string, TimeZoneLocation> = {
  // Middle East — YoTrip's home market
  "Asia/Riyadh": { city: "Riyadh", latitude: 24.7136, longitude: 46.6753 },
  "Asia/Mecca": { city: "Makkah", latitude: 21.4225, longitude: 39.8262 },
  "Asia/Dubai": { city: "Dubai", latitude: 25.2048, longitude: 55.2708 },
  "Asia/Muscat": { city: "Muscat", latitude: 23.588, longitude: 58.3829 },
  "Asia/Qatar": { city: "Doha", latitude: 25.2854, longitude: 51.531 },
  "Asia/Bahrain": { city: "Manama", latitude: 26.2285, longitude: 50.586 },
  "Asia/Kuwait": { city: "Kuwait City", latitude: 29.3759, longitude: 47.9774 },
  "Asia/Baghdad": { city: "Baghdad", latitude: 33.3152, longitude: 44.3661 },
  "Asia/Amman": { city: "Amman", latitude: 31.9454, longitude: 35.9284 },
  "Asia/Beirut": { city: "Beirut", latitude: 33.8938, longitude: 35.5018 },
  "Asia/Damascus": { city: "Damascus", latitude: 33.5138, longitude: 36.2765 },
  "Asia/Jerusalem": { city: "Jerusalem", latitude: 31.7683, longitude: 35.2137 },
  "Asia/Gaza": { city: "Gaza", latitude: 31.5017, longitude: 34.4668 },
  "Asia/Hebron": { city: "Hebron", latitude: 31.5326, longitude: 35.0998 },
  "Asia/Tehran": { city: "Tehran", latitude: 35.6892, longitude: 51.389 },
  "Asia/Aden": { city: "Aden", latitude: 12.7855, longitude: 45.0187 },
  "Asia/Nicosia": { city: "Nicosia", latitude: 35.1856, longitude: 33.3823 },
  "Europe/Istanbul": { city: "Istanbul", latitude: 41.0082, longitude: 28.9784 },

  // South Asia
  "Asia/Kolkata": { city: "Delhi", latitude: 28.6139, longitude: 77.209 },
  "Asia/Calcutta": { city: "Delhi", latitude: 28.6139, longitude: 77.209 },
  "Asia/Karachi": { city: "Karachi", latitude: 24.8607, longitude: 67.0011 },
  "Asia/Dhaka": { city: "Dhaka", latitude: 23.8103, longitude: 90.4125 },
  "Asia/Colombo": { city: "Colombo", latitude: 6.9271, longitude: 79.8612 },
  "Asia/Kathmandu": { city: "Kathmandu", latitude: 27.7172, longitude: 85.324 },
  "Asia/Kabul": { city: "Kabul", latitude: 34.5553, longitude: 69.2075 },
  "Indian/Maldives": { city: "Malé", latitude: 4.1755, longitude: 73.5093 },

  // South-east & east Asia
  "Asia/Jakarta": { city: "Jakarta", latitude: -6.2088, longitude: 106.8456 },
  "Asia/Makassar": { city: "Makassar", latitude: -5.1477, longitude: 119.4327 },
  "Asia/Kuala_Lumpur": { city: "Kuala Lumpur", latitude: 3.139, longitude: 101.6869 },
  "Asia/Singapore": { city: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  "Asia/Brunei": { city: "Bandar Seri Begawan", latitude: 4.9031, longitude: 114.9398 },
  "Asia/Bangkok": { city: "Bangkok", latitude: 13.7563, longitude: 100.5018 },
  "Asia/Ho_Chi_Minh": { city: "Ho Chi Minh City", latitude: 10.8231, longitude: 106.6297 },
  "Asia/Manila": { city: "Manila", latitude: 14.5995, longitude: 120.9842 },
  "Asia/Hong_Kong": { city: "Hong Kong", latitude: 22.3193, longitude: 114.1694 },
  "Asia/Shanghai": { city: "Shanghai", latitude: 31.2304, longitude: 121.4737 },
  "Asia/Tokyo": { city: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  "Asia/Seoul": { city: "Seoul", latitude: 37.5665, longitude: 126.978 },
  "Asia/Taipei": { city: "Taipei", latitude: 25.033, longitude: 121.5654 },

  // Central Asia & Caucasus
  "Asia/Tashkent": { city: "Tashkent", latitude: 41.2995, longitude: 69.2401 },
  "Asia/Almaty": { city: "Almaty", latitude: 43.222, longitude: 76.8512 },
  "Asia/Baku": { city: "Baku", latitude: 40.4093, longitude: 49.8671 },
  "Asia/Tbilisi": { city: "Tbilisi", latitude: 41.7151, longitude: 44.8271 },
  "Asia/Yerevan": { city: "Yerevan", latitude: 40.1792, longitude: 44.4991 },
  "Asia/Bishkek": { city: "Bishkek", latitude: 42.8746, longitude: 74.5698 },
  "Asia/Dushanbe": { city: "Dushanbe", latitude: 38.5598, longitude: 68.787 },
  "Asia/Ashgabat": { city: "Ashgabat", latitude: 37.9601, longitude: 58.3261 },

  // Africa
  "Africa/Cairo": { city: "Cairo", latitude: 30.0444, longitude: 31.2357 },
  "Africa/Casablanca": { city: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
  "Africa/Algiers": { city: "Algiers", latitude: 36.7538, longitude: 3.0588 },
  "Africa/Tunis": { city: "Tunis", latitude: 36.8065, longitude: 10.1815 },
  "Africa/Tripoli": { city: "Tripoli", latitude: 32.8872, longitude: 13.1913 },
  "Africa/Khartoum": { city: "Khartoum", latitude: 15.5007, longitude: 32.5599 },
  "Africa/Lagos": { city: "Lagos", latitude: 6.5244, longitude: 3.3792 },
  "Africa/Accra": { city: "Accra", latitude: 5.6037, longitude: -0.187 },
  "Africa/Dakar": { city: "Dakar", latitude: 14.7167, longitude: -17.4677 },
  "Africa/Nairobi": { city: "Nairobi", latitude: -1.2921, longitude: 36.8219 },
  "Africa/Addis_Ababa": { city: "Addis Ababa", latitude: 9.032, longitude: 38.7469 },
  "Africa/Mogadishu": { city: "Mogadishu", latitude: 2.0469, longitude: 45.3182 },
  "Africa/Dar_es_Salaam": { city: "Dar es Salaam", latitude: -6.7924, longitude: 39.2083 },
  "Africa/Kampala": { city: "Kampala", latitude: 0.3476, longitude: 32.5825 },
  "Africa/Johannesburg": { city: "Johannesburg", latitude: -26.2041, longitude: 28.0473 },

  // Europe
  "Europe/London": { city: "London", latitude: 51.5074, longitude: -0.1278 },
  "Europe/Dublin": { city: "Dublin", latitude: 53.3498, longitude: -6.2603 },
  "Europe/Paris": { city: "Paris", latitude: 48.8566, longitude: 2.3522 },
  "Europe/Berlin": { city: "Berlin", latitude: 52.52, longitude: 13.405 },
  "Europe/Madrid": { city: "Madrid", latitude: 40.4168, longitude: -3.7038 },
  "Europe/Lisbon": { city: "Lisbon", latitude: 38.7223, longitude: -9.1393 },
  "Europe/Rome": { city: "Rome", latitude: 41.9028, longitude: 12.4964 },
  "Europe/Amsterdam": { city: "Amsterdam", latitude: 52.3676, longitude: 4.9041 },
  "Europe/Brussels": { city: "Brussels", latitude: 50.8503, longitude: 4.3517 },
  "Europe/Zurich": { city: "Zurich", latitude: 47.3769, longitude: 8.5417 },
  "Europe/Vienna": { city: "Vienna", latitude: 48.2082, longitude: 16.3738 },
  "Europe/Prague": { city: "Prague", latitude: 50.0755, longitude: 14.4378 },
  "Europe/Warsaw": { city: "Warsaw", latitude: 52.2297, longitude: 21.0122 },
  "Europe/Budapest": { city: "Budapest", latitude: 47.4979, longitude: 19.0402 },
  "Europe/Bucharest": { city: "Bucharest", latitude: 44.4268, longitude: 26.1025 },
  "Europe/Sofia": { city: "Sofia", latitude: 42.6977, longitude: 23.3219 },
  "Europe/Athens": { city: "Athens", latitude: 37.9838, longitude: 23.7275 },
  "Europe/Sarajevo": { city: "Sarajevo", latitude: 43.8563, longitude: 18.4131 },
  "Europe/Belgrade": { city: "Belgrade", latitude: 44.7866, longitude: 20.4489 },
  "Europe/Tirane": { city: "Tirana", latitude: 41.3275, longitude: 19.8187 },
  "Europe/Skopje": { city: "Skopje", latitude: 41.9981, longitude: 21.4254 },
  "Europe/Copenhagen": { city: "Copenhagen", latitude: 55.6761, longitude: 12.5683 },
  "Europe/Stockholm": { city: "Stockholm", latitude: 59.3293, longitude: 18.0686 },
  "Europe/Oslo": { city: "Oslo", latitude: 59.9139, longitude: 10.7522 },
  "Europe/Helsinki": { city: "Helsinki", latitude: 60.1699, longitude: 24.9384 },
  "Europe/Moscow": { city: "Moscow", latitude: 55.7558, longitude: 37.6173 },
  "Europe/Kyiv": { city: "Kyiv", latitude: 50.4501, longitude: 30.5234 },
  "Europe/Kiev": { city: "Kyiv", latitude: 50.4501, longitude: 30.5234 },
  "Atlantic/Reykjavik": { city: "Reykjavik", latitude: 64.1466, longitude: -21.9426 },

  // Americas
  "America/New_York": { city: "New York", latitude: 40.7128, longitude: -74.006 },
  "America/Toronto": { city: "Toronto", latitude: 43.6532, longitude: -79.3832 },
  "America/Chicago": { city: "Chicago", latitude: 41.8781, longitude: -87.6298 },
  "America/Denver": { city: "Denver", latitude: 39.7392, longitude: -104.9903 },
  "America/Los_Angeles": { city: "Los Angeles", latitude: 34.0522, longitude: -118.2437 },
  "America/Vancouver": { city: "Vancouver", latitude: 49.2827, longitude: -123.1207 },
  "America/Mexico_City": { city: "Mexico City", latitude: 19.4326, longitude: -99.1332 },
  "America/Bogota": { city: "Bogotá", latitude: 4.711, longitude: -74.0721 },
  "America/Lima": { city: "Lima", latitude: -12.0464, longitude: -77.0428 },
  "America/Sao_Paulo": { city: "São Paulo", latitude: -23.5505, longitude: -46.6333 },
  "America/Argentina/Buenos_Aires": {
    city: "Buenos Aires",
    latitude: -34.6037,
    longitude: -58.3816,
  },
  "America/Santiago": { city: "Santiago", latitude: -33.4489, longitude: -70.6693 },

  // Oceania
  "Australia/Sydney": { city: "Sydney", latitude: -33.8688, longitude: 151.2093 },
  "Australia/Melbourne": { city: "Melbourne", latitude: -37.8136, longitude: 144.9631 },
  "Australia/Brisbane": { city: "Brisbane", latitude: -27.4698, longitude: 153.0251 },
  "Australia/Perth": { city: "Perth", latitude: -31.9505, longitude: 115.8605 },
  "Pacific/Auckland": { city: "Auckland", latitude: -36.8485, longitude: 174.7633 },
};

/** Coordinates for a browser timezone, or null when the zone is not in the table. */
export const resolveLocationFromTimeZone = (timeZone: string): ResolvedLocation | null => {
  const entry = timeZone ? TIMEZONE_LOCATIONS[timeZone] : undefined;
  return entry ? { ...entry, timeZone } : null;
};
