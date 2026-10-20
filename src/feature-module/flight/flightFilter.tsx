import { Slider } from "antd";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../utils/formatMoney";
import { displayAirlineName } from "../../utils/displayLabels";
import { countChipsBySection } from "../../utils/filterChips";
import { useFilterLabels } from "../../utils/useFilterLabels";
import {
  BAGGAGE_OPTIONS,
  CABIN_OPTIONS,
  DEPARTURE_SLOT_OPTIONS,
  // PROVIDER_OPTIONS, // TEMP provider filter — commented out
  STOPS_OPTIONS,
  clampPriceRange,
  getActiveFlightFilterChips,
  needsRefetch,
  type FlightFilterChip,
  type FlightFilterState,
} from "../../utils/flightFilters";
import "./flightFilter.scss";

type AirlineOption = { code: string; name: string };

type FlightFilterProps = {
  filters: FlightFilterState;
  onChange: (filters: FlightFilterState) => void;
  /** Commits staged airline/stop/cabin changes — see `update` below. */
  onApply?: (filters: FlightFilterState) => void;
  onReset: () => void;
  /** Dismisses the containing drawer. The primary action always calls it. */
  onClose?: () => void;
  airlines: AirlineOption[];
  priceBounds: { min: number; max: number };
  currency?: string;
  /**
   * How many flights match the applied filters. Stated on its own — there is
   * deliberately no "out of N" companion. The only N available is the size of
   * the merged provider buckets, and that is not a fact about the route: it
   * moves with how much of the filter each provider honoured upstream. Sabre
   * re-shops under a `VendorPref`, so it returns 4; Tripjack is sent no
   * airline modifier at all, so it returns 29 from every carrier and the
   * browser discards most of them. "4 out of 29" reported that gap to the
   * user as if it meant something.
   */
  resultCount?: number;
  /**
   * True while at least one provider is still in flight. The panel stays
   * fully interactive — this only stops it implying it is complete when it
   * is not. Airlines and Price are unions across the buckets that HAVE
   * landed, so both still grow; the other sections' options are fixed lists,
   * but every section's OUTCOME still changes as more results arrive.
   */
  isLoadingMore?: boolean;
};

const airlineLogoUrl = (code: string) =>
  `https://pics.avs.io/64/64/${encodeURIComponent(code)}.png`;

/** Chip sections backed by server filters — their "x" must stage + Apply too. */
const SERVER_CHIP_SECTIONS = new Set(["stops", "airlines", "cabin"]);

