/**
 * Cross-provider merge for the results page.
 *
 * Each provider is now fetched in its own request, so the backend only ever
 * sees one provider's offers and cannot dedupe across them. This is the
 * browser-side counterpart of `backend/utils/flightDedupe.util.js` and MUST
 * keep the same rule: same physical flight -> keep the strictly cheaper offer,
 * preferring `sabre` on an exact tie.
 */

/** "YYYY-MM-DDTHH:mm" (offset/seconds dropped), or bare "HH:mm". Never converts zones. */
export const canonicalDateTime = (value: any): string => {
  if (value == null) return "";
  const s = String(value).trim();
  if (s === "") return "";
  const full = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/);
  if (full) return `${full[1]}T${full[2]}:${full[3]}`;
  const bare = s.match(/^(\d{1,2}):?(\d{2})$/);
  if (bare) return `${String(bare[1]).padStart(2, "0")}:${bare[2]}`;
  return s;
};

const canonCarrier = (c: any) => String(c || "").trim().toUpperCase();
const canonFlightNo = (n: any) =>
  String(n || "").trim().toUpperCase().replace(/^([A-Z]*)0*(\d+)$/, "$1$2");

/** Sabre emits labels ("Premium Economy"); Tripjack emits enums ("PREMIUM_ECONOMY"). */
export const canonCabin = (c: any): string => {
  const token = String(c || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (token === "FIRST_CLASS" || token === "FIRST") return "FIRST";
  return token;
};

export const flightSignature = (offer: any): string => {
  const segs = Array.isArray(offer?.segments) ? offer.segments : [];
  const legPart = segs
    .map(
      (s: any) =>
        canonCarrier(s.carrier) +
        canonFlightNo(s.flightNumber) +
        "@" +
        canonicalDateTime(s.departureDateTime) +
        "-" +
        canonicalDateTime(s.arrivalDateTime),
    )
    .join(">");
  return `${canonCabin(offer?.cabinClass)}|${legPart}`;
};

const comparePrice = (o: any): number => {
  const p = Number(o?.priceINR ?? o?.price);
  return Number.isFinite(p) && p > 0 ? p : Infinity;
};

const offerHasFareOptions = (o: any) => Array.isArray(o?.fareOptions) && o.fareOptions.length > 0;

const fareOptionSignature = (opt: any) =>
  [
    opt.provider,
    opt.hostnsell?.combinationId,
    opt.hostnsell?.fareMapping,
    opt.hostnsell?.fareFamilyIndex,
    opt.brandName,
    opt.label,
    opt.cabinClass,
    opt.fareBasisCode,
    opt.bookingClass,
    opt.tripjackPriceId,
    opt.priceINR ?? opt.price,
  ].join(":");

export const mergeDuplicateFlightOffers = (keeper: any, incoming: any): any => {
  if (!offerHasFareOptions(keeper) && !offerHasFareOptions(incoming)) {
    const inc = comparePrice(incoming);
    const ex = comparePrice(keeper);
    if (inc < ex) return incoming;
    if (inc === ex && incoming?.provider === "sabre" && keeper?.provider !== "sabre") return incoming;
    return keeper;
  }

  const asOptions = (offer: any) =>
    offerHasFareOptions(offer)
      ? offer.fareOptions.map((o: any) => ({ ...o, provider: o.provider || offer.provider }))
      : [
          {
            id: 0,
            price: offer.priceINR ?? offer.price,
            priceINR: offer.priceINR ?? offer.price,
            currency: offer.currency,
            cabinClass: offer.cabinClass,
            provider: offer.provider,
            tripjackPriceId: offer.tripjackPriceId,
            hostnsell: offer.hostnsell,
            brandName: offer.brandName,
            label: offer.label,
            baggage: offer.baggage,
            cancellation: offer.cancellation,
          },
        ];

  const seen = new Set<string>();
  const merged: any[] = [];
  for (const o of [...asOptions(keeper), ...asOptions(incoming)]) {
    const sig = fareOptionSignature(o);
    if (seen.has(sig)) continue;
    seen.add(sig);
    merged.push(o);
  }
  merged.sort(
    (a, b) =>
      (Number(a.priceINR ?? a.price) || Infinity) - (Number(b.priceINR ?? b.price) || Infinity),
  );
  merged.forEach((o, i) => {
    o.id = i;
  });

  const best = merged[0];
  const shell = comparePrice(keeper) <= comparePrice(incoming) ? keeper : incoming;
  return {
    ...shell,
    fareOptions: merged,
    price: best?.price ?? best?.priceINR,
    priceINR: best?.priceINR ?? best?.price,
    currency: best?.currency ?? shell.currency,
    cabinClass: best?.cabinClass ?? shell.cabinClass,
    hostnsell: best?.hostnsell ?? shell.hostnsell,
    tripjackPriceId: best?.tripjackPriceId ?? shell.tripjackPriceId,
    selectedFareOptionId: 0,
    brandName: best?.brandName ?? shell.brandName,
    label: best?.label ?? shell.label,
    baggage: best?.baggage ?? shell.baggage,
    cancellation: best?.cancellation ?? shell.cancellation,
  };
};

/**
 * Collapses the same flight to its cheapest offer. Returns a NEW array and
 * never mutates the input. First-seen order is preserved; the caller sorts.
 */
export const dedupeFlightsByLowestPrice = (offers: any[] = []): any[] => {
  const bySignature = new Map<string, number>();
  const kept: any[] = [];

  for (const offer of offers) {
    if (offer == null) {
      // Mirrors the backend's `isSameFlight`, which opens with `if (!a || !b) return false;` --
      // a null/undefined entry is never a duplicate of anything, including another null.
      kept.push(offer);
      continue;
    }
    const sig = flightSignature(offer);
    const idx = bySignature.get(sig);
    if (idx === undefined) {
      bySignature.set(sig, kept.length);
      kept.push(offer);
      continue;
    }
    kept[idx] = mergeDuplicateFlightOffers(kept[idx], offer);
  }

  return kept;
};
