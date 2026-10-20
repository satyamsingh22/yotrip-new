/**
 * Cities a traveller can pick by hand.
 *
 * The timezone map gets most visitors placed automatically, but it cannot help
 * someone on a VPN, someone planning a trip, or anyone in a country with one
 * timezone and several cities worth naming — Jeddah and Madinah both resolve to
 * Asia/Riyadh. This list fills that gap. It is weighted towards the places this
 * page's audience actually asks about rather than trying to be a gazetteer.
 *
 * Deliberately not derived from data/airports.json: that file is 3 MB and holds
 * airport names, which make poor city-search results.
 */

export type City = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

export const CITIES: City[] = [
  // Saudi Arabia — several cities, one timezone
  { city: "Makkah", country: "Saudi Arabia", latitude: 21.4225, longitude: 39.8262, timeZone: "Asia/Riyadh" },
  { city: "Madinah", country: "Saudi Arabia", latitude: 24.5247, longitude: 39.5692, timeZone: "Asia/Riyadh" },
  { city: "Riyadh", country: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, timeZone: "Asia/Riyadh" },
  { city: "Jeddah", country: "Saudi Arabia", latitude: 21.4858, longitude: 39.1925, timeZone: "Asia/Riyadh" },
  { city: "Dammam", country: "Saudi Arabia", latitude: 26.3927, longitude: 49.9777, timeZone: "Asia/Riyadh" },
  { city: "Taif", country: "Saudi Arabia", latitude: 21.2703, longitude: 40.4158, timeZone: "Asia/Riyadh" },
  { city: "Abha", country: "Saudi Arabia", latitude: 18.2164, longitude: 42.5053, timeZone: "Asia/Riyadh" },
  { city: "Tabuk", country: "Saudi Arabia", latitude: 28.3835, longitude: 36.5662, timeZone: "Asia/Riyadh" },

  // Gulf
  { city: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, timeZone: "Asia/Dubai" },
  { city: "Abu Dhabi", country: "United Arab Emirates", latitude: 24.4539, longitude: 54.3773, timeZone: "Asia/Dubai" },
  { city: "Sharjah", country: "United Arab Emirates", latitude: 25.3463, longitude: 55.4209, timeZone: "Asia/Dubai" },
  { city: "Doha", country: "Qatar", latitude: 25.2854, longitude: 51.531, timeZone: "Asia/Qatar" },
  { city: "Kuwait City", country: "Kuwait", latitude: 29.3759, longitude: 47.9774, timeZone: "Asia/Kuwait" },
  { city: "Manama", country: "Bahrain", latitude: 26.2285, longitude: 50.586, timeZone: "Asia/Bahrain" },
  { city: "Muscat", country: "Oman", latitude: 23.588, longitude: 58.3829, timeZone: "Asia/Muscat" },

  // Levant, Iraq, Iran, Turkey
  { city: "Amman", country: "Jordan", latitude: 31.9454, longitude: 35.9284, timeZone: "Asia/Amman" },
  { city: "Beirut", country: "Lebanon", latitude: 33.8938, longitude: 35.5018, timeZone: "Asia/Beirut" },
  { city: "Damascus", country: "Syria", latitude: 33.5138, longitude: 36.2765, timeZone: "Asia/Damascus" },
  { city: "Jerusalem", country: "Palestine", latitude: 31.7683, longitude: 35.2137, timeZone: "Asia/Jerusalem" },
  { city: "Gaza", country: "Palestine", latitude: 31.5017, longitude: 34.4668, timeZone: "Asia/Gaza" },
  { city: "Baghdad", country: "Iraq", latitude: 33.3152, longitude: 44.3661, timeZone: "Asia/Baghdad" },
  { city: "Basra", country: "Iraq", latitude: 30.5081, longitude: 47.7835, timeZone: "Asia/Baghdad" },
  { city: "Tehran", country: "Iran", latitude: 35.6892, longitude: 51.389, timeZone: "Asia/Tehran" },
  { city: "Mashhad", country: "Iran", latitude: 36.2605, longitude: 59.6168, timeZone: "Asia/Tehran" },
  { city: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784, timeZone: "Europe/Istanbul" },
  { city: "Ankara", country: "Turkey", latitude: 39.9334, longitude: 32.8597, timeZone: "Europe/Istanbul" },
  { city: "Izmir", country: "Turkey", latitude: 38.4237, longitude: 27.1428, timeZone: "Europe/Istanbul" },

  // South Asia
  { city: "Karachi", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, timeZone: "Asia/Karachi" },
  { city: "Lahore", country: "Pakistan", latitude: 31.5204, longitude: 74.3587, timeZone: "Asia/Karachi" },
  { city: "Islamabad", country: "Pakistan", latitude: 33.6844, longitude: 73.0479, timeZone: "Asia/Karachi" },
  { city: "Peshawar", country: "Pakistan", latitude: 34.0151, longitude: 71.5249, timeZone: "Asia/Karachi" },
  { city: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timeZone: "Asia/Kolkata" },
  { city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, timeZone: "Asia/Kolkata" },
  { city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867, timeZone: "Asia/Kolkata" },
  { city: "Lucknow", country: "India", latitude: 26.8467, longitude: 80.9462, timeZone: "Asia/Kolkata" },
  { city: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639, timeZone: "Asia/Kolkata" },
  { city: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946, timeZone: "Asia/Kolkata" },
  { city: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707, timeZone: "Asia/Kolkata" },
  { city: "Dhaka", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timeZone: "Asia/Dhaka" },
  { city: "Chittagong", country: "Bangladesh", latitude: 22.3569, longitude: 91.7832, timeZone: "Asia/Dhaka" },
  { city: "Colombo", country: "Sri Lanka", latitude: 6.9271, longitude: 79.8612, timeZone: "Asia/Colombo" },
  { city: "Kabul", country: "Afghanistan", latitude: 34.5553, longitude: 69.2075, timeZone: "Asia/Kabul" },
  { city: "Malé", country: "Maldives", latitude: 4.1755, longitude: 73.5093, timeZone: "Indian/Maldives" },

  // South-East Asia
  { city: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, timeZone: "Asia/Jakarta" },
  { city: "Bandung", country: "Indonesia", latitude: -6.9175, longitude: 107.6191, timeZone: "Asia/Jakarta" },
  { city: "Surabaya", country: "Indonesia", latitude: -7.2575, longitude: 112.7521, timeZone: "Asia/Jakarta" },
  { city: "Medan", country: "Indonesia", latitude: 3.5952, longitude: 98.6722, timeZone: "Asia/Jakarta" },
  { city: "Kuala Lumpur", country: "Malaysia", latitude: 3.139, longitude: 101.6869, timeZone: "Asia/Kuala_Lumpur" },
  { city: "Johor Bahru", country: "Malaysia", latitude: 1.4927, longitude: 103.7414, timeZone: "Asia/Kuala_Lumpur" },
  { city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, timeZone: "Asia/Singapore" },
  { city: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018, timeZone: "Asia/Bangkok" },
  { city: "Manila", country: "Philippines", latitude: 14.5995, longitude: 120.9842, timeZone: "Asia/Manila" },
  { city: "Brunei", country: "Brunei", latitude: 4.9031, longitude: 114.9398, timeZone: "Asia/Brunei" },

  // Africa
  { city: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357, timeZone: "Africa/Cairo" },
  { city: "Alexandria", country: "Egypt", latitude: 31.2001, longitude: 29.9187, timeZone: "Africa/Cairo" },
  { city: "Casablanca", country: "Morocco", latitude: 33.5731, longitude: -7.5898, timeZone: "Africa/Casablanca" },
  { city: "Rabat", country: "Morocco", latitude: 34.0209, longitude: -6.8416, timeZone: "Africa/Casablanca" },
  { city: "Marrakesh", country: "Morocco", latitude: 31.6295, longitude: -7.9811, timeZone: "Africa/Casablanca" },
  { city: "Algiers", country: "Algeria", latitude: 36.7538, longitude: 3.0588, timeZone: "Africa/Algiers" },
  { city: "Tunis", country: "Tunisia", latitude: 36.8065, longitude: 10.1815, timeZone: "Africa/Tunis" },
  { city: "Tripoli", country: "Libya", latitude: 32.8872, longitude: 13.1913, timeZone: "Africa/Tripoli" },
  { city: "Khartoum", country: "Sudan", latitude: 15.5007, longitude: 32.5599, timeZone: "Africa/Khartoum" },
  { city: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792, timeZone: "Africa/Lagos" },
  { city: "Kano", country: "Nigeria", latitude: 12.0022, longitude: 8.592, timeZone: "Africa/Lagos" },
  { city: "Abuja", country: "Nigeria", latitude: 9.0765, longitude: 7.3986, timeZone: "Africa/Lagos" },
  { city: "Dakar", country: "Senegal", latitude: 14.7167, longitude: -17.4677, timeZone: "Africa/Dakar" },
  { city: "Nairobi", country: "Kenya", latitude: -1.2921, longitude: 36.8219, timeZone: "Africa/Nairobi" },
  { city: "Mogadishu", country: "Somalia", latitude: 2.0469, longitude: 45.3182, timeZone: "Africa/Mogadishu" },
  { city: "Johannesburg", country: "South Africa", latitude: -26.2041, longitude: 28.0473, timeZone: "Africa/Johannesburg" },
  { city: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241, timeZone: "Africa/Johannesburg" },

  // Central Asia and Caucasus
  { city: "Tashkent", country: "Uzbekistan", latitude: 41.2995, longitude: 69.2401, timeZone: "Asia/Tashkent" },
  { city: "Samarkand", country: "Uzbekistan", latitude: 39.627, longitude: 66.975, timeZone: "Asia/Samarkand" },
  { city: "Almaty", country: "Kazakhstan", latitude: 43.222, longitude: 76.8512, timeZone: "Asia/Almaty" },
  { city: "Baku", country: "Azerbaijan", latitude: 40.4093, longitude: 49.8671, timeZone: "Asia/Baku" },
  { city: "Bishkek", country: "Kyrgyzstan", latitude: 42.8746, longitude: 74.5698, timeZone: "Asia/Bishkek" },

  // Europe
  { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" },
  { city: "Birmingham", country: "United Kingdom", latitude: 52.4862, longitude: -1.8904, timeZone: "Europe/London" },
  { city: "Manchester", country: "United Kingdom", latitude: 53.4808, longitude: -2.2426, timeZone: "Europe/London" },
  { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, timeZone: "Europe/Paris" },
  { city: "Marseille", country: "France", latitude: 43.2965, longitude: 5.3698, timeZone: "Europe/Paris" },
  { city: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405, timeZone: "Europe/Berlin" },
  { city: "Amsterdam", country: "Netherlands", latitude: 52.3676, longitude: 4.9041, timeZone: "Europe/Amsterdam" },
  { city: "Brussels", country: "Belgium", latitude: 50.8503, longitude: 4.3517, timeZone: "Europe/Brussels" },
  { city: "Stockholm", country: "Sweden", latitude: 59.3293, longitude: 18.0686, timeZone: "Europe/Stockholm" },
  { city: "Oslo", country: "Norway", latitude: 59.9139, longitude: 10.7522, timeZone: "Europe/Oslo" },
  { city: "Madrid", country: "Spain", latitude: 40.4168, longitude: -3.7038, timeZone: "Europe/Madrid" },
  { city: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964, timeZone: "Europe/Rome" },
  { city: "Moscow", country: "Russia", latitude: 55.7558, longitude: 37.6173, timeZone: "Europe/Moscow" },
  { city: "Sarajevo", country: "Bosnia and Herzegovina", latitude: 43.8563, longitude: 18.4131, timeZone: "Europe/Sarajevo" },

  // Americas and Oceania
  { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, timeZone: "America/New_York" },
  { city: "Chicago", country: "United States", latitude: 41.8781, longitude: -87.6298, timeZone: "America/Chicago" },
  { city: "Houston", country: "United States", latitude: 29.7604, longitude: -95.3698, timeZone: "America/Chicago" },
  { city: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437, timeZone: "America/Los_Angeles" },
  { city: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, timeZone: "America/Toronto" },
  { city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, timeZone: "Australia/Sydney" },
  { city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, timeZone: "Australia/Melbourne" },
];

/** Rank: city prefix beats country prefix beats anything merely containing the query. */
const score = (city: City, query: string): number => {
  const name = city.city.toLowerCase();
  const country = city.country.toLowerCase();

  if (name.startsWith(query)) return 0;
  if (country.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  if (country.includes(query)) return 3;
  return -1;
};

export const searchCities = (query: string, limit = 8): City[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return CITIES.map((city) => ({ city, rank: score(city, needle) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.city.city.localeCompare(b.city.city))
    .slice(0, limit)
    .map(({ city }) => city);
};
