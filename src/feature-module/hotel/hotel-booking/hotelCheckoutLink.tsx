// /hotel/hotel-booking/:checkoutId — opens a hotel room the chat assistant picked.
// Re-prices it the way the hotel page does when a room is chosen, then opens the
// normal booking page for guest details and payment:
//   Sabre    → checkPrice with the room's rateKey.
//   Tripjack → getHotelDetails again first (a review hash works only once, so
//              the assistant's can't be reused), find the same room, checkPrice.
// A price is only shown after checkPrice confirms it.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import api from "@/tockenapi/api";
import { all_routes } from "../../router/all_routes";
import { useHotelSearch, type GuestCounts } from "../../../context/HotelSearchContext";
import { hotelGridUrl } from "../../../utils/hotelSearchDeepLink";
import {
  findLinkedRoom,
  type DetailRoom,
  type HotelLinkSearch,
  type HotelSelection,
} from "../../../utils/hotelCheckoutRoom";
import CheckoutLinkCard from "../../../core/common/checkoutLink/CheckoutLinkCard";
import {
  apiErrorMessage,
  loadCheckoutLink,
  type CheckoutLinkPhase,
} from "../../../core/common/checkoutLink/checkoutLinkLoader";

const HotelCheckoutLink = () => {
  const { checkoutId = "" } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const {
    defaultsApplied,
    userCurrency,
    setCity,
    setCheckIn,
    setCheckOut,
    setGuests,
    setCorrelationId,
    setNationality,
    setSelectedRoom,
    setBookingKey,
    setPriceInfo,
  } = useHotelSearch();
  const [phase, setPhase] = useState<CheckoutLinkPhase>({ kind: "loading", message: "Opening your stay..." });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!defaultsApplied) return;
    let cancelled = false;

    const run = async () => {
      setPhase({ kind: "loading", message: "Opening your stay..." });
      const loaded = await loadCheckoutLink<HotelLinkSearch, HotelSelection>(checkoutId, hotelGridUrl);
      if (cancelled) return;
      if (!loaded.ok) {
        setPhase(loaded.phase);
        return;
      }
      const { offer: sel, search, currency } = loaded.link;
      const searchUrl = hotelGridUrl(search);
      const displayCurrency = currency || userCurrency;
      const city = { ...search.city, currency: displayCurrency };
      const guests: GuestCounts = {
        rooms: search.rooms,
        adults: search.adults,
        children: search.children,
        infants: 0,
        childAges: search.childAges,
      };

      // The booking page reads dates and guests from context.
      setCity(city);
      setCheckIn(dayjs(search.checkIn));
      setCheckOut(dayjs(search.checkOut));
      setGuests(guests);
      if (sel.nationality) setNationality(sel.nationality);

      const soldOut = (message?: string) =>
        setPhase({
          kind: "unavailable",
          message: message || "This room is no longer available. Please pick another room or search again.",
          searchUrl,
        });

      try {
        let room: DetailRoom = { rateKey: sel.rateKey, optionId: sel.optionId };
        let reviewHash: string | undefined;
        let correlationId = sel.correlationId;

        if (sel.provider === "tripjack") {
          setPhase({ kind: "loading", message: "Checking room availability..." });
          const { data: details } = await api.post("/api/hotels/getHotelDetails", {
            provider: "tripjack",
            hotelId: sel.hotelId,
            checkIn: search.checkIn,
            checkOut: search.checkOut,
            guests,
            userCurrency: displayCurrency,
            city,
            lang: (i18n.resolvedLanguage || i18n.language || "en").split("-")[0],
            correlationId: sel.correlationId,
            ...(sel.nationality ? { nationality: sel.nationality } : {}),
          });
          if (cancelled) return;
          const match = findLinkedRoom(Array.isArray(details?.rooms) ? details.rooms : [], sel);
          if (!match) return soldOut();
          room = match;
          reviewHash = details?.reviewHash || match.reviewHash;
          correlationId = details?.correlationId || correlationId;
          if (!reviewHash) return soldOut();
        }

        setPhase({ kind: "loading", message: "Confirming the latest price..." });
        const { data } = await api.post("/api/hotels/checkPrice", {
          rateKey: room.rateKey || room.optionId,
          optionId: room.optionId || room.rateKey,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          guests,
          provider: sel.provider,
          hotelId: sel.hotelId,
          hid: sel.hotelId,
          ...(reviewHash ? { reviewHash } : {}),
          ...(correlationId ? { correlationId } : {}),
          userCurrency: displayCurrency,
          city,
        });
        if (cancelled) return;
        const priceData = data?.data;
        if (!priceData?.bookingKey) return soldOut(data?.message);

        // Same hand-off as choosing the room on the hotel page.
        sessionStorage.setItem("priceData", JSON.stringify(priceData));
        setSelectedRoom(priceData.room || room);
        setBookingKey(priceData.bookingKey);
        setPriceInfo(priceData);
        if (priceData.correlationId || correlationId) setCorrelationId(priceData.correlationId || correlationId);
        const params = new URLSearchParams({
          bookingKey: priceData.bookingKey,
          provider: priceData.provider || sel.provider,
        });
        if (priceData.correlationId || correlationId) {
          params.set("correlationId", priceData.correlationId || correlationId || "");
        }
        navigate(`${all_routes.hotelBooking}/?${params.toString()}`, { replace: true });
      } catch (e) {
        if (cancelled) return;
        soldOut(apiErrorMessage(e, "We couldn't confirm this room right now. Please try again or search again."));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, checkoutId, attempt]);

  return (
    <CheckoutLinkCard
      title="Hotel Checkout"
      breadcrumbs={[
        { label: "Hotels", link: all_routes.hotelGrid, active: false },
        { label: "Checkout", active: true },
      ]}
      phase={phase}
      unavailableTitle="This room is no longer available"
      searchLabel="See available hotels"
      onRetry={() => setAttempt((a) => a + 1)}
    />
  );
};

export default HotelCheckoutLink;
