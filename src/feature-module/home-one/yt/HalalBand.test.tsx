import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HalalBand from "./HalalBand";
import { all_routes } from "../../router/all_routes";

/** The band links to the Halal page, so it needs a router around it. */
const renderBand = () => render(<HalalBand />, { wrapper: MemoryRouter });

/** 4 Aug 2026, 09:00 in Delhi. */
const MORNING = new Date(Date.UTC(2026, 7, 4, 3, 30));

const pretendBrowserIsIn = (timeZone: string) => {
  const original = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(function (
    this: Intl.DateTimeFormat,
  ) {
    return { ...original.call(this), timeZone };
  });
};

const setGeolocation = (value: unknown) => {
  Object.defineProperty(globalThis.navigator, "geolocation", { value, configurable: true });
};

describe("HalalBand", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(MORNING);
    setGeolocation(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the traveller's own city rather than a hardcoded one", () => {
    pretendBrowserIsIn("Asia/Kolkata");

    renderBand();

    expect(screen.getByText(/Today in Delhi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Today in Istanbul/i)).not.toBeInTheDocument();
  });

  it("shows today's five prayers as real clock times", () => {
    pretendBrowserIsIn("Asia/Kolkata");

    renderBand();

    for (const label of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    // The old static card was pinned to Istanbul's 05:12 fajr.
    expect(screen.queryByText("05:12")).not.toBeInTheDocument();
    expect(screen.getByText("04:17")).toBeInTheDocument();
  });

  it("shows the qibla for the traveller's city, not a fixed bearing", () => {
    pretendBrowserIsIn("Asia/Kolkata");

    renderBand();

    expect(screen.getByText(/Qibla: 267° W from Delhi/i)).toBeInTheDocument();
  });

  it("offers to use the exact location when the browser supports it", () => {
    pretendBrowserIsIn("Asia/Kolkata");
    setGeolocation({ getCurrentPosition: vi.fn() });

    renderBand();

    expect(screen.getByRole("button", { name: /use my location/i })).toBeInTheDocument();
  });

  it("hides the location button when the browser cannot help", () => {
    pretendBrowserIsIn("Asia/Kolkata");
    setGeolocation(undefined);

    renderBand();

    expect(screen.queryByRole("button", { name: /use my location/i })).not.toBeInTheDocument();
  });

  it("switches to the shared position when the traveller taps the button", async () => {
    pretendBrowserIsIn("Asia/Kolkata");
    setGeolocation({
      getCurrentPosition: (onSuccess: PositionCallback) =>
        onSuccess({ coords: { latitude: 21.4225, longitude: 39.8262 } } as GeolocationPosition),
    });

    renderBand();
    act(() => {
      screen.getByRole("button", { name: /use my location/i }).click();
    });

    expect(screen.getByText(/Today at your location/i)).toBeInTheDocument();
  });

  it("marks the upcoming prayer for screen readers too", () => {
    pretendBrowserIsIn("Asia/Kolkata");

    renderBand();

    // 09:00 in Delhi: dhuhr is next.
    expect(screen.getByLabelText(/Dhuhr, next prayer/i)).toBeInTheDocument();
  });
});

describe("HalalBand call to action", () => {
  it("sends visitors to the Halal page", () => {
    renderBand();

    expect(screen.getByRole("link", { name: /explore halal travel/i })).toHaveAttribute(
      "href",
      all_routes.halal,
    );
  });
});
