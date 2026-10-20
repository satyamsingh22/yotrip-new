/**
 * Human-readable summary of a traveller selection, e.g. "2 Adults, 1 Child".
 *
 * Always renders the adult count — including the default single adult — so the
 * traveller field visibly reflects the current selection instead of falling
 * back to a placeholder that reads as "nothing happened".
 *
 * Pass `words` from i18n when the UI is localized; English defaults keep
 * existing call sites and unit tests working unchanged.
 */
export type TravellerLabelWords = {
  adult: string;
  adults: string;
  child: string;
  children: string;
  infant: string;
  infants: string;
};

const DEFAULT_WORDS: TravellerLabelWords = {
  adult: "Adult",
  adults: "Adults",
  child: "Child",
  children: "Children",
  infant: "Infant",
  infants: "Infants",
};

export const formatTravellerLabel = (
  adults: number,
  children: number,
  infants: number,
  words: Partial<TravellerLabelWords> = {},
): string => {
  const w = { ...DEFAULT_WORDS, ...words };
  const a = Math.max(1, Math.floor(adults) || 0);
  const c = Math.max(0, Math.floor(children) || 0);
  const i = Math.max(0, Math.floor(infants) || 0);

  const parts = [`${a} ${a > 1 ? w.adults : w.adult}`];
  if (c > 0) parts.push(`${c} ${c > 1 ? w.children : w.child}`);
  if (i > 0) parts.push(`${i} ${i > 1 ? w.infants : w.infant}`);

  return parts.join(", ");
};