const FlightFilter = ({
  filters,
  onChange,
  onApply,
  onReset,
  onClose,
  airlines,
  priceBounds,
  currency = "USD",
  resultCount,
  isLoadingMore = false,
}: FlightFilterProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState({
    stops: true,
    baggage: true,
    airlines: true,
    time: true,
    price: true,
    cabin: false,
    providers: false,
  });
  const [showAllAirlines, setShowAllAirlines] = useState(false);
  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    filters.minPrice,
    filters.maxPrice,
  ]);

  useEffect(() => {
    setPriceDraft([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  // Server-pushable filters (airline/stops/cabin) re-shop the search, so they
  // are held as a draft and committed by Apply. Client filters (price,
  // baggage, amenities, departure slots) still apply instantly via onChange.
  const [draft, setDraft] = useState<FlightFilterState>(filters);

  // `filters` changes for two very different reasons, and this must not
  // treat them the same:
  //  1. A genuine server-side commit (our own Apply landed, a Reset went
  //     through, or a fresh search arrived) — the draft's staged
  //     airline/stop/cabin values are now stale and must hard-reset to match.
  //  2. A client-only edit (price/baggage/time), which round-trips through
  //     onChange -> the parent -> a brand new `filters` object even though
  //     the server keys didn't change. A naive `setDraft(filters)` here would
  //     silently wipe an unrelated staged selection the user hasn't applied
  //     yet (tick an airline, then nudge the price slider, and the airline
  //     would visibly untick itself with no warning). So when only client
  //     keys moved, keep the draft's own airline/stop/cabin values and just
  //     refresh everything else.
  // `prevFiltersRef` tracks the previously committed `filters` so "did the
  // server keys change" is judged against the last commit, not against
  // whatever the draft happens to be staging right now.
  const prevFiltersRef = useRef(filters);
  // Set by a chip × just before it commits, and consumed by the very next run
  // of the effect below: the commit it triggers is a genuine server-key change,
  // so case 1 would hard-reset the draft and take any *other* staged edit down
  // with it. `committed` is the exact object handed upstream, so a commit that
  // never lands (or a later, unrelated `filters` change) can't pick this up.
  const chipStagedRef = useRef<{
    committed: FlightFilterState;
    draft: FlightFilterState;
  } | null>(null);
  useEffect(() => {
    const serverKeysChanged = needsRefetch(prevFiltersRef.current, filters);
    prevFiltersRef.current = filters;
    const chipStaged = chipStagedRef.current;
    chipStagedRef.current = null;
    if (chipStaged?.committed === filters) {
      setDraft({
        ...filters,
        airlines: chipStaged.draft.airlines,
        stops: chipStaged.draft.stops,
        cabins: chipStaged.draft.cabins,
      });
      return;
    }
    if (serverKeysChanged) {
      setDraft(filters);
    } else {
      setDraft((prev) => ({
        ...filters,
        airlines: prev.airlines,
        stops: prev.stops,
        cabins: prev.cabins,
      }));
    }
  }, [filters]);
  const pending = needsRefetch(filters, draft);

  // What the primary action can honestly promise, worst case first.
  //
  // A staged server filter re-shops upstream, so the post-apply count is not
  // knowable yet — the button must not name one. Mid-search the count is a
  // partial for the same reason the results heading waits. Only once every
  // provider has settled and nothing is staged is the number a fact.
  const primaryLabel = pending
    ? t("flightList.applyFilters")
    : isLoadingMore || !resultCount
      ? t("flightList.showResults")
      : t(
          resultCount === 1 ? "flightList.showFlight" : "flightList.showFlights",
          { count: resultCount },
        );

  const handlePrimary = () => {
    if (pending) onApply?.(draft);
    onClose?.();
  };

  const { stopLabel, baggageLabel, timeLabel, cabinLabel, chipDisplayLabel } =
    useFilterLabels();

  // Every mutation that touches airlines/stops/cabins goes through here: it
  // always stages the draft (so checkboxes/radios reflect it instantly), and
  // only calls onChange immediately when the result matches what's already
  // committed — e.g. staging back to the original selection — so there is
  // never a pointless Apply to press.
  const update = (next: FlightFilterState) => {
    setDraft(next);
    if (!needsRefetch(filters, next)) onChange(next);
  };

  // Reset is rendered by this component, so it's the one place that can
  // reliably clear a staged-but-unapplied selection: from the effect above's
  // point of view, a Reset that undoes only an already-*applied* filter
  // looks identical to any other client-only change (the server keys were
  // never committed in the first place, so they "didn't change"), which
  // would otherwise leave a staged airline/stop/cabin alive after Reset.
  const handleReset = () => {
    setDraft((prev) => ({ ...prev, airlines: [], stops: [], cabins: [] }));
    onReset();
  };

  // A chip stands for a filter that is *already applied*, so its × un-applies
  // it there and then — the same immediate contract Reset has, scoped to one
  // selection. For a server filter (airlines/stops/cabin) that means a re-shop,
  // hence onApply rather than onChange. Staging it instead and waiting for
  // Apply left every "a filter is on" signal — the chip, the header count, the
  // section badge, all derived from the committed `filters` — completely
  // unmoved, so the click looked like it did nothing at all.
  //
  // What gets committed is `chip.next`, never the draft: `chip.next` is built
  // by `without()` against the *committed* `filters` (see
  // getActiveFlightFilterChips), so it undoes this one selection and nothing
  // else, leaving any unrelated staged edit pending for Apply exactly as the
  // user left it.
  //
  // The draft still has to follow along so the matching checkbox unticks with
  // the chip — but merging `chip.next` into it wholesale would replay whatever
  // that array looked like at commit time, silently re-adding an airline the
  // user had just staged *off* or wiping one they had just staged *on*. So work
  // out which single value the chip removes (present in `filters[key]`, absent
  // from `chip.next[key]`) and drop just that value from `draft[key]`.
  const removeChip = (chip: FlightFilterChip) => {
    if (!SERVER_CHIP_SECTIONS.has(chip.section)) {
      onChange(chip.next);
      return;
    }
    const key = (Object.keys(chip.next) as (keyof FlightFilterState)[]).find(
      (k) => chip.next[k] !== filters[k],
    );
    if (!key) return;
    const committed = filters[key] as unknown as string[];
    const afterRemovalFromCommitted = chip.next[key] as unknown as string[];
    const removedValue = committed.find(
      (item) => !afterRemovalFromCommitted.includes(item),
    );
    const draftValues = draft[key] as unknown as string[];
    const nextValues =
      removedValue !== undefined
        ? draftValues.filter((item) => item !== removedValue)
        : afterRemovalFromCommitted;
    const nextDraft = { ...draft, [key]: nextValues } as FlightFilterState;
    setDraft(nextDraft);
    // Without onApply there is no one to re-shop; onChange at least keeps the
    // committed state honest instead of dropping the removal on the floor.
    // Either path lands `chip.next` as the new `filters`, which is what the
    // effect above matches on before restoring this draft.
    chipStagedRef.current = { committed: chip.next, draft: nextDraft };
    if (onApply) onApply(chip.next);
    else onChange(chip.next);
  };

  const commitPriceRange = (rawMin: number | null, rawMax: number | null) => {
    const [minPrice, maxPrice] = clampPriceRange(rawMin, rawMax, priceBounds, {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
    setPriceDraft([minPrice, maxPrice]);
    onChange({ ...filters, minPrice, maxPrice });
  };

  const toggleOpen = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const setExclusiveStop = (id: string) => {
    const active = draft.stops.length === 1 && draft.stops[0] === id;
    update({ ...draft, stops: active ? [] : [id] });
  };

  const setBaggage = (id: string) => {
    onChange({
      ...filters,
      baggage: filters.baggage === id ? "" : id,
    });
  };

  const toggleDepartureSlot = (id: string) => {
    const current = filters.departureSlots || [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    onChange({ ...filters, departureSlots: next });
  };

  const toggleArrivalSlot = (id: string) => {
    const current = filters.arrivalSlots || [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    onChange({ ...filters, arrivalSlots: next });
  };

  const toggleAirline = (code: string) => {
    const next = draft.airlines.includes(code)
      ? draft.airlines.filter((a) => a !== code)
      : [...draft.airlines, code];
    update({ ...draft, airlines: next });
  };

  const toggleCabin = (cabin: string) => {
    const next = draft.cabins.includes(cabin)
      ? draft.cabins.filter((c) => c !== cabin)
      : [...draft.cabins, cabin];
    update({ ...draft, cabins: next });
  };

  // TEMP provider filter — commented out
  // const toggleProvider = (id: string) => {
  //   const current = filters.providers || [];
  //   const next = current.includes(id)
  //     ? current.filter((p) => p !== id)
  //     : [...current, id];
  //   onChange({ ...filters, providers: next });
  // };

  const visibleAirlines = showAllAirlines ? airlines : airlines.slice(0, 5);
  const priceFormatter = (value?: number) => formatMoney(value ?? 0, currency);
  const countLabel =
    typeof resultCount === "number"
      ? t(
          resultCount === 1
            ? "flightList.flightFoundDot"
            : "flightList.flightsFoundDot",
          { count: resultCount },
        )
      : null;

  // Everything the user has actually applied, as removable chips. Also feeds
  // the per-section badges and whether Reset is live — so all the "a filter
  // is on" signals come from one source of truth.
  const activeChips = useMemo(
    () =>
      getActiveFlightFilterChips(filters, priceBounds, {
        airlines,
        formatPrice: (value) => formatMoney(value, currency),
      }),
    [filters, priceBounds, airlines, currency],
  );
  const sectionCounts = useMemo(
    () => countChipsBySection(activeChips),
    [activeChips],
  );
  const activeCount = activeChips.length;

  // Plain function, not a component: returning elements inline keeps the button
  // in the same position in the tree across renders.
  // `growing` marks the sections whose CONTENTS expand as further providers
  // land (Airlines gains carriers, Price widens its bounds). Fixed-option
  // sections never get it — claiming they grow would be untrue.
  const sectionTitle = (
    key: keyof typeof open,
    label: ReactNode,
    section: string = key,
    growing: boolean = false,
  ) => {
    const count = sectionCounts[section] ?? 0;
    return (
      <button
        type="button"
        className={`ytf-section-title ${open[key] ? "" : "collapsed"} ${
          count > 0 ? "has-active" : ""
        }`}
        onClick={() => toggleOpen(key)}
        aria-expanded={open[key]}
      >
        <span>
          {label}
          {count > 0 && (
            <span className="ytf-section-count" aria-label={`${count} applied`}>
              {count}
            </span>
          )}
          {growing && isLoadingMore && (
            <span
              className="ytf-section-growing"
              data-testid={`section-growing-${section}`}
              title="More may appear as the search finishes"
            >
              +
            </span>
          )}
        </span>
        <i className="isax isax-arrow-up-2" />
      </button>
    );
  };

  return (
    <div className="yt-flight-filter">
      {/* No ytf-head: FilterDrawer renders the title and the close button, and
          Reset now lives in the footer beside the primary action, where the
          two exits from an over-filtered result set sit together. */}

      {/* One status line, not two: the "still searching" note rides on the
          count rather than stacking a second grey paragraph above it. Said
          once at panel level rather than per-section, because every
          section's RESULTS keep changing while a provider is outstanding
          even when its options do not. */}
      {countLabel && !isLoadingMore && (
        <div className="ytf-count" data-testid="filters-count">
          {countLabel}
        </div>
      )}

      {activeCount > 0 && (
        <div className="ytf-chips">
          {activeChips.map((chip) => {
            const label = chipDisplayLabel(chip);
            return (
            <button
              key={chip.key}
              type="button"
              className="ytf-chip"
              onClick={() => removeChip(chip)}
              title={`Remove "${label}"`}
              aria-label={`Remove filter ${label}`}
            >
              <span className="ytf-chip-label">{label}</span>
              <span className="ytf-chip-x" aria-hidden="true">
                ×
              </span>
            </button>
            );
          })}
        </div>
      )}

      {/* Stops — radio style (Almosafer) */}
      <div className="ytf-section">
        {sectionTitle("stops", t("flightList.stops"))}
        {open.stops &&
          STOPS_OPTIONS.map((option) => {
            const active =
              draft.stops.length === 1 && draft.stops[0] === option.id;
            return (
              <label
                key={option.id}
                className={`ytf-radio ${active ? "on" : ""}`}
              >
                <input
                  type="radio"
                  name={`ytf-stops-${option.id}`}
                  checked={active}
                  readOnly
                  onClick={() => setExclusiveStop(option.id)}
                />
                <span>{stopLabel(option.id, option.label)}</span>
              </label>
            );
          })}
      </div>

      {/* Baggage — pills */}
      <div className="ytf-section">
        {sectionTitle("baggage", t("flightList.baggage"))}
        {open.baggage && (
          <div className="ytf-pills">
            {BAGGAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`ytf-pill ${filters.baggage === option.id ? "on" : ""}`}
                onClick={() => setBaggage(option.id)}
              >
                {baggageLabel(option.id, option.label)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Airlines */}
      <div className="ytf-section">
        {sectionTitle("airlines", t("flightList.airlines"), "airlines", true)}
        {open.airlines && (
          <>
            {airlines.length === 0 ? (
              <p className="mb-0" style={{ fontSize: 13, color: "#6b7a90" }}>
                {t("flightList.noAirlines")}
              </p>
            ) : (
              <>
                {visibleAirlines.map((airline) => (
                  <label
                    key={airline.code}
                    className={`ytf-airline ${
                      draft.airlines.includes(airline.code) ? "on" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.airlines.includes(airline.code)}
                      onChange={() => toggleAirline(airline.code)}
                    />
                    <img
                      className="ytf-airline-logo"
                      src={airlineLogoUrl(airline.code)}
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility =
                          "hidden";
                      }}
                    />
                    <span className="ytf-airline-name">
                      {displayAirlineName(airline.name, t)}
                    </span>
                  </label>
                ))}
                {airlines.length > 5 && (
                  <button
                    type="button"
                    className="ytf-more"
                    onClick={() => setShowAllAirlines((v) => !v)}
                  >
                    {showAllAirlines
                      ? t("flightList.showLess")
                      : t("flightList.showAll")}{" "}
                    <i
                      className={`isax ${showAllAirlines ? "isax-arrow-up-2" : "isax-arrow-down-1"}`}
                    />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Departure & arrival time — 2×2 pills each */}
      <div className="ytf-section">
        {sectionTitle("time", t("flightList.time"))}
        {open.time && (
          <>
            <p className="ytf-time-heading">{t("flightList.departureTime")}</p>
            <div className="ytf-time-grid">
              {DEPARTURE_SLOT_OPTIONS.map((slot) => (
                <button
                  key={`dep-${slot.id}`}
                  type="button"
                  className={`ytf-time-pill ${(filters.departureSlots || []).includes(slot.id) ? "on" : ""}`}
                  onClick={() => toggleDepartureSlot(slot.id)}
                >
                  <i className={`isax ${slot.icon}`} />
                  <span>{timeLabel(slot.id, slot.label)}</span>
                </button>
              ))}
            </div>
            <p className="ytf-time-heading ytf-time-heading--spaced">
              {t("flightList.arrivalTime")}
            </p>
            <div className="ytf-time-grid">
              {DEPARTURE_SLOT_OPTIONS.map((slot) => (
                <button
                  key={`arr-${slot.id}`}
                  type="button"
                  className={`ytf-time-pill ${(filters.arrivalSlots || []).includes(slot.id) ? "on" : ""}`}
                  onClick={() => toggleArrivalSlot(slot.id)}
                >
                  <i className={`isax ${slot.icon}`} />
                  <span>{timeLabel(slot.id, slot.label)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Price */}
      <div className="ytf-section">
        {sectionTitle("price", t("flightList.price"), "price", true)}
        {open.price && (
          <>
            <div className="ytf-price-row">
              <span>{priceFormatter(priceDraft[0])}</span>
              <span>{priceFormatter(priceDraft[1])}</span>
            </div>
            <div className="ytf-price-slider">
              <Slider
                range
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceDraft}
                tooltip={{ formatter: priceFormatter }}
                onChange={(value) => {
                  const [rawMin, rawMax] = value as [number, number];
                  setPriceDraft(
                    clampPriceRange(rawMin, rawMax, priceBounds, {
                      minPrice: priceDraft[0],
                      maxPrice: priceDraft[1],
                    })
                  );
                }}
                onChangeComplete={(value) => {
                  const [minPrice, maxPrice] = value as [number, number];
                  commitPriceRange(minPrice, maxPrice);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Cabin */}
      <div className="ytf-section">
        {sectionTitle("cabin", t("flightList.cabinClass"))}
        {open.cabin &&
          CABIN_OPTIONS.map((cabin) => (
            <label
              key={cabin}
              className={`ytf-check ${draft.cabins.includes(cabin) ? "on" : ""}`}
            >
              <input
                type="checkbox"
                checked={draft.cabins.includes(cabin)}
                onChange={() => toggleCabin(cabin)}
              />
              <span>{cabinLabel(cabin)}</span>
            </label>
          ))}
      </div>

      <div className="ytf-footer">
        <button
          type="button"
          className={`ytf-footer__reset ${activeCount > 0 ? "is-active" : ""}`}
          onClick={handleReset}
          disabled={activeCount === 0}
        >
          {activeCount > 0 ? t("flightList.resetAll") : t("flightList.reset")}
        </button>
        {/* Never disabled: this is the drawer's main way out, and a dead
            primary button leaves a 34px × as the only exit. With nothing
            staged it simply closes. */}
        <button
          type="button"
          className={`filter-apply-btn ${pending ? "is-pending" : ""}`}
          data-testid="drawer-primary"
          onClick={handlePrimary}
        >
          {primaryLabel}
        </button>
      </div>

      {/* TEMP provider — commented out for production
      <div className="ytf-section">
        {sectionTitle(
          "providers",
          <>
            Provider
            <span className="ytf-badge-temp">TEMP</span>
          </>,
        )}
        {open.providers &&
          PROVIDER_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`ytf-check ${
                (filters.providers || []).includes(option.id) ? "on" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={(filters.providers || []).includes(option.id)}
                onChange={() => toggleProvider(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
      </div>
      */}
    </div>
  );
};

export default FlightFilter;
