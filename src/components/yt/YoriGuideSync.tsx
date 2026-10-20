import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useYoTripGuide } from "@/context/YoTripGuideContext";
import { useHotelSearch } from "@/context/HotelSearchContext";
import { useFlightSearch } from "@/context/FlightSearchContext";
import type { YoriPageContext } from "@/context/YoTripGuideContext";

function pageContextFromPath(pathname: string): YoriPageContext {
  if (pathname.includes("/flight")) return "flight";
  if (pathname.includes("/hotel")) return "hotel";
  if (pathname.includes("/car")) return "car";
  if (pathname.includes("/package")) return "package";
  if (pathname.includes("/payment")) return "payment";
  if (pathname.includes("confirmation")) return "confirmation";
  if (pathname.includes("/index") || pathname === "/") return "home";
  return "generic";
}

/** Keeps Yori mood in sync with route + live search loading states. */
export default function YoriGuideSync() {
  const { pathname } = useLocation();
  const { setMood, pulse } = useYoTripGuide();
  const { loading: hotelLoading, searchError: hotelError, hotels } = useHotelSearch();
  const { loading: flightLoading } = useFlightSearch();

  useEffect(() => {
    const ctx = pageContextFromPath(pathname);
    pulse();

    if (pathname.includes("/payment")) {
      setMood("booking", { pageContext: "payment", speak: true });
      return;
    }
    if (pathname.includes("confirmation")) {
      setMood("success", { pageContext: "confirmation", gesture: "thumbsUp", speak: true });
      return;
    }
    if (ctx === "home") {
      setMood("welcome", { pageContext: "home", gesture: "wave", speak: true });
      return;
    }
    if (ctx === "flight") {
      setMood("explore", { pageContext: "flight", gesture: "point", speak: true });
      return;
    }
    if (ctx === "hotel") {
      setMood("explore", { pageContext: "hotel", gesture: "point", speak: true });
      return;
    }
    if (ctx === "package") {
      setMood("explore", { pageContext: "package", gesture: "direction", speak: true });
      return;
    }
    if (ctx === "car") {
      setMood("explore", { pageContext: "car", gesture: "point" });
      return;
    }
    setMood("idle", { pageContext: "generic" });
  }, [pathname, pulse, setMood]);

  useEffect(() => {
    if (!pathname.includes("/hotel")) return;
    if (hotelLoading) {
      setMood("searching", {
        pageContext: "hotel",
        gesture: "laptop",
        expression: "thinking",
      });
      return;
    }
    if (hotelError) {
      setMood("error", { pageContext: "hotel", expression: "surprised" });
      return;
    }
    if (hotels.length > 0) {
      setMood("success", {
        pageContext: "hotel",
        gesture: "thumbsUp",
        expression: "happy",
        speak: true,
      });
    }
  }, [hotelLoading, hotelError, hotels.length, pathname, setMood]);

  useEffect(() => {
    if (!pathname.includes("/flight") && !pathname.includes("/index")) return;
    if (flightLoading) {
      setMood("searching", {
        pageContext: "flight",
        gesture: "laptop",
        expression: "thinking",
      });
    }
  }, [flightLoading, pathname, setMood]);

  return null;
}
