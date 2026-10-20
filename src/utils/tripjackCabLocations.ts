import axios from "axios";

export interface TripjackLocationDto {
  type: string;
  displayAddress: string;
  lat: string;
  long: string;
  address: {
    city?: string;
    country?: string;
    postalCode?: string;
    subLocality?: string;
  };
}

export interface TripjackPlaceResult {
  id: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

/** Google Place IDs look like ChIJ… — never show these as address labels. */
export const looksLikePlaceId = (value: string): boolean => {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^ChIJ[A-Za-z0-9_-]+$/.test(text)) return true;
  // Opaque ids: long, no spaces, mostly alphanumeric.
  return text.length >= 20 && !/\s/.test(text) && /^[A-Za-z0-9_-]+$/.test(text);
};

const pickText = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const text = candidate.trim();
    if (!text || looksLikePlaceId(text)) continue;
    return text;
  }
  return "";
};

const parsePlaces = (data: unknown): TripjackPlaceResult[] => {
  const root = data as Record<string, unknown>;
  const nested = root?.data as Record<string, unknown> | undefined;
  const places = (nested?.places || root?.places || []) as Array<
    Record<string, unknown>
  >;

  return places
    .map((place) => {
      if (!place || typeof place !== "object") return null;

      const id = String(place.id || place.value || place.placeId || "").trim();
      if (!id) return null;

      const structured = (place.structured_formatting ||
        place.structuredFormatting ||
        {}) as Record<string, unknown>;

      const mainText = pickText(
        place.mainText,
        place.main_text,
        structured.main_text,
        structured.mainText,
        place.name,
        place.label,
        place.title,
        place.description,
        place.displayAddress,
        place.formattedAddress,
      );

      // Skip junk TripJack rows that only return a Place ID with no label.
      if (!mainText) return null;

      const secondaryText = pickText(
        place.secondaryText,
        place.secondary_text,
        structured.secondary_text,
        structured.secondaryText,
        place.subtitle,
        place.subTitle,
      );

      const description =
        pickText(place.description, place.displayAddress, place.formattedAddress) ||
        [mainText, secondaryText].filter(Boolean).join(", ");

      return {
        id,
        mainText,
        secondaryText,
        description,
      };
    })
    .filter((p): p is TripjackPlaceResult => Boolean(p));
};

export const searchTripjackCabPlaces = async (
  backendUrl: string,
  input: string,
): Promise<TripjackPlaceResult[]> => {
  const query = String(input || "").trim();
  if (query.length < 2) return [];

  const response = await axios.post(
    `${backendUrl}/api/cars/tripjack/google-places`,
    { input: query },
  );

  if (response.data?.success === false) {
    throw new Error(response.data?.message || "Location search failed");
  }

  return parsePlaces(response.data);
};

export const resolveTripjackCabPlace = async (
  backendUrl: string,
  placeId: string,
): Promise<TripjackLocationDto> => {
  const response = await axios.post(
    `${backendUrl}/api/cars/tripjack/get-lat-long`,
    { placeId },
  );

  const dto =
    response.data?.locationDto ||
    locationDtoFromLatLongResponse(response.data?.data || response.data);

  if (!dto?.lat || !dto?.long) {
    throw new Error("Could not resolve location coordinates");
  }

  return dto;
};

export const locationDtoFromLatLongResponse = (
  data: Record<string, unknown> = {},
): TripjackLocationDto | null => {
  const location = (data.location || {}) as Record<string, string>;
  const lat = location.lat ?? data.lat;
  const lng = location.lng ?? data.long ?? data.lng;
  if (lat == null || lng == null) return null;

  const address = (data.address || {}) as Record<string, string>;
  const city = address.city || "";
  const country = address.country || "India";
  const displayAddress =
    (data.displayAddress as string) ||
    [city, country].filter(Boolean).join(", ") ||
    `${lat}, ${lng}`;

  return {
    type: "location",
    displayAddress,
    lat: String(lat),
    long: String(lng),
    address: {
      city,
      country,
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      ...(address.subLocality ? { subLocality: address.subLocality } : {}),
    },
  };
};

/** Exported for unit tests */
export const __test__ = { parsePlaces, pickText };
