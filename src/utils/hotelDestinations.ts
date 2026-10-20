import {
  searchHotelCities,
  type HotelCityRecord,
} from "./hotelCitySearch";
import { isMetroHotelCity, stripDestinationAllSuffix } from "./metroAirports";

export { isMetroHotelCity };

/**
 * City search that also matches "Paris all" / "London all airports" the way
 * flight search matches those metro labels.
 */
export const searchHotelDestinations = (
  cities: HotelCityRecord[],
  query: string,
  limit = 8,
): HotelCityRecord[] => {
  const stripped = stripDestinationAllSuffix(query);
  return searchHotelCities(cities, stripped || query, limit);
};
