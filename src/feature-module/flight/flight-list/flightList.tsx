//@ts-nocheck
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import FlightSearch from "../flightSearch";
import FlightFilter from "../flightFilter";
import { useFlightSearch } from "../../../context/FlightSearchContext";
import dayjs from "dayjs";
import { apiRequest } from "../../../utils/apiRequest";
import axios from "axios";
import FlightSearchLoader from "./FlightSearchLoader";
import { Currency } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/tockenapi/api";
import toast from "react-hot-toast";
import { getBrowserTimezone } from "../../../context/GeoDefaultsContext";
import { validateFlightSearchDates } from "../../../utils/dateValidation";
import { readDateDeepLink } from "../../../utils/flightDateDeepLink";
import {
  criteriaKey,
  type SearchCriteria,
} from "../../../utils/flightSearchCriteria";
import { lookupAirportByIata } from "../../../utils/airports";
import { readFlightSearchDeepLink } from "../../../utils/flightSearchDeepLink";
import {
  buildRevalidateBody,
  repricedUi,
  storeSelectedFlight,
  toSelectedFlight,
} from "../../../utils/flightSelection";
import SignInPromoBanner from "@/core/common/SignInPromoBanner";
import { FLIGHT_SEARCH_PROVIDERS } from "@/config/flightProviders";
import FareSelectionModal from "./FareSelectionModal";
import {
  applyFlightFilters,
  clampPriceRange,
  createDefaultFiltersFromBounds,
  getActiveFlightFilterChips,
  getPriceBounds,
  getUniqueAirlines,
  needsRefetch,
  toProviderFilters,
} from "../../../utils/flightFilters";
import {
  assignFlightLabels,
  findHiddenLabelled,
  getFlightDurationMinutes,
  pinLabelledFirst,
  sortFlightsForList,
  type FlightLabel,
  type FlightListSortMode,
} from "../../../utils/flightLabels";
import { isRangeNarrowed } from "../../../utils/filterChips";
import { dedupeFlightsByLowestPrice } from "../../../utils/flightDedupe";
import { formatMoney } from "../../../utils/formatMoney";
import type { RefundInfo } from "@/utils/fareGrouping";
import FlightResultsSkeleton from "./FlightResultsSkeleton";
import FilterDrawer from "./FilterDrawer";
import FlightResultsToolbar from "./FlightResultsToolbar";
import FlightSearchSummary from "./FlightSearchSummary";
import FlightResultRow from "./FlightResultRow";
import FlightDetailSidebar from "./FlightDetailSidebar";
import YoriFlightAssistant from "@/components/yt/YoriFlightAssistant";
import "./flight-list.scss";
import "@/components/yt/yori-flight-assistant.scss";

const applyFareOption = (flight: any, option: any) => ({
  ...flight,
  selectedFareOptionId: option.id,
  label: option.label,
  cabinClass: option.cabinClass,
  brandName: option.brandName,
  brandCode: option.brandCode,
  fareBasisCode:
    option.fareBasisCode ??
    option.legs?.[0]?.segments?.[0]?.fareBasisCode,
  price: option.price,
  priceINR: option.priceINR ?? option.price,
  currency: option.currency,
  baseFare: option.baseFare,
  taxes: option.taxes,
  fareBreakdown: option.fareBreakdown,
  bookingClass: option.bookingClass,
  seatsAvailable: option.seatsAvailable,
  legs: option.legs,
  cancellation: option.cancellation,
  baggage: option.baggage,
  inclusions: option.inclusions,
  // Tripjack: each brand has its own bookable priceId — must follow selection.
  tripjackPriceId: option.tripjackPriceId ?? flight.tripjackPriceId ?? null,
  // HostNSell: each brand/family carries its own AirPrice rawItinerary slice.
  hostnsell: option.hostnsell ?? flight.hostnsell ?? null,
});

type ProviderFacets = {
  airlines: { code: string; name: string }[];
  priceBounds: { min: number; max: number; currency?: string };
  // How many priced results `priceBounds` was computed from. The bounds alone
  // cannot express "nothing matched": with an empty result set the backend's
  // `buildSearchFacets` falls back to a literal `{min: 0, max: 1000}`
  // PLACEHOLDER (see flights.searchFlights.controller.js), indistinguishable
  // from a genuine 0-1000 band, so the count has to travel alongside them.
  //
  // It lives WITH the bounds, i.e. it is emitted by whoever computed them —
  // the backend for a facets response (its bounds come from the contextual
  // result set, which the client never sees), the local `getPriceBounds`
  // fallback otherwise. `undefined` means "unknown" and keeps the old
  // always-union behaviour.
  resultCount?: number;
};

// Single source for merging any number of providers' facets into one — used
// both by the `unionFacets` memo (declarative, render-time) and, synchronously,
// by the search handler below (which cannot wait a render for the memo to
// catch up — see the comment at its call site). Airlines are deduped by code
// and the merged list is sorted by name: real data already arrives
// alphabetical from both the backend and `getUniqueAirlines`, so production
// output is unchanged, but the sort makes a MULTI-provider merge deterministic
// instead of depending on which provider answered first. Price bounds take
// the widest min/max span so a provider that only returned expensive fares
// can never clip a cheaper provider's results out of the visible range.
//
// A bucket that returned NO flights contributes no bounds at all. Its
// `priceBounds` is the backend's `{min: 0, max: 1000}` placeholder, not a real
// band, and unioning it in used to drag the slider's floor to 0 on any search
// where one provider came back empty — a premium long-haul with Sabre at
// {1200, 4000} and Tripjack at [] rendered a 0-4000 track with every result
// crammed into the top 30% and `filters.minPrice` seeded at 0. Nothing was
// hidden, but the primary filter was useless. Airlines are unaffected (an
// empty bucket reports none), so only the bounds are skipped.
export const unionFacetsOf = (
  facetsByBucket: Record<string, ProviderFacets>,
): ProviderFacets => {
  const entries = Object.values(facetsByBucket);
  const byCode = new Map<string, string>();
  let min = Infinity;
  let max = -Infinity;
  let currency: string | undefined;
  for (const f of entries) {
    for (const a of f.airlines || []) byCode.set(a.code, a.name);
    currency = currency || f.priceBounds?.currency;
    if (f.resultCount === 0) continue;
    if (Number.isFinite(f.priceBounds?.min)) min = Math.min(min, f.priceBounds.min);
    if (Number.isFinite(f.priceBounds?.max)) max = Math.max(max, f.priceBounds.max);
  }
  return {
    airlines: [...byCode.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    priceBounds: {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) && max > min ? max : (Number.isFinite(min) ? min + 1 : 1000),
      currency,
    },
  };
};

// Fetched separately so each renders as it lands: Sabre answers in ~1.9s
// median, Tripjack in ~8.0s, and waiting for both made every search feel like
// the slower one.
const SEARCH_PROVIDERS = FLIGHT_SEARCH_PROVIDERS;

// Badge colour and copy per label. Kept beside each other so a new label
// cannot be added to one table and forgotten in the other.
/** "3h 20m" for the hidden-option hint; empty when the provider gave no duration. */
const formatDurationShort = (minutes: number | null): string =>
  minutes === null ? "" : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const FLIGHT_LABEL_HIDDEN_I18N_KEY: Record<FlightLabel, string> = {
  recommended: "flightList.hiddenRecommended",
  bestPrice: "flightList.hiddenBestPrice",
  fastest: "flightList.hiddenFastest",
};

