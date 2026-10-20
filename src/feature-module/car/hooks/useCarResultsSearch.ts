// Starts the car search on the results pages (grid and list).
// Without a search in the URL: unchanged, search the current context on cold land.
// With one (e.g. a chat assistant link): wait for geo defaults (they'd overwrite
// the pickup otherwise), apply the linked search, then search on the next
// commit — searchCars reads its state from the render it was created in.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCarSearch } from "../../../context/CarSearchContext";
import { readCarSearchDeepLink } from "../../../utils/carSearchDeepLink";

export const useCarResultsSearch = () => {
  const {
    loading,
    hasSearched,
    searchCars,
    defaultsApplied,
    setMode,
    setSelectedPickupLocation,
    setSelectedDropoffLocation,
    setPickupQuery,
    setDropoffQuery,
    setPickupDate,
    setPickupTime,
    setReturnDate,
    setReturnTime,
    setDurationHours,
  } = useCarSearch();
  const { search } = useLocation();
  const link = useMemo(() => readCarSearchDeepLink(search), [search]);
  const appliedFor = useRef<string | null>(null);
  const [pending, setPending] = useState(false);

  // No link: the original cold-land behaviour.
  useEffect(() => {
    if (link) return;
    if (!hasSearched && !loading) void searchCars();
  }, [link, hasSearched, loading, searchCars]);

  // Link: apply once per distinct URL, after geo defaults.
  useEffect(() => {
    if (!link || !defaultsApplied || appliedFor.current === search) return;
    appliedFor.current = search;
    const dropoff = link.dropoff || link.pickup;
    setMode(link.mode);
    setSelectedPickupLocation(link.pickup);
    setPickupQuery(link.pickup.subtitle || link.pickup.label);
    setSelectedDropoffLocation(dropoff);
    setDropoffQuery(dropoff.subtitle || dropoff.label);
    if (link.pickupDate) setPickupDate(link.pickupDate);
    if (link.pickupTime) setPickupTime(link.pickupTime);
    if (link.returnDate) setReturnDate(link.returnDate);
    if (link.returnTime) setReturnTime(link.returnTime);
    if (link.durationHours) setDurationHours(link.durationHours);
    setPending(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, search, defaultsApplied]);

  // …then search with the committed values.
  useEffect(() => {
    if (!pending || loading) return;
    setPending(false);
    void searchCars();
  }, [pending, loading, searchCars]);

  /** Show the loader until the linked search has actually started. */
  return { awaitingLinkedSearch: Boolean(link) && (pending || appliedFor.current !== search) };
};
