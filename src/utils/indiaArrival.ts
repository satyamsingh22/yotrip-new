import airportData from "../data/airports.json";

/**
 * Does this itinerary put the traveller through Indian immigration?
 *
 * Drives the Air Suvidha / Self-Declaration Form notice, which used to pop up
 * on the landing page for every visitor. It is now shown only to travellers who
 * actually need it.
 */

type ArrivalPoint = { destination?: string };

type LegLike = ArrivalPoint & {
  segments?: ArrivalPoint[];
};

/**
 * IATA codes of every airport in India, built once on first use.
 *
 * Built straight off the raw JSON rather than through buildAirportOptions(),
 * which allocates ~5k option objects with search strings this check has no use
 * for.
 */
let indiaCodes: Set<string> | null = null;

const getIndiaCodes = (): Set<string> => {
  if (!indiaCodes) {
    indiaCodes = new Set(
      (airportData as Array<{ iso_country?: string; iata_code?: string }>)
        .filter((a) => a.iso_country === "IN" && a.iata_code?.trim())
        .map((a) => (a.iata_code as string).trim().toUpperCase()),
    );
  }
  return indiaCodes;
};

/** True when `iata` is an airport in India. Unknown codes are not-India. */
export const isIndiaAirport = (iata?: string | null): boolean => {
  const code = iata?.trim().toUpperCase();
  return code ? getIndiaCodes().has(code) : false;
};

/**
 * True when any leg — or any segment within a leg — arrives in India.
 *
 * Segment-level matching is what catches an India layover such as
 * RUH -> DEL -> BKK, where the leg's own destination is BKK. Origins are
 * deliberately ignored: flying *out* of India needs no SDF.
 */
export const arrivesInIndia = (legs?: LegLike[] | null): boolean =>
  Array.isArray(legs) &&
  legs.some(
    (leg) =>
      isIndiaAirport(leg?.destination) ||
      (Array.isArray(leg?.segments) &&
        leg.segments.some((seg) => isIndiaAirport(seg?.destination))),
  );
