import type { AirportOption } from "./airports";

export type DefaultAirport = {
  id: string;
  value: string;
  label: string;
  subtitle: string;
  countryCode: string;
};

export type DefaultHotelCity = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  currency: string;
};

export type GeoLocationDefaults = {
  country: string;
  currency: string;
  source: "ip" | "fallback";
  hotelCity: DefaultHotelCity;
  fromAirport: DefaultAirport;
  toAirport: DefaultAirport;
  pickupAirport: AirportOption;
};

export const DEFAULT_HOTEL_CITY: DefaultHotelCity = {
  name: "London",
  country: "GB",
  lat: 51.50853,
  lng: -0.12574,
  currency: "GBP",
};

export const DEFAULT_FROM_AIRPORT: DefaultAirport = {
  id: "LHR",
  value: "LHR",
  label: "LHR, London Heathrow Airport",
  subtitle: "London",
  countryCode: "GB",
};

export const DEFAULT_TO_AIRPORT: DefaultAirport = {
  id: "CDG",
  value: "CDG",
  label: "CDG, Charles de Gaulle International Airport",
  subtitle: "Paris",
  countryCode: "FR",
};

export const DEFAULT_PICKUP_AIRPORT: AirportOption = {
  ...DEFAULT_FROM_AIRPORT,
  search: "lhr london heathrow",
  latitude: "51.4706",
  longitude: "-0.461941",
};

export const DEFAULT_DROPOFF_AIRPORT: AirportOption = {
  ...DEFAULT_PICKUP_AIRPORT,
};
