import { enrichAirportCoordinates, type AirportOption } from "./airports";
import { getCountryName } from "./hotelCitySearch";
import type { TripjackLocationDto, TripjackPlaceResult } from "./tripjackCabLocations";

export interface CarLocationOption {
  id: string;
  label: string;
  subtitle: string;
  /** IATA code for airports; place id for TripJack addresses */
  value: string;
  source: "airport" | "tripjack";
  placeId?: string;
  locationDto?: TripjackLocationDto;
  airport?: AirportOption;
}

const IATA_PATTERN = /^[A-Z]{3}$/;

export const isAirportIata = (code: string) => IATA_PATTERN.test(code);

export const airportToLocationDto = (
  airport: AirportOption,
): TripjackLocationDto | null => {
  const lat = airport.latitude;
  const lng = airport.longitude;
  if (lat == null || lng == null) return null;

  return {
    type: "location",
    displayAddress: airport.label,
    lat: String(lat),
    long: String(lng),
    address: {
      city: airport.subtitle,
      country: getCountryName(airport.countryCode),
    },
  };
};

export const airportToCarLocation = (airport: AirportOption): CarLocationOption => {
  const enriched = enrichAirportCoordinates(airport);
  return {
    id: `airport-${enriched.id}`,
    label: enriched.label,
    subtitle: enriched.subtitle,
    value: enriched.value,
    source: "airport",
    airport: enriched,
    locationDto: airportToLocationDto(enriched) || undefined,
  };
};

export const tripjackPlaceToCarLocation = (
  place: TripjackPlaceResult,
): CarLocationOption => ({
  id: `tj-${place.id}`,
  label: place.mainText,
  subtitle: place.secondaryText || place.description,
  value: place.id,
  source: "tripjack",
  placeId: place.id,
});

export const resolveCarLocation = async (
  option: CarLocationOption,
  backendUrl: string,
): Promise<CarLocationOption> => {
  if (option.locationDto) return option;

  if (option.source === "airport" && option.airport) {
    const airport = enrichAirportCoordinates(option.airport);
    const locationDto = airportToLocationDto(airport);
    if (!locationDto) {
      throw new Error(
        "This airport has no coordinates for TripJack cabs. Try searching by address.",
      );
    }
    return { ...option, airport, locationDto };
  }

  if (option.placeId) {
    const { resolveTripjackCabPlace } = await import("./tripjackCabLocations");
    const locationDto = await resolveTripjackCabPlace(backendUrl, option.placeId);
    return { ...option, locationDto };
  }

  throw new Error("Location could not be resolved");
};

export interface CarSearchLocationPayload {
  pickupLocation?: string;
  dropoffLocation?: string;
  origin?: TripjackLocationDto;
  destination?: TripjackLocationDto;
}

export const buildCarSearchLocations = (
  mode: string,
  pickup: CarLocationOption,
  dropoff?: CarLocationOption | null,
): CarSearchLocationPayload => {
  const payload: CarSearchLocationPayload = {};

  if (pickup.source === "airport" && isAirportIata(pickup.value)) {
    payload.pickupLocation = pickup.value;
  }
  if (pickup.locationDto) {
    payload.origin = pickup.locationDto;
  }

  const needsDropoff =
    mode === "different-dropoff" || mode === "airport";
  const destinationLocation =
    needsDropoff && dropoff ? dropoff : pickup;

  if (
    needsDropoff &&
    dropoff?.source === "airport" &&
    isAirportIata(dropoff.value)
  ) {
    payload.dropoffLocation = dropoff.value;
  } else if (!needsDropoff && pickup.source === "airport" && isAirportIata(pickup.value)) {
    payload.dropoffLocation = pickup.value;
  }

  if (destinationLocation?.locationDto) {
    payload.destination = destinationLocation.locationDto;
  }

  return payload;
};