const FlightList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  // One bucket per provider. Each provider is fetched separately so its results
  // can render as soon as they land; the displayed list is the deduped union.
  // Keyed by provider id ("sabre" | "tripjack") — one bucket per entry in
  // SEARCH_PROVIDERS, and nothing else: `fetchProviderResults` now REQUIRES a
  // provider, so there is no longer an "all" catch-all bucket.
  const [providerResults, setProviderResults] = useState<Record<string, any[]>>({});
  // The single source of truth EVERY writer of `providerResults` reads and
  // mutates before calling `setProviderResults` with a plain value — never a
  // functional updater. Two provider legs of one search can settle in the
  // same microtask flush (no render in between), and a fare selection or
  // price revalidation can, once the results column stops being fully hidden
  // behind `searching`, land while a search response is still being applied —
  // a functional updater's `prev` is only as fresh as the LAST update
  // actually enqueued for this state slot, and a plain value written from a
  // stale snapshot would silently clobber whatever a differently-timed writer
  // produced. Reading/writing this ref (rather than React's own prev-chain)
  // keeps every writer composing on top of the others regardless of timing.
  // Also updated at render time below so it never drifts from committed state
  // between writes.
  const providerResultsRef = useRef(providerResults);
  providerResultsRef.current = providerResults;

  // Facets as each provider reported them. The displayed airline list and price
  // bounds are the UNION, so it does not matter which provider lands first.
  const [facetsByProvider, setFacetsByProvider] = useState<
    Record<string, ProviderFacets>
  >({});
  const facetsByProviderRef = useRef(facetsByProvider);
  facetsByProviderRef.current = facetsByProvider;

  // Cross-provider merge. Each bucket is already internally deduped by the
  // backend, and dedupe never drops a slot, so the total can only grow as
  // buckets arrive — the count never runs backwards.
  //
  // Every item the API returns is a `{ ui: {...} }` wrapper (see
  // flights.searchFlights.controller.js's `slim`); dedupeFlightsByLowestPrice
  // reads `segments`/`priceINR`/`provider`/`cabinClass` off the object it is
  // given, and those live on `.ui`, not on the wrapper. So we dedupe the
  // unwrapped `ui` objects, then map each survivor back to its ORIGINAL `{
  // ui }` wrapper (never fabricate a new one) — handleFareOptionSelect and
  // revalidateFlight below compare `f === flightRef` against the wrapper
  // objects still held in `providerResults`, so a fresh wrapper here would
  // never match and every selection/revalidation would silently fail to
  // persist.
  const flightResults = useMemo(() => {
    const wrapped = Object.values(providerResults).flat();
    const wrapperByUi = new Map<any, any>();
    for (const f of wrapped) {
      if (f?.ui !== undefined && !wrapperByUi.has(f.ui)) {
        wrapperByUi.set(f.ui, f);
      }
    }
    const deduped = dedupeFlightsByLowestPrice(wrapped.map((f: any) => f?.ui));
    return deduped.map((ui: any) =>
      ui === undefined ? ui : (wrapperByUi.get(ui) ?? { ui }),
    );
  }, [providerResults]);

  // Union of every provider's reported facets, for any future render-time
  // consumer. Not read synchronously by the search handler below — see the
  // comment at that call site for why it needs its own ref-driven computation
  // instead of this memo.
  const unionFacets = useMemo(
    () => (Object.keys(facetsByProvider).length ? unionFacetsOf(facetsByProvider) : null),
    [facetsByProvider],
  );
  // Which card's details accordion is open, keyed by the flight's own identity
  // (`flightKeyOf`) — NOT its position in `visibleFlights`. A provider merging
  // into a live search re-sorts the list underneath the user: an index-keyed
  // panel stays pointing at slot N while forty cheaper fares sort above it, so
  // the open panel silently starts showing a DIFFERENT flight's itinerary,
  // baggage and cancellation terms. Scroll position and `visibleCount` were
  // both made identity-stable across a merge for the same reason; this is the
  // third piece of that.
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "fare" | "cancel" | "baggage"
  >("itinerary");
  const [showModify, setShowModify] = useState<boolean>(
    !!(location.state as any)?.openModify,
  );
  // Page-local loading flag for this results view only. The shared context
  // `loading` flag is also read by homeOne, bookingForm and flightBooking —
  // this page must not key its own UI off it, so we track search-in-flight
  // separately and keep every existing setLoading call untouched.
  const [searching, setSearching] = useState(false);
  // Providers still in flight for the CURRENT search. `searching` stays true
  // until this empties, so the skeleton does not disappear while one provider
  // is still running.
  const [pendingProviders, setPendingProviders] = useState<string[]>([]);
  // Synchronous mirror, read-mutated in `finally` below to decide (as a plain
  // side effect, OUTSIDE any setState updater) whether THIS settle is the
  // LAST one for the search — a `setState` updater callback is expected to
  // be pure, and firing a toast from inside one is fragile (e.g. under
  // StrictMode's intentional double-invoke of updaters in development).
  const pendingProvidersRef = useRef<string[]>([]);
  // Disables the toolbar's Filters button while its facets are stale.
  // Separate from `searching` because a filter Apply or Reset also searches,
  // and there the panel must stay live — see the `criteriaChanged` option on
  // searchFlights.
  const [filtersLoading, setFiltersLoading] = useState(false);
  // Whether the filter drawer is visually open. FlightFilter itself stays
  // mounted at all times (see the render below) — this only controls the
  // drawer's open/closed CSS state, never whether the panel exists.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMode, setSortMode] = useState<FlightListSortMode>("bestDeal");
  const [searchError, setSearchError] = useState<string | null>(null);
  // True once any search has completed (including zero-result or errored
  // searches) — used to decide whether a re-search gets the full-viewport
  // branded overlay or the inline results skeleton. Deliberately NOT the same
  // as hasSearchedRef, which latches before setSearching(true) on the very
  // first search and would misclassify it.
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);
  // Local busy flag for the fare-select -> revalidate -> navigate path. Keeps
  // the FareSelectionModal's confirm button disabled and visibly busy while
  // revalidatePrice is in flight, and lets the handler short-circuit repeat
  // clicks instead of relying solely on the disabled attribute.
  const [revalidating, setRevalidating] = useState(false);
  const { status } = useAuth();

  const navigate = useNavigate();

  const [filters, setFilters] = useState(() =>
    createDefaultFiltersFromBounds({ min: 0, max: 0 }),
  );
  const [priceBounds, setPriceBounds] = useState<{
    min: number;
    max: number;
    currency?: string;
  }>({ min: 0, max: 1000 });
  // Same read-mutate-write discipline as `providerResultsRef`/
  // `facetsByProviderRef`, and for the same reason: the two provider legs of
  // ONE search can settle without a render in between, so the second leg
  // reading `priceBounds` from the RENDER CLOSURE sees the value from before
  // the search started — identical to what the first leg saw — and therefore
  // cannot tell that the first leg just widened (or narrowed) the band.
  // Mirrored at render time below so it never drifts from committed state.
  const priceBoundsRef = useRef(priceBounds);
  priceBoundsRef.current = priceBounds;
  const [availableAirlines, setAvailableAirlines] = useState<
    { code: string; name: string }[]
  >([]);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const lastCriteriaRef = useRef<SearchCriteria | null>(null);
  const lastCriteriaKeyRef = useRef<string | null>(null);
  const hasSearchedRef = useRef(false);
  const searchRequestIdRef = useRef(0);
  // Set by the FIRST provider leg of the CURRENT search to fail (either
  // `success:false` or a thrown error), cleared at the start of every search
  // and after being consumed. The toast itself is NOT fired where this is
  // set — see `pendingFailureMessageRef`'s use in the `finally` block below
  // for why a fast provider failing must not toast over a slow sibling still
  // in flight.
  const pendingFailureMessageRef = useRef<string | null>(null);
  // The sidebar's airline list must always show every carrier on the route. A
  // filtered search only returns the selected carriers, so the list is captured
  // from the last UNFILTERED search and never narrowed by a filtered one.
  const unfilteredAirlinesRef = useRef<{ code: string; name: string }[]>([]);
  // The provider filters actually sent with the last (non-superseded) search.
  // "Is THIS request filtered?" is not enough to decide whether the price
  // range needs re-syncing — un-applying a filter produces an unfiltered
  // request whose fresh, wide bounds still must overwrite whatever narrow
  // range a PRIOR filtered request left in `filters`. Comparing against what
  // was last sent (via the same server-filter-key logic `needsRefetch`
  // already uses for the Apply gate) catches that transition too.
  const lastSentProviderFiltersRef = useRef<{
    airlines: string[];
    stops: string[];
    cabins: string[];
  }>({ airlines: [], stops: [], cabins: [] });

  // Renders the structured baggage object ({ checkIn, cabin, unit, mode })
  // from search results, including the IATA 7kg hand-carry note.
  const formatBaggage = (b: any): string => {
    if (!b || typeof b !== "object") return "Baggage info unavailable";
    const checkIn =
      b.mode === "piece"
        ? `${b.checkIn} PC check-in`
        : `${b.checkIn}${b.checkIn === 0 ? "" : "kg"} check-in`;
    return `${checkIn} + ${b.cabin ?? 7}kg hand carry`;
  };

  const getSegments = (flight: any) => {
    // This row renders one entry per LEG and shows each leg's stop count, so it
    // needs leg objects (which carry `stops`). The merge/dedupe path adds a
    // top-level flattened `segments[]` (individual hops, WITHOUT `stops`) purely
    // for cross-provider dedupe — prefer `legs` so that internal field never
    // drives this render. Falls back to `segments` only when legs are absent.
    if (Array.isArray(flight.legs) && flight.legs.length) return flight.legs;
    if (Array.isArray(flight.segments)) return flight.segments;
    return [];
  };

  const filteredFlights = useMemo(
    () => applyFlightFilters(flightResults, filters),
    [flightResults, filters],
  );

  // Ordering: non-stop flights first, then cheapest→highest within each stop
  // tier. sortFlights also supports pure price sorts, but no Sort By control is
  // exposed on this page, so results always use the default ordering.
  // Ranked over the FILTERED set, so the badges stay meaningful after the user
  // narrows to (say) non-stop only. Keyed by flight object identity, so no
  // card-key scheme has to stay in sync. Recomputes when a provider merges in,
  // which can move a badge mid-search; that is intended, the ranking is only
  // as good as the results currently in hand.
  //
  // Computed from the UNSORTED filtered set on purpose: `sortedFlights` below
  // now orders BY these labels, so deriving them from it would be circular.
  // Safe because `assignFlightLabels` is order-independent — suppressing ties
  // means a winner is decided by its values, never by its position.
  const flightLabels = useMemo(
    () => assignFlightLabels(filteredFlights),
    [filteredFlights],
  );

  // Default ordering is non-stop first, then cheapest — which scatters the
  // badges: a two-stop Best Price sorts below every non-stop, so the user only
  // finds it by scrolling far enough to stumble on it. Pin the labelled
  // flights to the head of the list; everything else keeps the default order
  // below them.
  const sortedFlights = useMemo(() => {
    const ordered = sortFlightsForList(filteredFlights, sortMode);
    return sortMode === "bestDeal"
      ? pinLabelledFirst(ordered, flightLabels)
      : ordered;
  }, [filteredFlights, flightLabels, sortMode]);

  // A narrow CLIENT filter can hide a genuinely better fare and the user never
  // learns it existed. Rather than exempt those flights from filtering — which
  // would put a card the user explicitly filtered out back on their screen —
  // keep the filter authoritative and just say what it cost them.
  //
  // Only client filters are detectable here: airlines/stops/cabins are
  // SERVER_FILTER_KEYS, so flights they exclude never reach the browser.
  const hiddenLabelled = useMemo(
    () => findHiddenLabelled(flightResults, filteredFlights),
    [flightResults, filteredFlights],
  );

  // Single source for the identity a card renders under (`data-flight-key`
  // in the JSX below) AND the identity the scroll-anchor effects search for
  // — kept as one function so the two can never drift apart.
  const flightKeyOf = (f: any) => {
    const flight = f?.ui;
    return `${flight?.provider ?? "sabre"}:${flight?.airline}:${flight?.departure}:${flight?.price}`;
  };

  // A busy route returns thousands of offers (2,551 from Tripjack alone has
  // been seen in production). Mounting every card at once costs seconds of
  // main-thread work AFTER the data has already arrived — invisible in server
  // timings but very visible to the user. Render a batch and grow on scroll.
  const RESULTS_BATCH = 20;
  const [visibleCount, setVisibleCount] = useState(RESULTS_BATCH);
  // Bumped once per SEARCH (in `searchFlights`'s fan-out below), never once
  // per provider leg. A genuinely new search, a filter Apply/Reset, or a
  // server-filter chip's "×" (which re-shops immediately, same as Apply) all
  // start the list over at the top — but a provider merging into the SAME
  // search must not, since that would unmount the cards the user is
  // currently reading, exactly what scroll-hold below exists to prevent.
  // Keying the reset off this counter instead of `sortedFlights` is what
  // makes that distinction possible: a merge changes `sortedFlights` too, so
  // resetting off that array (the old approach) could not tell the two
  // apart.
  const [searchGenerationTick, setSearchGenerationTick] = useState(0);
  useEffect(() => {
    setVisibleCount(RESULTS_BATCH);
  }, [searchGenerationTick]);

  // When a second provider merges in, cheaper fares are inserted ABOVE what the
  // user is reading and the list re-sorts. Anchor on the topmost visible card
  // and restore its exact offset so nothing jumps under them.
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<{ key: string; top: number } | null>(null);

  // Records where the user ACTUALLY is, right now, in real layout
  // coordinates: the topmost card still (partly) on screen, plus its exact
  // viewport offset.
  //
  // Called SYNCHRONOUSLY from the provider-response handler immediately
  // before the bucket write that causes the merge — deliberately not from an
  // effect. An effect can only re-run when one of its dependencies changes,
  // and NOTHING a dependency array can watch changes while the user simply
  // scrolls: `sortedFlights` is a memo over `[flightResults, filters]`, and
  // growing the batch changes `visibleFlights`, not `sortedFlights`. So an
  // effect-captured anchor freezes at the instant the FIRST provider landed,
  // and the restore several seconds later would scroll the user BACK to
  // wherever they were then — strictly worse than not holding scroll at all.
  // Capturing at the write site makes staleness structurally impossible:
  // zero layout-affecting work happens between this read and the state write
  // it precedes, so the anchor is by construction the pre-merge DOM.
  const captureScrollAnchor = () => {
    const node = resultsContainerRef.current;
    if (!node) {
      // No results column mounted (first provider of a fresh search, whose
      // buckets were just cleared) — nothing to hold, and any anchor left
      // from before must not survive into the coming merge.
      scrollAnchorRef.current = null;
      return;
    }
    const cards = Array.from(
      node.querySelectorAll<HTMLElement>("[data-flight-key]"),
    );
    const firstVisible = cards.find((c) => c.getBoundingClientRect().bottom > 0);
    // Holding the card the user is reading is the right goal DEEP in the list.
    // At the TOP it is exactly wrong: the list is cheapest-first, so everything
    // a merge inserts goes ABOVE — and pinning card #0 in place would scroll
    // the user DOWN past the very cheaper fares they were waiting for. Reported
    // from live use as "it scrolled me to the middle and I was nowhere".
    // So anchor only once they have scrolled past the first card; until then
    // the thing to hold is the top of the list, which needs no correction.
    const isAtTopOfList = !firstVisible || firstVisible === cards[0];
    scrollAnchorRef.current = isAtTopOfList
      ? null
      : {
          key: firstVisible.dataset.flightKey as string,
          top: firstVisible.getBoundingClientRect().top,
        };
  };

  // Bumped ONLY by this effect's own growth branch below, to ask for exactly
  // one more run of itself once the grown batch has committed. Deliberately
  // NOT `visibleCount` itself: the user growing the batch on their own (the
  // "show more" click, or the IntersectionObserver sentinel) also changes
  // `visibleCount`, and depending on it directly would re-run this effect —
  // and clear a perfectly live anchor early, well before any merge — for a
  // reason that has nothing to do with a provider landing.
  const [anchorRetryTick, setAnchorRetryTick] = useState(0);

  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    const node = resultsContainerRef.current;
    if (!anchor || !node) return;
    const el = node.querySelector<HTMLElement>(
      `[data-flight-key="${CSS.escape(anchor.key)}"]`,
    );
    if (el) {
      const delta = el.getBoundingClientRect().top - anchor.top;
      if (delta !== 0) window.scrollBy(0, delta);
      // Clear on a HIT — restored, nothing left to do.
      scrollAnchorRef.current = null;
      return;
    }
    // Not rendered. Two different reasons, handled differently:
    //
    // 1. The merge pushed the anchor's flight past the current batch
    //    boundary (very plausible: Tripjack routinely returns fares cheaper
    //    than what Sabre already showed, sorting above a card the user has
    //    scrolled several batches past). It is still in `sortedFlights`,
    //    just beyond `visibleCount` — grow the batch to include it, rounded
    //    up to a RESULTS_BATCH boundary so batching stays coherent, and
    //    bump `anchorRetryTick` to ask for one more run of THIS effect once
    //    that grown batch renders, where it finds the now-rendered element
    //    and clears the anchor via the HIT path above. One extra render,
    //    not a loop — `anchorIndex` can only ever shrink relative to a
    //    growing `visibleCount`, so this branch cannot re-trigger itself for
    //    the same anchor. Rendering up to where the user had already
    //    scrolled is the accepted cost of grow-on-scroll over true
    //    windowing.
    //
    // 2. The flight is genuinely gone (deduped away by a cheaper duplicate
    //    from the other provider, or filtered out) — no amount of growing
    //    will ever render it. Clearing here (rather than leaving the stale
    //    `{key, top}` sitting in the ref) matters because this effect keeps
    //    running on every LATER, unrelated `sortedFlights` change too (a
    //    filter Apply, a Reset bringing a previously-filtered flight back,
    //    …) — an uncleared anchor would still be "live" then, and if some
    //    future render happens to contain an element with that same key, a
    //    scroll correction would fire for an action that was never supposed
    //    to scroll at all.
    const anchorIndex = sortedFlights.findIndex(
      (f: any) => flightKeyOf(f) === anchor.key,
    );
    if (anchorIndex >= 0 && anchorIndex >= visibleCount) {
      setVisibleCount(
        Math.ceil((anchorIndex + 1) / RESULTS_BATCH) * RESULTS_BATCH,
      );
      setAnchorRetryTick((t) => t + 1);
      return; // keep the anchor — retry once the grown batch renders
    }
    scrollAnchorRef.current = null;
  }, [sortedFlights, anchorRetryTick]);

  const visibleFlights = useMemo(
    () => sortedFlights.slice(0, visibleCount),
    [sortedFlights, visibleCount],
  );
  const hasMoreToRender = visibleCount < sortedFlights.length;

  // Sentinel just below the last rendered card: when it scrolls into view the
  // next batch mounts. Falls back to a button if IntersectionObserver is absent.
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMoreToRender) return;
    const node = loadMoreRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => c + RESULTS_BATCH);
        }
      },
      // Start the next batch before the sentinel is actually on screen so
      // scrolling stays continuous rather than stuttering at each boundary.
      { rootMargin: "600px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMoreToRender, visibleCount]);

  const formatTime = (time: string) =>
    dayjs(`1970-01-01T${time}`).format("HH:mm");

  const {
    fromQuery,
    setFromQuery,
    toQuery,
    setToQuery,
    selectedFromAirport,
    setSelectedFromAirport,
    selectedToAirport,
    setSelectedToAirport,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    adults,
    setAdults,
    children_,
    setChildren_,
    infants,
    setInfants,
    cabinClass,
    setCabinClass,
    flightType,
    setFlightType,
    multiTrips,
    setMultiTrips,
    setLoading,
    loading,
    currency,
    setCurrency,
    userCurrency,
    setSelectedFlight,
    selectedFlight,
    defaultsApplied,
  } = useFlightSearch();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // A search fetches the full result set once; filtering and sorting re-order it
  // in-memory (no network, no loader flash). Every match is rendered — there is
  // no paging, so this count is exactly what the user can scroll through.
  const totalResults = sortedFlights.length;
  const travellerCount = (adults || 0) + (children_ || 0) + (infants || 0);

  const selectedFlightWrapper = useMemo(() => {
    if (!sortedFlights.length) return null;
    if (selectedCardKey) {
      const match = sortedFlights.find(
        (f: any) => flightKeyOf(f) === selectedCardKey,
      );
      if (match) return match;
    }
    return sortedFlights[0];
  }, [sortedFlights, selectedCardKey]);

  const activeSelectedKey = selectedFlightWrapper
    ? flightKeyOf(selectedFlightWrapper)
    : null;

  const listFromCity =
    selectedFromAirport?.subtitle ||
    selectedFromAirport?.label?.split(",")[0] ||
    fromQuery;
  const listToCity =
    selectedToAirport?.subtitle ||
    selectedToAirport?.label?.split(",")[0] ||
    toQuery;

  // The toolbar's summary reads from the same pure helper the panel's chips do,
  // so the two can never disagree about what is applied. No state is shared.
  const activeChips = useMemo(
    () =>
      getActiveFlightFilterChips(filters, priceBounds, {
        airlines: availableAirlines,
        formatPrice: (value) =>
          formatMoney(value, priceBounds.currency || currency || "USD"),
      }),
    [filters, priceBounds, availableAirlines, currency],
  );

  // Two places used to state this count independently, and they disagreed —
  // the old heading said "200 Flights Found" while the panel said "33 out of
  // 71", and the pair read as a bug. Both now state one number, the matched
  // count, and wait for the same signal: nothing until every provider has
  // landed, since a count that climbs mid-search invites reading a partial
  // as the final one. Suppressed at zero too — the empty state below already
  // says it, and the panel still carries "0 flights found." to point at the
  // filters. Rendered only when it has something to say, so the toolbar
  // count cannot leave a gap during the search.
  //
  // The "X of Y" form is gone on purpose. Y was `flightResults.length`, the
  // size of the merged provider buckets, which is not a fact about the
  // route — it moves with how much of the filter each provider applied
  // upstream. On one logged RUH→AMM search under Saudia + non-stop, Sabre
  // re-shopped and returned 4 while Tripjack (which is sent no airline
  // modifier) returned 29 from every carrier, so the pair rendered "4 out of
  // 29" — the user was being shown the size of that gap. Any future
  // denominator has to be a stable route total, not a live buffer size.
  const countLabel =
    pendingProviders.length === 0 && sortedFlights.length > 0
      ? t(
          sortedFlights.length === 1
            ? "flightList.flightFound"
            : "flightList.flightsFound",
          { count: sortedFlights.length },
        )
      : null;

  // The full-screen plane belongs to a page that has never shown anything.
  // `hasCompletedSearch` was the wrong proxy: it only flips once EVERY provider
  // settles, while the sidebar goes live on the FIRST — so a filter applied in
  // that window threw the whole-page plane back over results the user was
  // already reading. This latches the moment anything has ever arrived and
  // never unlatches, so from then on a re-search only skeletons the column.
  // Assigned during render (same pattern as `filtersRef`) so the very response
  // that produces results is the one that suppresses the plane.
  const hasShownResultsRef = useRef(false);
  if (flightResults.length > 0) hasShownResultsRef.current = true;

  // The criteria currently committed to context. Used for the first search and
  // as the fallback when Search is clicked without explicit criteria.
  const contextCriteria: SearchCriteria = useMemo(
    () => ({
      fromQuery,
      toQuery,
      selectedFromAirport,
      selectedToAirport,
      departureDate,
      returnDate,
      adults,
      children_,
      infants,
      cabinClass,
      flightType,
      multiTrips,
    }),
    [
      fromQuery,
      toQuery,
      selectedFromAirport,
      selectedToAirport,
      departureDate,
      returnDate,
      adults,
      children_,
      infants,
      cabinClass,
      flightType,
      multiTrips,
    ],
  );

  const contextCriteriaKey = criteriaKey(contextCriteria);

  // A home-page destination card links here as ?to=<IATA>. The card names a city
  // to fly TO and nothing else, so the link overrides the destination only — the
  // origin stays whichever airport geo detection resolved for this traveller.
  // An unknown code resolves to undefined and the page searches its normal
  // default route rather than nothing at all.
  const deepLinkDestination = useMemo(() => {
    const code = new URLSearchParams(location.search).get("to");
    return code ? lookupAirportByIata(code) : undefined;
  }, [location.search]);

  // Dates from a homepage holiday link. Parsed the same way as the destination
  // deep link above, and folded into initialCriteria below for the same reason.
  const deepLinkDates = useMemo(
    () => readDateDeepLink(location.search, new Date()),
    [location.search],
  );

  // Origin, passengers and cabin from a full search link (e.g. the chat
  // assistant's ?from=RUH&to=JED&dep=…&adults=2&cabin=business). Folded in and
  // committed exactly like the destination/date links above.
  const deepLinkSearch = useMemo(
    () => readFlightSearchDeepLink(location.search),
    [location.search],
  );

  // What the first search runs on. The deep link is folded in here rather than
  // written to context and waited on: trigger 1 fires in the same commit that
  // geo defaults land, so a context write from an effect would arrive one commit
  // too late — the page would already have searched the default destination and
  // latched hasSearchedRef against trying again.
  const initialCriteria: SearchCriteria = useMemo(() => {
    let next = contextCriteria;
    if (deepLinkDestination) {
      next = {
        ...next,
        toQuery: deepLinkDestination.subtitle || deepLinkDestination.value,
        selectedToAirport: deepLinkDestination,
      };
    }
    if (deepLinkDates) {
      next = {
        ...next,
        departureDate: dayjs(deepLinkDates.departureDate),
        ...(deepLinkDates.returnDate
          ? { returnDate: dayjs(deepLinkDates.returnDate), flightType: "roundtrip" }
          : {}),
      };
    }
    if (deepLinkSearch) {
      const { from, adults: a, children: c, infants: i, cabin } = deepLinkSearch;
      next = {
        ...next,
        ...(from
          ? { fromQuery: from.subtitle || from.value, selectedFromAirport: from }
          : {}),
        ...(a !== undefined ? { adults: a } : {}),
        ...(c !== undefined ? { children_: c } : {}),
        ...(i !== undefined ? { infants: i } : {}),
        ...(cabin ? { cabinClass: cabin } : {}),
      };
    }
    return next;
  }, [contextCriteria, deepLinkDestination, deepLinkDates, deepLinkSearch]);

  // Commit the linked city to context so the search bar shows it and every later
  // search keeps it. Gated on defaultsApplied because the context's own geo
  // effect writes selectedToAirport when it lands, and would otherwise clobber
  // this. Writing after that commit also means the search-bar draft reads it as
  // a genuine external change and re-seeds from it (see useSearchDraft).
  useEffect(() => {
    if (!defaultsApplied || !deepLinkDestination) return;
    if (selectedToAirport?.value === deepLinkDestination.value) return;
    setSelectedToAirport(deepLinkDestination);
    setToQuery(deepLinkDestination.subtitle || deepLinkDestination.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, deepLinkDestination, selectedToAirport]);

  useEffect(() => {
    if (!defaultsApplied || !deepLinkDates) return;
    setDepartureDate(dayjs(deepLinkDates.departureDate));
    if (deepLinkDates.returnDate) {
      setReturnDate(dayjs(deepLinkDates.returnDate));
      setFlightType("roundtrip");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, deepLinkDates]);

  useEffect(() => {
    if (!defaultsApplied || !deepLinkSearch) return;
    const { from, adults: a, children: c, infants: i, cabin } = deepLinkSearch;
    if (from) {
      setSelectedFromAirport(from);
      setFromQuery(from.subtitle || from.value);
    }
    if (a !== undefined) setAdults(a);
    if (c !== undefined) setChildren_(c);
    if (i !== undefined) setInfants(i);
    if (cabin) setCabinClass(cabin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, deepLinkSearch]);

  const isSearchable = (c: SearchCriteria) =>
    c.flightType === "multiway"
      ? (c.multiTrips?.length ?? 0) > 0
      : Boolean(c.selectedFromAirport && c.selectedToAirport);

  const travelers = {
    infant: infants,
    adult: adults,
    children: children_,
  };
  const isMultiTrip = flightType === "multiway";

  function formatTravelersForSabre(travelers: any) {
    const passengerTypeQuantity = [];

    if (travelers.adults && travelers.adults > 0) {
      passengerTypeQuantity.push({
        Code: "ADT",
        Quantity: travelers.adults,
      });
    }

    if (travelers.children && travelers.children > 0) {
      passengerTypeQuantity.push({
        Code: "CHD",
        Quantity: travelers.children,
      });
    }

    if (travelers.infants && travelers.infants > 0) {
      passengerTypeQuantity.push({
        Code: "INF",
        Quantity: travelers.infants,
      });
    }

    return passengerTypeQuantity;
  }

  // `options` is REQUIRED, and so are `provider` and `requestId` inside it.
  // This function has exactly one caller (`searchFlights`'s fan-out), which
  // always supplies both; making them optional only kept the two bugs below
  // representable in the type system.
  const fetchProviderResults = async (
    criteria: SearchCriteria,
    options: {
      activeFilters?: typeof filters;
      resetFilters?: boolean;
      /**
       * True only when the SEARCH CRITERIA changed (new route/date/pax), which
       * is what makes the sidebar's airline list and price range stale. NOT
       * `resetFilters` — that is also passed by handleFilterReset, where the
       * criteria are unchanged and the user is working inside the panel.
       */
      criteriaChanged?: boolean;
      // Which provider this request asks for, and therefore which bucket its
      // response fills. Required: a missing provider used to fall back to an
      // "all" bucket, which no caller produces any more and which would have
      // silently merged a full two-provider response alongside the per-provider
      // buckets.
      provider: string;
      // Assigned once by `searchFlights` and shared by every provider request
      // of that same search. `Array.map` runs each async call synchronously up
      // to its first `await`, so if this function self-incremented
      // `searchRequestIdRef` instead, the Sabre and Tripjack legs of ONE
      // search would each grab a DIFFERENT id — and the first one to resolve
      // would then look "superseded" by the second and get silently dropped.
      // Required for exactly that reason: the `?? ++searchRequestIdRef.current`
      // fallback this replaces made that bug representable again.
      requestId: number;
    },
  ) => {
    // Date validation lives in `searchFlights` now, BEFORE the requestId is
    // assigned and the buckets are cleared — see its comment for why. This
    // function is only ever called by `searchFlights`, which already
    // rejected an invalid `criteria` before dispatching, so there is nothing
    // left to check here.
    const requestId = options.requestId;
    // Which bucket this response fills. Keyed by provider id ("sabre" |
    // "tripjack").
    const resultBucket = options.provider;
    lastCriteriaRef.current = criteria;
    lastCriteriaKeyRef.current = criteriaKey(criteria);

    try {
      setLoading(true);
      setSearching(true);
      // Cleared in `finally`, which runs for every exit below (success,
      // `success: false`, and a thrown error) behind the same supersession
      // guard — so a failed search can never leave the Filters button
      // stuck disabled.
      if (options?.criteriaChanged) setFiltersLoading(true);
      const activeFilters = options?.activeFilters ?? filters;
      const formatTrip = (trip: Trip) => ({
        tripType: criteria.flightType,
        origin: trip.selectedFromAirport?.value,
        destination: trip.selectedToAirport?.value,
        departuredate: trip.departureDate.format("YYYY-MM-DD"),
        // For round-trip, the return date is a property of the search, not the leg.
        returndate:
          criteria.flightType === "roundtrip"
            ? criteria.returnDate.format("YYYY-MM-DD")
            : undefined,
        passengercount: {
          adult: criteria.adults,
          child: criteria.children_,
          infant: criteria.infants,
        },
        cabin: criteria.cabinClass,
      });

      let requestPayload: any;

      if (criteria.flightType === "multiway") {
        requestPayload = criteria.multiTrips.map(formatTrip);
      } else {
        requestPayload = formatTrip({
          fromQuery: criteria.fromQuery,
          toQuery: criteria.toQuery,
          selectedFromAirport: criteria.selectedFromAirport,
          selectedToAirport: criteria.selectedToAirport,
          departureDate: criteria.departureDate,
        });
      }

      // No page params → backend returns the full (optionally provider-filtered)
      // result set; we filter, sort, and paginate client-side, so a search hits
      // Sabre/Tripjack exactly once. `providerFilters` pushes airline/stop/cabin
      // selections into the upstream request itself so the provider spends its
      // itinerary budget on the selection instead of us narrowing an
      // already-truncated set.
      const response = await api.post(`/api/flights/searchFlights`, {
        userCurrency,
        data: requestPayload,
        providerFilters: toProviderFilters(activeFilters),
        providers: [options.provider],
      }, {
        headers: getBrowserTimezone()
          ? { "X-Timezone": getBrowserTimezone() }
          : undefined,
      });

      // A newer search may have started (and even resolved) while this one was
      // in flight. Everything below — including a "success: false" response —
      // must not touch state for a superseded request: a stale failure must
      // not wipe results a newer, successful search already rendered, and (in
      // `finally`) a stale settle must not drop the loader for a search that
      // is still running.
      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      if (response.data?.success === false) {
        // Clear only THIS provider's bucket — a sibling provider's already-
        // landed (or still-to-land) results must survive one provider's
        // failure. Ref-based read-mutate-write for `providerResults` — see
        // its declaration comment for why. `facetsByProvider` gets the same
        // ref-delete treatment as its success-path write below, so a failed
        // provider's stale facets can never linger in `facetsByProviderRef`.
        const nextProviderResults = { ...providerResultsRef.current };
        delete nextProviderResults[resultBucket];
        providerResultsRef.current = nextProviderResults;
        setProviderResults(nextProviderResults);

        const nextFacetsByProvider = { ...facetsByProviderRef.current };
        delete nextFacetsByProvider[resultBucket];
        facetsByProviderRef.current = nextFacetsByProvider;
        setFacetsByProvider(nextFacetsByProvider);

        // Do NOT toast here. A fast provider (Sabre, ~1.9s median) failing
        // while a slow sibling (Tripjack, ~8s) is still in flight is the
        // MORE likely single-failure ordering, and toasting now would show
        // an error over results the slow provider hasn't rendered yet —
        // exactly what the brief's "one provider dying must not put an
        // error over another's results" rule forbids. The decision is
        // deferred to the `finally` block below, which only fires once
        // every provider of this search has settled.
        if (!pendingFailureMessageRef.current) {
          pendingFailureMessageRef.current =
            response.data?.error || "Flight search failed";
        }
        return;
      }

      const normalizeFlights = (data: any) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.flights)) return data.flights;
        return [];
      };

      const flights = normalizeFlights(response.data);

      // Capture the scroll anchor HERE — the last moment the DOM still shows
      // the pre-merge list AND the user's real, current scroll position. See
      // `captureScrollAnchor`'s comment for why an effect cannot do this.
      captureScrollAnchor();

      // Synchronous ref mutation for the same reason as the facets ref above
      // — a sibling provider's concurrent success/failure branch reads this
      // ref in the SAME microtask flush, before a render would otherwise
      // update it.
      const nextProviderResults = { ...providerResultsRef.current, [resultBucket]: flights };
      providerResultsRef.current = nextProviderResults;
      setProviderResults(nextProviderResults);

      const resolvedCurrency = response.data?.currency || userCurrency;

      if (resolvedCurrency) {
        setCurrency(resolvedCurrency);
      }

      // A filtered search only returns the carriers/prices it was asked for —
      // never let that narrow the sidebar's airline list or leave a stale
      // price range excluding results the new search actually found.
      const requestedFilters = toProviderFilters(activeFilters);
      const isProviderFiltered =
        requestedFilters.airlines.length > 0 ||
        requestedFilters.stops.length > 0 ||
        requestedFilters.cabins.length > 0;
      // A request is only "unfiltered" (safe to use for the pinned airline
      // list) when NONE of the server keys are set — a stops- or cabins-only
      // Apply still returns a strict subset of carriers (e.g. only those
      // flying non-stop) and must not poison the pinned list either.
      const isUnfiltered = !isProviderFiltered;
      // "Is THIS request filtered?" is not the right question for deciding
      // whether the price range needs re-syncing: un-applying a filter (via
      // Apply, or via a server-filter chip's "×") produces an UNFILTERED
      // request whose fresh bounds still must overwrite whatever narrow range
      // a PRIOR filtered request left in `filters` — otherwise the old,
      // narrower range silently zeroes out the newly-unfiltered result set.
      // Comparing against what was actually sent last time (ignoring order,
      // same as the Apply-gate's own `needsRefetch`) catches that direction
      // too, not just "filter added".
      const providerFiltersChanged = needsRefetch(
        lastSentProviderFiltersRef.current as any,
        requestedFilters as any,
      );
      lastSentProviderFiltersRef.current = requestedFilters;

      const syncBoundsAndFilters = (bounds: {
        min: number;
        max: number;
        currency?: string;
      }) => {
        // The bounds this response is superseding — read from the REF, not
        // the render closure. Both provider legs of one search close over the
        // same render, so a closure read hands leg 2 the pre-search bounds and
        // hides everything leg 1 just wrote.
        const priorBounds = priceBoundsRef.current;
        priceBoundsRef.current = bounds;
        setPriceBounds(bounds);
        // Did this response's merged bounds reach BEYOND what was already
        // committed? A later provider leg widening the band is the whole point
        // of fetching providers separately (Tripjack routinely undercuts
        // Sabre's floor), and it must re-run the sync even when the filter
        // keys did not change — which, for the second leg of one search, they
        // never do: leg 1 already wrote `lastSentProviderFiltersRef` with the
        // very filters leg 2 then compares against, so leg 2 always computes
        // `providerFiltersChanged === false`. Without this term, a chip "×" or
        // a filtered re-shop pins `filters.minPrice` to whichever provider
        // answered FIRST while `priceBounds` widens to the union underneath
        // it: the slider track shows 180-2400, `filters` still says 300, and
        // every fare between 180 and 299 — exactly the cheaper fares this
        // feature exists to surface — is filtered out of both the list and the
        // count, with the slider rendering as though the user had narrowed it.
        const boundsWidened =
          bounds.min < priorBounds.min || bounds.max > priorBounds.max;
        if (options?.resetFilters) {
          setFilters(createDefaultFiltersFromBounds(bounds));
        } else if (isProviderFiltered || providerFiltersChanged || boundsWidened) {
          // Spread the LIVE filters (filtersRef.current), not the
          // `activeFilters` snapshot captured when THIS request was issued.
          // A re-shop can take 1.3-2.5s (Sabre) up to 11.6s (Tripjack), and
          // the sidebar stays interactive the whole time — spreading the
          // stale issue-time snapshot here would silently discard any
          // baggage/time/price edit the user made while the request was in
          // flight the instant the response lands.
          const liveFilters = filtersRef.current;
          // The filtered (or just-unfiltered) set's cheapest/priciest fare can
          // differ from what `filters` currently holds. Only CLAMP an
          // actually-narrowed range into the new bounds — a range still at
          // the OLD full bounds (the common case: the user never touched the
          // slider) must map onto the NEW full bounds, not an independently
          // clamped pair. Clamping both ends of an untouched full-width range
          // into disjoint new bounds (e.g. old 100-900 vs new 950-1200) would
          // collapse it to a single point and hide every result — the same
          // zero-results bug this branch already fixed once.
          const priceNarrowed = isRangeNarrowed(
            { min: liveFilters.minPrice, max: liveFilters.maxPrice },
            priorBounds,
          );
          // A narrowed range can also land entirely OUTSIDE the new bounds
          // (e.g. the user narrowed to 300-500, then an airline Apply's real
          // fares only exist at 950-1200) — clamping each end independently
          // in that case pins both to the same edge and collapses the range
          // to a single point, hiding almost everything the new response
          // actually has. Once the user's range no longer overlaps the data
          // at all, their old selection is moot for this response, and the
          // only choice that guarantees nothing is hidden is the same one
          // used for the untouched case: the new full bounds.
          const rangeOverlapsBounds =
            liveFilters.maxPrice >= bounds.min && liveFilters.minPrice <= bounds.max;
          const [minPrice, maxPrice] =
            priceNarrowed && rangeOverlapsBounds
              ? clampPriceRange(liveFilters.minPrice, liveFilters.maxPrice, bounds)
              : [bounds.min, bounds.max];
          const syncedFilters = {
            ...liveFilters,
            minPrice,
            maxPrice,
          };
          setFilters(syncedFilters);
          filtersRef.current = syncedFilters;
        }
      };

      // `resultCount` is what lets `unionFacetsOf` tell an empty bucket's
      // placeholder bounds from a real price band — see its declaration on
      // `ProviderFacets`. It comes from whoever COMPUTED the bounds: the
      // backend when it sent facets (it counts the set its bounds were derived
      // from, which is not necessarily the returned array), and `flights`
      // itself on the local-derivation fallback. Left `undefined` when the
      // backend sent facets without a count — that is "unknown", and unknown
      // buckets keep the old, always-union behaviour.
      const returnedFacets: ProviderFacets = response.data?.facets
        ? {
            airlines: response.data.facets.airlines || [],
            priceBounds: response.data.facets.priceBounds || { min: 0, max: 1000 },
            resultCount: response.data.facets.resultCount,
          }
        : {
            airlines: getUniqueAirlines(flights),
            priceBounds: getPriceBounds(flights),
            resultCount: flights.length,
          };

      // Mutate the ref SYNCHRONOUSLY, not just via the `facetsByProviderRef.current =
      // facetsByProvider` assignment that runs at render time. Sabre and Tripjack
      // now resolve concurrently, and when both responses land in the same
      // microtask flush (no render commits between them), the second one to run
      // would otherwise read a ref that doesn't yet reflect the first one's
      // bucket — silently dropping it from the merge instead of unioning with it.
      const nextFacetsByProvider = {
        ...facetsByProviderRef.current,
        [resultBucket]: returnedFacets,
      };
      facetsByProviderRef.current = nextFacetsByProvider;
      setFacetsByProvider(nextFacetsByProvider);

      // The union across every bucket that has landed so far — airlines AND
      // price bounds — not just this response, so a second provider arriving
      // cannot narrow what the first already established (neither the visible
      // carrier list nor the price range).
      const mergedFacets = unionFacetsOf(nextFacetsByProvider);

      if (isUnfiltered) {
        unfilteredAirlinesRef.current = mergedFacets.airlines;
      }
      setAvailableAirlines(
        unfilteredAirlinesRef.current.length
          ? unfilteredAirlinesRef.current
          : mergedFacets.airlines,
      );
      // Widening (or holding steady) can never falsely register as the user
      // having "narrowed" the range: `syncBoundsAndFilters` compares the live
      // filter values against `priorBounds` (the OLD bounds, read before this
      // call), and a union of every bucket so far is always >= any single
      // bucket's own span — so an untouched full-width selection still reads
      // as untouched, and a genuinely narrowed selection still overlaps and
      // clamps cleanly into the (same-or-wider) new range.
      syncBoundsAndFilters(mergedFacets.priceBounds);

      // console.log("Sabre Flights:", response.data);
    } catch (error: any) {
      // Same supersession rule as the response guard above, for the third
      // sibling path: a request that fails by THROWING (network drop,
      // timeout, CORS) rather than resolving with `success: false` must not
      // wipe a newer, superseding search's results or toast an error for a
      // request the user has already moved on from. Still logged for
      // debugging — only the user-facing side effects are skipped.
      console.error("Flight search failed:", error);
      if (requestId !== searchRequestIdRef.current) {
        return;
      }
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to search flights right now";
      // Clear only THIS provider's bucket — a sibling provider's already-
      // landed (or still-to-land) results must survive one provider's
      // failure. Same ref-based discipline (both `providerResults` and
      // `facetsByProvider`) as the success:false branch above.
      const nextProviderResults = { ...providerResultsRef.current };
      delete nextProviderResults[resultBucket];
      providerResultsRef.current = nextProviderResults;
      setProviderResults(nextProviderResults);

      const nextFacetsByProvider = { ...facetsByProviderRef.current };
      delete nextFacetsByProvider[resultBucket];
      facetsByProviderRef.current = nextFacetsByProvider;
      setFacetsByProvider(nextFacetsByProvider);

      // Deferred to `finally` — see the success:false branch above for why.
      if (!pendingFailureMessageRef.current) {
        pendingFailureMessageRef.current = message;
      }
    } finally {
      // Same supersession rule as the response guard above: a stale request
      // settling after a newer one has already started must not clear the
      // loader out from under the newer, still-in-flight search.
      if (requestId === searchRequestIdRef.current) {
        setLoading(false);
        // The sidebar only needs SOME facets to be useful, so it comes off
        // its skeleton as soon as the FIRST provider of this search settles
        // (success or failure) — not gated on `pendingProviders`, unlike
        // `searching`/`hasCompletedSearch` below, which intentionally wait
        // for every provider so the "N Flights Found" header and the
        // results-vs-loader switch never flicker mid-merge.
        setFiltersLoading(false);
        // Ref-based read-mutate-write, mirrored into state below. Deciding
        // "is this the LAST settle" needs to happen synchronously (so the
        // toast side effect, further down, can run as plain code rather than
        // from inside a setState updater — see `pendingProvidersRef`'s
        // declaration comment for why) and needs to be correct even when two
        // provider legs' `finally` blocks run back to back in the same
        // microtask flush, which a value read from the `pendingProviders`
        // state closure could miss.
        pendingProvidersRef.current = pendingProvidersRef.current.filter(
          (p) => p !== resultBucket,
        );
        setPendingProviders(pendingProvidersRef.current);
        if (pendingProvidersRef.current.length === 0) {
          setSearching(false);
          setHasCompletedSearch(true);
          // The LAST settle of this search is the only point that knows the
          // FINAL outcome of every provider leg — toast here, not from an
          // individual leg's failure branch. `providerResultsRef` is already
          // up to date for every leg by now (this leg's own success/failure
          // write happened synchronously above, and any sibling leg's write
          // happened synchronously in ITS OWN call before its `finally`
          // ran), so this is never stale even when two legs settle in the
          // same microtask flush. Only toast when NOTHING came back — a fast
          // provider failing while a slow sibling is still in flight (the
          // likelier ordering given Sabre ~1.9s vs Tripjack ~8s) must never
          // show an error over results the slow provider is about to render.
          const anyResults = Object.values(providerResultsRef.current).some(
            (list: any) => list?.length,
          );
          if (pendingFailureMessageRef.current && !anyResults) {
            setSearchError(pendingFailureMessageRef.current);
            toast.error(pendingFailureMessageRef.current);
          } else {
            setSearchError(null);
          }
          pendingFailureMessageRef.current = null;
        }
      }
    }
  };

  // Fans out one request per provider. They share a requestId, so a newer
  // search supersedes every in-flight provider request at once. The id is
  // assigned HERE, once, rather than inside `fetchProviderResults` — see the
  // comment on `requestId` in its options type for why letting each provider
  // leg self-increment would break that sharing.
  const searchFlights = (criteria: SearchCriteria, options?: any) => {
    // Validate BEFORE touching `searchRequestIdRef` or clearing any bucket.
    // The old single-request code validated first too; hoisting the fan-out's
    // id-increment/clear ABOVE this check (as a first pass at this function
    // did) breaks three things at once for an invalid-date Modify Search:
    // it supersedes whatever valid search was still in flight (so that
    // search's `finally` never runs, `pendingProviders` is stranded
    // non-empty, and `searching` never clears — the results column is stuck
    // on the skeleton until the next valid search); it blanks an
    // already-rendered result set to "No flights found" for no reason; and
    // — since this used to be checked once per PROVIDER leg — it used to
    // toast the same message twice.
    const dateError = validateFlightSearchDates({
      flightType: criteria.flightType,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      multiTrips: criteria.multiTrips,
    });
    if (dateError) {
      toast.error(dateError);
      setLoading(false);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    // One bump per SEARCH (not per provider leg) — see `searchGenerationTick`'s
    // declaration for why the batch reset is keyed on this instead of on
    // `sortedFlights`.
    setSearchGenerationTick((t) => t + 1);
    // Clear the refs SYNCHRONOUSLY too, not just the state (which only
    // updates its mirror ref at render time). Both provider requests below
    // can reach their `await`-resolved continuations before React commits a
    // render, and those continuations read `providerResultsRef`/
    // `facetsByProviderRef` directly — an un-cleared ref would let a stale
    // bucket from the PREVIOUS search survive in a fresh response's merge
    // until that provider's own new response happens to land.
    providerResultsRef.current = {};
    facetsByProviderRef.current = {};
    pendingProvidersRef.current = [...SEARCH_PROVIDERS];
    pendingFailureMessageRef.current = null;
    setSearchError(null);
    // A LIVE anchor from the search being superseded must die with it. The
    // restore effect's `if (!anchor || !node) return;` bails without clearing
    // when the results container is unmounted — which is exactly what a new
    // search causes, since clearing the buckets drops `totalResults` to 0. So
    // an anchor captured at, say, 2s survives a mid-search Apply or chip "×"
    // and then fires a scroll correction against a `top` measured under a
    // completely different layout as soon as the NEXT search's first provider
    // remounts the container.
    scrollAnchorRef.current = null;
    setProviderResults({});
    setFacetsByProvider({});
    setPendingProviders(pendingProvidersRef.current);
    return Promise.all(
      SEARCH_PROVIDERS.map((provider) =>
        fetchProviderResults(criteria, { ...options, provider, requestId }),
      ),
    );
  };

  // Trigger 1 — first search only. Waits for the context to apply its geo
  // defaults: until then selectedFrom/ToAirport hold placeholder values, and
  // searching on those would pin results to a route the user never chose.
  const currencyRef = useRef(userCurrency);
  useEffect(() => {
    if (hasSearchedRef.current) return;
    if (!defaultsApplied) return;
    if (!isSearchable(initialCriteria)) return;
    hasSearchedRef.current = true;
    // Adopt the currency this search actually used, so the geo-resolved
    // currency landing in the same cycle is not mistaken for a user switch.
    currencyRef.current = userCurrency;
    searchFlights(initialCriteria, {
      resetFilters: true,
      criteriaChanged: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, contextCriteriaKey]);

  // Trigger 2 — header currency switch. Re-runs the last committed search with
  // the same criteria, keeping the user's filters.
  useEffect(() => {
    // Until geo defaults land, selectedFrom/ToAirport are still placeholders.
    // Don't latch hasSearchedRef on them, and don't update currencyRef here —
    // leaving it stale means trigger 1 adopts this currency once defaults
    // apply, so the user's choice is still honoured by the first real search.
    if (!defaultsApplied) return;
    if (currencyRef.current === userCurrency) return;
    currencyRef.current = userCurrency;
    const criteria = lastCriteriaRef.current ?? contextCriteria;
    if (!isSearchable(criteria)) return;
    hasSearchedRef.current = true;
    searchFlights(criteria, {
      activeFilters: filtersRef.current,
      resetFilters: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCurrency]);

  // Trigger 3 — the Search button. `criteria` comes from the search bar's draft;
  // the context fallback keeps this working for callers that pass nothing.
  const handleNewSearch = (criteria?: SearchCriteria) => {
    if (!defaultsApplied) return;
    const next = criteria ?? contextCriteria;
    if (!isSearchable(next)) return;
    hasSearchedRef.current = true;
    // Filters only reset when the search actually changed. Re-running the same
    // search to refresh fares keeps whatever the user had selected.
    const changed = criteriaKey(next) !== lastCriteriaKeyRef.current;
    if (changed) {
      // A brand-new route must not be silently constrained by the PREVIOUS
      // route's provider filters (e.g. re-shopping a new origin/destination
      // for "Emirates only" when Emirates may not even fly it) — send
      // cleared provider filters, not whatever was last applied. Drop the
      // pinned airline list too, so the sidebar can't keep showing the old
      // route's carriers while the new unfiltered set is in flight.
      unfilteredAirlinesRef.current = [];
    }
    searchFlights(next, {
      activeFilters: changed
        ? createDefaultFiltersFromBounds(priceBounds)
        : filtersRef.current,
      resetFilters: changed,
      // Only a genuine criteria change makes the sidebar's facets stale.
      criteriaChanged: changed,
    });
  };

  // Client-only filters (price/baggage/amenities/departure-slot) — instant,
  // in-memory, no network.
  const handleFilterChange = (nextFilters: typeof filters) => {
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
  };

  // Apply pressed: airline/stop/cabin changed, so re-shop with the filters
  // pushed into the provider requests instead of narrowing the truncated set.
  const handleFilterApply = (nextFilters: typeof filters) => {
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
    if (!lastCriteriaRef.current) return;
    searchFlights(lastCriteriaRef.current, { activeFilters: nextFilters });
  };

  // A reset clears the airline/stop/cabin selection, so the unfiltered set
  // must be fetched back — an in-memory un-narrowing would keep showing
  // whatever the last filtered search returned. `resetFilters: true` makes
  // sure that once the response lands, filters/price-bounds are resynced to
  // THIS response's bounds rather than the optimistic guess computed below
  // from the (possibly stale, filtered) `priceBounds` state.
  const handleFilterReset = () => {
    // Only the provider-pushable keys (airlines/stops/cabins — same set
    // `needsRefetch` already uses for the Apply gate) justify a re-shop.
    // Reset is enabled whenever ANY chip exists, including purely
    // client-side ones (price/baggage/time/amenities) that never left the
    // browser — undoing those with a fresh Sabre + Tripjack search would
    // blow through the request-rate bound Apply exists to provide (Tripjack
    // has hit 429s under load) for a change nothing upstream needs to know
    // about.
    const prevFilters = filtersRef.current;
    const resetFilters = createDefaultFiltersFromBounds(priceBounds);
    setFilters(resetFilters);
    filtersRef.current = resetFilters;
    if (!lastCriteriaRef.current || !needsRefetch(prevFilters, resetFilters)) {
      return;
    }
    searchFlights(lastCriteriaRef.current, {
      activeFilters: resetFilters,
      resetFilters: true,
    });
  };

  const routes = all_routes;
  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: t("flightList.title"),
      link: routes.home1,
      active: false,
    },
    {
      label: t("flightList.title"),
      active: false,
    },
    {
      label: t("flightList.breadcrumbList"),
      active: true,
    },
  ];

  //ImageSlider
  const imgslideroption = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 2000,
    autoplay: false,
    swipe: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number | null>(
    null,
  );
  const [fareModalFlight, setFareModalFlight] = useState<any | null>(null);
  const [fareModalIndex, setFareModalIndex] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));

  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };

  // Reads/writes `providerResultsRef.current`, not a functional `setState`
  // updater — same discipline as the search path in `fetchProviderResults`
  // (see the ref comment near its declaration). A functional updater's `prev`
  // is only as fresh as whatever was last ENQUEUED for this state slot; a
  // plain value written from a stale snapshot would instead CLOBBER it. By
  // having every writer of `providerResults` read-mutate-write through the
  // same ref, each one's "next" is always built on top of whatever the
  // previous writer (in real JS execution order, regardless of React's batch
  // boundaries) already applied — so a fare selection made while a search
  // response is landing (or vice versa) can never be silently discarded.
  const handleFareOptionSelect = (flightRef: any, optionId: number) => {
    const next: Record<string, any[]> = {};
    for (const [bucket, list] of Object.entries(providerResultsRef.current)) {
      next[bucket] = (list as any[]).map((f: any) => {
        if (f !== flightRef) return f;
        const option = f.ui?.fareOptions?.find((o: any) => o.id === optionId);
        if (!option) return f;
        return { ...f, ui: applyFareOption(f.ui, option) };
      });
    }
    providerResultsRef.current = next;
    setProviderResults(next);
  };

  const handleModalSelectFare = (flightObj: any, fareOptionId: number) => {
    const option = flightObj?.ui?.fareOptions?.find(
      (o: any) => o.id === fareOptionId,
    );
    const updated = option
      ? { ...flightObj, ui: applyFareOption(flightObj.ui, option) }
      : flightObj;
    if (option) handleFareOptionSelect(flightObj, fareOptionId);
    revalidateFlight(updated, fareModalIndex);
  };

  // Penalty-aware refund lookup for one fare brand, used by the fare modal on
  // select. Advisory only — any failure resolves to null so the card falls back
  // to the coarse search-time flag (never blocks the user).
  const fetchFareRefund = async (
    flight: any,
    fareOptionId: number,
  ): Promise<RefundInfo | null> => {
    try {
      const option = flight?.ui?.fareOptions?.find(
        (o: any) => o.id === fareOptionId,
      );
      if (!option?.legs) return null;

      const payload = {
        userCurrency,
        itinerary: {
          legs: option.legs,
          selectedFareOptionId: fareOptionId,
          passengers: { ADT: adults, CHD: children_, INF: infants },
          // Carried for Phase 2 booking; NOT used for booking logic in Phase 1.
          provider: flight?.ui?.provider,
          tripjackPriceId:
            option.tripjackPriceId ?? flight?.ui?.tripjackPriceId ?? null,
          hostnsell: option.hostnsell ?? flight?.ui?.hostnsell ?? null,
        },
      };

      const response = await api.post(`/api/flights/fareRules`, payload);
      return response.data?.refund ?? null;
    } catch {
      return null;
    }
  };

  const revalidateFlight = async (flight: any, index: number) => {
    // Defense in depth: the modal's confirm button is disabled while
    // revalidating, but disabled-attribute races (double click before React
    // re-renders) must not be able to fire this twice.
    if (revalidating) return;
    try {
      if (status === "loading") return;

      setLoading(true);
      setRevalidating(true);

      const payload = buildRevalidateBody(
        flight,
        { adults, children: children_, infants },
        userCurrency,
      );

      const response = await api.post(`/api/flights/revalidatePrice`, payload);

      const result = response.data;

      if (!result.valid) {
        toast.error(
          result.message ||
            result.error ||
            "This fare could not be verified. Please refresh search and try again.",
        );
        return;
      }

      if (result.softValidated) {
        toast(result.message || "Fare confirmed from search results.", {
          icon: "ℹ️",
        });
      }

      // Ref-based read-mutate-write — same discipline as
      // `handleFareOptionSelect` above; see its comment for why.
      {
        const next: Record<string, any[]> = {};
        for (const [bucket, list] of Object.entries(providerResultsRef.current)) {
          next[bucket] = (list as any[]).map((f: any) =>
            f === flight ? { ...f, ui: repricedUi(f, result) } : f,
          );
        }
        providerResultsRef.current = next;
        setProviderResults(next);
      }

      const selected = toSelectedFlight(flight, result);
      setSelectedFlightIndex(index);
      setSelectedFlight(selected);
      storeSelectedFlight(selected);
      // console.log("Navigating to flight booking");
      navigate(all_routes.flightBooking);
    } catch (err) {
      console.error("Revalidate failed", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to verify this fare right now. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
      setRevalidating(false);
    }
  };

  const handleSelectFlight = (flight: any) => {
    // NOTE - Prompt the user to login and then collect passenger details
  };

  return (
    <div className="yt-flight-list-page">
      <Breadcrumb
        title={t("flightList.title")}
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-flight-list"
      />
      <div className="content bg-details-luxe">
        <div className="container yt-flight-list-container">
          {(hasCompletedSearch ||
            flightResults.length > 0 ||
            searching ||
            pendingProviders.length > 0) && (
            <FlightSearchSummary
              fromCity={
                selectedFromAirport?.subtitle ||
                selectedFromAirport?.label?.split(",")[0] ||
                fromQuery
              }
              fromCode={
                selectedFromAirport?.value || selectedFromAirport?.id || fromQuery
              }
              toCity={
                selectedToAirport?.subtitle ||
                selectedToAirport?.label?.split(",")[0] ||
                toQuery
              }
              toCode={selectedToAirport?.value || selectedToAirport?.id || toQuery}
              departureDate={departureDate}
              returnDate={returnDate}
              flightType={flightType}
              adults={adults}
              children={children_}
              infants={infants}
              cabinClass={cabinClass}
              onModifySearch={() => setShowModify((prev) => !prev)}
            />
          )}
          {showModify && (
            <div className="yt-flight-inline-search mb-4">
              <FlightSearch
                onSearch={(criteria?: SearchCriteria) => {
                  handleNewSearch(criteria);
                  setShowModify(false);
                }}
              />
            </div>
          )}
          <div className="row mt-3 yt-flight-results-layout">
            <div className="col-12">
              <FlightResultsToolbar
                activeCount={activeChips.length}
                chips={activeChips}
                onOpenFilters={() => setFiltersOpen(true)}
                sortMode={sortMode}
                onSortChange={setSortMode}
                sortDisabled={pendingProviders.length > 0}
                disabled={filtersLoading}
                countLabel={countLabel}
              />
              <span data-testid="search-progress" hidden>
                {pendingProviders.length > 0 ? "partial" : "complete"}
              </span>

              <style>{`
                .results-searching {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  font-size: 14px;
                  color: #4b5563;
                }
                .results-searching__spinner {
                  width: 16px;
                  height: 16px;
                  flex: none;
                  border: 2px solid rgba(37, 99, 235, 0.25);
                  border-top-color: #2563eb;
                  border-radius: 50%;
                  animation: resultsSearchingSpin 0.7s linear infinite;
                }
                @keyframes resultsSearchingSpin { to { transform: rotate(360deg); } }
                @media (prefers-reduced-motion: reduce) {
                  /* Slowed, not stopped — a frozen spinner reads as hung. */
                  .results-searching__spinner { animation-duration: 2.4s; }
                }
                /* Centred under the last card, filling the gap that otherwise
                   reads as "this is all there is" while a provider is still
                   landing results. */
                .results-searching--bottom {
                  justify-content: center;
                  margin: 4px 0 0;
                  padding: 16px 0;
                }
              `}</style>
              <div className="yt-flight-promo-slot">
                <SignInPromoBanner product="flights" />
              </div>

              {/* Keyed on what has ARRIVED (`flightResults`), not on what
                  survives the filters (`totalResults`). A provider can land a
                  full set that an active filter then excludes entirely — the
                  data is here, so the blocking loader must go and the user
                  must see the real (possibly empty) state, with the small
                  spinner carrying "still fetching more". Gating on the
                  filtered count kept a full-screen plane over live data. */}
              {flightResults.length === 0 && pendingProviders.length > 0 ? (
                // Skeleton only while there is genuinely nothing to show yet.
                // Once ANY provider has landed something, `totalResults > 0`
                // and the branch below renders those results immediately —
                // the whole point of fetching providers separately is that a
                // fast provider's cards must not stay hidden behind a slow
                // sibling's skeleton.
                //
                // Only the very first search has no page frame worth
                // preserving. Once a search has completed — even one that
                // returned nothing — the frame stays and only the results
                // column is skeletoned.
                // The plane is only right when the page has NOTHING worth
                // preserving: no results have ever been shown AND no search has
                // ever finished. A completed search leaves a frame (the search
                // bar, the empty state) even when it returned nothing, and
                // results on screen obviously do — either way a re-search
                // skeletons the column instead of blanking the page.
                !hasShownResultsRef.current && !hasCompletedSearch ? (
                  <FlightSearchLoader
                    fromCity={
                      selectedFromAirport?.subtitle ||
                      selectedFromAirport?.label?.split(",")[0] ||
                      fromQuery
                    }
                    fromCode={
                      selectedFromAirport?.value || selectedFromAirport?.id
                    }
                    toCity={
                      selectedToAirport?.subtitle ||
                      selectedToAirport?.label?.split(",")[0] ||
                      toQuery
                    }
                    toCode={selectedToAirport?.value || selectedToAirport?.id}
                  />
                ) : (
                  <FlightResultsSkeleton />
                )
              ) : searchError && flightResults.length === 0 ? (
                <div
                  className="yt-flight-results-state yt-flight-results-state--error"
                  role="alert"
                  data-testid="flight-search-error"
                >
                  <h5 className="yt-flight-results-state__title">
                    {t("flightList.searchErrorTitle")}
                  </h5>
                  <p className="yt-flight-results-state__hint">{searchError}</p>
                  <p className="yt-flight-results-state__hint mb-3">
                    {t("flightList.searchErrorHint")}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowModify(true)}
                  >
                    {t("flightList.modifySearch")}
                  </button>
                </div>
              ) : sortedFlights.length === 0 ? (
                <div
                  className="yt-flight-results-state"
                  role="status"
                  data-testid="flight-empty-results"
                >
                  <h5 className="yt-flight-results-state__title">
                    {t("flightList.noFlights")}
                  </h5>
                  <p className="yt-flight-results-state__hint">
                    {t("flightList.emptyHint")}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleFilterReset}
                  >
                    {t("flightList.resetAll")}
                  </button>
                </div>
              ) : null}
            </div>

            {sortedFlights.length > 0 && (
              <>
                {hiddenLabelled && (
                  <div className="col-12">
                    <div
                      className="alert alert-warning d-flex align-items-center justify-content-between gap-3 mb-4"
                      role="status"
                    >
                      <span className="small">
                        {t(FLIGHT_LABEL_HIDDEN_I18N_KEY[hiddenLabelled.label], {
                          price: formatMoney(
                            hiddenLabelled.flight?.ui?.price,
                            hiddenLabelled.flight?.ui?.currency || currency,
                          ),
                          duration: formatDurationShort(
                            getFlightDurationMinutes(hiddenLabelled.flight),
                          ),
                        })}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark flex-shrink-0"
                        onClick={handleFilterReset}
                      >
                        {t("flightList.resetAll")}
                      </button>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div className="row yt-flight-results-columns">
                    <div className="col-lg-8">
                  <div className="yt-fr-list hotel-list list-full" ref={resultsContainerRef}>
                    {visibleFlights?.map((f, index) => {
                      const flight = f.ui;
                      const cardKey = flightKeyOf(f);
                      const label = flightLabels.get(f);
                      const segmentRows =
                        getSegments(flight)?.length > 0
                          ? getSegments(flight)
                          : [
                              {
                                departure: flight.departure,
                                arrival: flight.arrival,
                                origin:
                                  flight.origin ??
                                  (Array.isArray(flight.legs)
                                    ? flight.legs[0]?.origin
                                    : flight.legs?.origin),
                                destination:
                                  flight.destination ??
                                  (Array.isArray(flight.legs)
                                    ? flight.legs[flight.legs.length - 1]?.destination
                                    : flight.legs?.destination),
                                duration: flight.duration,
                                stops: flight.stops,
                              },
                            ];
                      const primarySegment = segmentRows[0];
                      return (
                        <FlightResultRow
                          key={cardKey}
                          cardKey={cardKey}
                          flight={flight}
                          segment={primarySegment}
                          label={label}
                          selected={cardKey === activeSelectedKey}
                          travellerCount={travellerCount}
                          originLabel={listFromCity}
                          destinationLabel={listToCity}
                          formatTime={formatTime}
                          onSelect={() => setSelectedCardKey(cardKey)}
                          onChoose={() => {
                            setSelectedCardKey(cardKey);
                            setFareModalFlight(f);
                            setFareModalIndex(index);
                          }}
                        />
                      );
                    })}
                    {hasMoreToRender && (
                      <div
                        ref={loadMoreRef}
                        className="flight-results-sentinel"
                        data-testid="results-load-more"
                      >
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() =>
                            setVisibleCount((c) => c + RESULTS_BATCH)
                          }
                        >
                          Showing {visibleFlights.length} of {sortedFlights.length}{" "}
                          — show more
                        </button>
                      </div>
                    )}
                  </div>
                    </div>

                    <div className="col-lg-4 d-none d-lg-block yt-flight-detail-sidebar-col">
                      {selectedFlightWrapper && (
                        <div className="yt-flight-detail-sidebar-sticky">
                          <FlightDetailSidebar
                            flightWrapper={selectedFlightWrapper}
                            travellerCount={travellerCount}
                            fromCity={listFromCity}
                            toCity={listToCity}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            formatBaggage={formatBaggage}
                            formatTime={formatTime}
                            onChoose={() => {
                              const idx =
                                sortedFlights.indexOf(selectedFlightWrapper);
                              setFareModalFlight(selectedFlightWrapper);
                              setFareModalIndex(idx >= 0 ? idx : 0);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 d-lg-none mt-3">
                  {selectedFlightWrapper && (
                    <FlightDetailSidebar
                      flightWrapper={selectedFlightWrapper}
                      travellerCount={travellerCount}
                      fromCity={listFromCity}
                      toCity={listToCity}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      formatBaggage={formatBaggage}
                      formatTime={formatTime}
                      onChoose={() => {
                        const idx = sortedFlights.indexOf(selectedFlightWrapper);
                        setFareModalFlight(selectedFlightWrapper);
                        setFareModalIndex(idx >= 0 ? idx : 0);
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {flightResults.length > 0 && pendingProviders.length > 0 && (
              <div className="col-12">
                <div
                  className="results-searching results-searching--bottom"
                  data-testid="results-searching"
                  role="status"
                  aria-live="polite"
                >
                  <span className="results-searching__spinner" aria-hidden="true" />
                  Searching for more flights…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FareSelectionModal
        show={!!fareModalFlight}
        onHide={() => setFareModalFlight(null)}
        flight={fareModalFlight}
        travellerCount={(adults || 0) + (children_ || 0) + (infants || 0)}
        onSelectFare={handleModalSelectFare}
        fetchRefund={fetchFareRefund}
        busy={revalidating}
      />

      <YoriFlightAssistant
        resultCount={sortedFlights.length}
        searching={searching || pendingProviders.length > 0}
        filtersOpen={filtersOpen}
        sortMode={sortMode}
        activeFilterCount={activeChips.length}
        searchError={searchError}
      />

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t("flightList.filters")}
      >
        <FlightFilter
          filters={filters}
          onChange={handleFilterChange}
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          onClose={() => setFiltersOpen(false)}
          airlines={availableAirlines}
          priceBounds={priceBounds}
          currency={priceBounds.currency || currency || "USD"}
          resultCount={filteredFlights?.length ?? totalResults}
          isLoadingMore={pendingProviders.length > 0}
        />
      </FilterDrawer>
    </div>
  );
};

export default FlightList;
