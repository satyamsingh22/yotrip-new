import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useHotelSearch,
  type City,
} from "../../../context/HotelSearchContext";
import { useGeoDefaults } from "../../../context/GeoDefaultsContext";
import { resolveHotelCityByName } from "../../../utils/hotelCitySearch";
import { FOOTER_DESTINATIONS } from "../../../data/popularHotelDestinations";
import { hotelDeepLinkKey, readHotelSearchDeepLink } from "../../../utils/hotelSearchDeepLink";

/**
 * Runs the one hotel search the results page needs on a cold land.
 *
 * Two problems, one mechanism:
 *
 *  1. hotelGrid never called searchHotels() at all, so arriving from the footer
 *     (rather than by submitting the search widget) rendered "0 Hotels Found".
 *     Flight and car results pages already auto-search on mount; hotel did not.
 *  2. Footer destination links carry ?city=<name>&country=<ISO2>. Nothing in
 *     the app read search criteria from the URL, so those params were ignored.
 *
 * Ordering matters here, and `ready` alone is not enough to get it right.
 * GeoDefaultsProvider wraps HotelSearchProvider wraps the routed HotelGrid
 * (see main.tsx), and React flushes passive effects child-before-parent
 * within a commit. So on the commit where `ready` flips false -> true, this
 * hook's effect (child) would run BEFORE HotelSearchProvider's own defaults
 * effect (parent) — which is the one that actually calls setCity(geoCity).
 * Gating on `ready` alone meant every cold load called searchHotels() while
 * its closure still held the pre-defaults city (DEFAULT_HOTEL_CITY /
 * London), silently returning London results for everyone. We instead wait
 * for `defaultsApplied`, which HotelSearchContext only flips to true in the
 * same commit it applies the geo city/currency — so by the time we see it,
 * the searchHotels() closure we call is guaranteed to hold the right city.
 *
 * There are two distinct paths through here, and they need opposite guards:
 *
 *  - An explicit destination in the URL (?city + ?country) is a deliberate
 *    user action. /hotel/hotel-grid is a single route and the footer renders
 *    on it, so going Riyadh -> Jeddah changes only the query string and React
 *    Router keeps HotelGrid mounted. A once-per-mount boolean latch would make
 *    every destination after the first a silent no-op, so the guard is keyed on
 *    the destination itself: a changed key always searches, even though there
 *    are results on screen from the previous one.
 *  - No destination params is the fallback path (cold land, or arrival from
 *    the home-page search widget). The widget calls navigate() and
 *    searchHotels() in the same handler, so those batch and `loading` is
 *    already true by the time this effect first runs here. Firing again would
 *    double the app's most expensive call and race two responses into
 *    hotels/facets/filters, so the fallback only runs when nothing is in
 *    flight and nothing is on screen — and at most once per mount either way.
 */

/**
 * Resolve a destination from the inline coordinates on FOOTER_DESTINATIONS.
 *
 * Footer links are the common deep-link path, and resolving them through the
 * catalog means fetching public/cities500.json — 26 MB, uncached on the first
 * click — just to turn a name into lat/lng. The six footer cities carry their own
 * coordinates (kept honest by a drift test against the real catalog), so this
 * returns without any network at all. Anything else returns undefined and the
 * caller falls back to resolveHotelCityByName.
 *
 * Matching mirrors resolveHotelCityByName exactly — trimmed, case-insensitive
 * name, trimmed upper-case country — so the two paths can never disagree.
 */
const inlineFooterCity = (
  name: string,
  country: string,
  currency: string,
): City | undefined => {
  const wantName = name.trim().toLowerCase();
  const wantCountry = country.trim().toUpperCase();

  const hit = FOOTER_DESTINATIONS.find(
    (destination) =>
      destination.name.trim().toLowerCase() === wantName &&
      destination.country.trim().toUpperCase() === wantCountry,
  );

  // A half-filled entry falls through to the catalog rather than searching a
  // city with no usable coordinates.
  if (!hit || !Number.isFinite(hit.lat) || !Number.isFinite(hit.lng)) {
    return undefined;
  }

  return {
    name: hit.name,
    country: hit.country,
    lat: hit.lat as number,
    lng: hit.lng as number,
    currency,
  };
};

