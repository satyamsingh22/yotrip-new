/** Minimal HostNSell context for POST /api/flights/seat-map (avoids huge rawItinerary bodies). */
export function slimHostnsellForSeatMap(
  hostnsell: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!hostnsell || typeof hostnsell !== "object") return null;
  const flightDetails = hostnsell.flightDetails;
  const hasPriced = Array.isArray(flightDetails) && flightDetails.length > 0;
  const base: Record<string, unknown> = {
    traceId: hostnsell.traceId,
    mappingType: hostnsell.mappingType,
    combinationId: hostnsell.combinationId,
    fareMapping: hostnsell.fareMapping,
    fareFamilyIndex: hostnsell.fareFamilyIndex,
    passengercount: hostnsell.passengercount,
  };
  if (hasPriced) {
    base.flightDetails = flightDetails;
    return base;
  }
  if (hostnsell.rawItinerary) {
    base.rawItinerary = hostnsell.rawItinerary;
  }
  return base.traceId ? base : null;
}
