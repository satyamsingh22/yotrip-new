/**
 * Shared plumbing for the "filters are applied" affordances in the listing
 * sidebars (flight / hotel / car): the header count, the per-section badges,
 * and the removable chip row.
 *
 * Each product exposes a `getActive*FilterChips` builder that turns its own
 * filter state into this common shape. A chip carries the *next* state — the
 * current state with only that one selection undone — so a panel can wire up an
 * × without re-deriving how to reverse each individual filter type.
 */
export type FilterChip<TState> = {
  /** Stable React key, unique within one returned list. */
  key: string;
  /** Panel section the chip came from — drives the per-section badge counts. */
  section: string;
  /** Human-readable summary of the selection, e.g. "Non-stop" or "Emirates". */
  label: string;
  /** Filter state with only this chip cleared. */
  next: TState;
};

/** How many chips each section contributed, keyed by `chip.section`. */
export const countChipsBySection = (
  chips: readonly { section: string }[],
): Record<string, number> =>
  chips.reduce<Record<string, number>>((counts, chip) => {
    counts[chip.section] = (counts[chip.section] ?? 0) + 1;
    return counts;
  }, {});

/**
 * True when a dual-thumb range has been narrowed away from the full result
 * bounds. Ranges start *at* the bounds, so equality means "untouched".
 * Defensive against the pre-results state where filters still hold the
 * placeholder ceiling and bounds have not been measured yet.
 */
export const isRangeNarrowed = (
  value: { min: number; max: number },
  bounds: { min: number; max: number },
): boolean => {
  if (!Number.isFinite(bounds.min) || !Number.isFinite(bounds.max)) return false;
  if (bounds.max <= bounds.min) return false;
  return value.min > bounds.min || value.max < bounds.max;
};