export const useHotelDeepLinkSearch = (): void => {
  const {
    setCity,
    setCheckIn,
    setCheckOut,
    setGuests,
    searchHotels,
    userCurrency,
    defaultsApplied,
    loading,
    hotels,
    lastSearchedDestination,
    setLastSearchedDestination,
  } = useHotelSearch();
  const { ready } = useGeoDefaults();
  const [searchParams] = useSearchParams();
  // Per-mount by design, unlike the destination guard: the fallback exists to
  // avoid racing the search widget's in-flight call on this mount, so it must
  // NOT survive one.
  const fallbackDoneRef = useRef(false);

  const cityParam = searchParams.get("city");
  const countryParam = searchParams.get("country");
  // Dates/guests from a full search link (e.g. the chat assistant). Keyed by its
  // string form so a new object each render doesn't re-run the effect.
  const searchString = searchParams.toString();
  const searchLink = useMemo(() => readHotelSearchDeepLink(`?${searchString}`), [searchString]);
  const searchLinkKey = hotelDeepLinkKey(searchLink);
  const hasResults = hotels.length > 0;

  // Latest-value mirrors, so the unmount cleanup below reads what is actually
  // in context at unmount rather than the values captured on first render.
  // Assigned in the render body rather than in an effect: an effect mirror is
  // only as fresh as the last flushed commit, and the cleanup must be right
  // even when the unmount follows the results landing immediately.
  const hasResultsRef = useRef(hasResults);
  hasResultsRef.current = hasResults;
  const setLastSearchedDestinationRef = useRef(setLastSearchedDestination);
  setLastSearchedDestinationRef.current = setLastSearchedDestination;

  // Release the destination latch when this page goes away with nothing to
  // reuse. The latch lives in context so Back from a hotel detail page reuses
  // the results already on screen (see HotelSearchContext), but with no results
  // there is nothing to reuse — and a destination that returned zero hotels, or
  // failed, would otherwise stay latched for the rest of the session, making
  // its footer link a permanent no-op that renders "0 Hotels Found" having run
  // no search at all.
  //
  // Deliberately unmount-scoped, and deliberately NOT driven by `hasResults` as
  // an effect dependency. Both of the obvious alternatives loop: gating the
  // guard's early return on `hasResults` re-fires forever after a genuinely
  // empty search (`loading` is an effect dep, so the effect re-runs the moment
  // it settles), and clearing the latch in the context's catch retries a
  // failing backend without bound. Nothing here can run twice within a mount,
  // so no loop is reachable.
  useEffect(
    () => () => {
      if (!hasResultsRef.current) setLastSearchedDestinationRef.current(null);
    },
    [],
  );

  useEffect(() => {
    if (!ready || !defaultsApplied) return;

    const destinationKey =
      cityParam && countryParam
        ? `${cityParam}|${countryParam}${searchLinkKey ? `|${searchLinkKey}` : ""}`
        : null;

    if (destinationKey) {
      // Same destination re-rendering (state changes, searchHotels identity
      // churn): nothing to do. A different one: search it.
      if (lastSearchedDestination === destinationKey) return;
      // NB: the guard is latched inside run(), once we have committed to
      // searching — see the comment there. Latching it here would lose
      // destinations outright.
      // A destination search covers the page; the fallback must never follow it.
      fallbackDoneRef.current = true;
    } else {
      if (fallbackDoneRef.current) return;
      // Consumed even when we bail: if a widget search is in flight we must not
      // fire once it settles either, including when it settles to zero results.
      fallbackDoneRef.current = true;
      if (loading || hasResults) return;
    }

    let cancelled = false;

    const run = async () => {
      let seeded: City | undefined;

      if (cityParam && countryParam) {
        seeded = inlineFooterCity(cityParam, countryParam, userCurrency);

        if (!seeded) {
          const match = await resolveHotelCityByName(cityParam, countryParam);
          if (match) {
            seeded = {
              name: match.name,
              country: match.country,
              lat: Number(match.lat),
              lng: Number(match.lon),
              currency: userCurrency,
            };
          }
        }
      }

      if (cancelled) return;

      // Latch the destination only now, on the run that actually searches it.
      // Latching at effect time instead silently swallowed destinations:
      // resolving one fetches cities500.json (26 MB, uncached on the first
      // click), and `loading`/`hasResults` are effect deps, so an unrelated
      // earlier search settling during that window re-runs the effect, whose
      // cleanup cancels this run — and the re-run then bails on a latch for a
      // destination nothing ever searched. The URL is unchanged at that point,
      // so no dependency can change again and clicking the same footer link is
      // a no-op: a dead end until the user navigates away. Because a cancelled
      // run returns above without latching, the re-run retries it.
      if (destinationKey) setLastSearchedDestination(destinationKey);

      // Keep the search widget in step with what we are about to search.
      if (seeded) setCity(seeded);
      if (searchLink?.checkIn && searchLink.checkOut) {
        setCheckIn(searchLink.checkIn);
        setCheckOut(searchLink.checkOut);
      }
      if (searchLink?.guests) setGuests(searchLink.guests);
      // An unresolvable or absent destination falls through to the geo default
      // rather than leaving the page blank. Dates/guests are passed explicitly
      // for the same reason as the city: the setters above have not committed.
      await (searchLink ? searchHotels(seeded, searchLink) : searchHotels(seeded));
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    defaultsApplied,
    cityParam,
    countryParam,
    loading,
    hasResults,
    setCity,
    searchHotels,
    userCurrency,
    lastSearchedDestination,
    setLastSearchedDestination,
    searchLink,
    searchLinkKey,
    setCheckIn,
    setCheckOut,
    setGuests,
  ]);
};
