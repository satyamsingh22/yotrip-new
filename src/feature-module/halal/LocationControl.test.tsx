import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationControl from "./LocationControl";
import type { HalalPlace } from "@/hooks/useHalalLocation";

const ISTANBUL: HalalPlace = {
  city: "Istanbul",
  latitude: 41.0082,
  longitude: 28.9784,
  timeZone: "Europe/Istanbul",
};

const props = {
  place: ISTANBUL,
  source: "timezone" as const,
  isFallback: false,
  canUseGps: true,
  isLocating: false,
  onUseGps: vi.fn(),
  onUseCity: vi.fn(),
  onReset: vi.fn(),
};

describe("LocationControl", () => {
  it("names the detected place and how it was found", () => {
    render(<LocationControl {...props} />);

    expect(screen.getByText(/Istanbul/)).toBeInTheDocument();
    expect(screen.getByText(/from your timezone/i)).toBeInTheDocument();
  });

  it("says when it is showing an exact position", () => {
    render(
      <LocationControl {...props} source="gps" place={{ ...ISTANBUL, city: "your location" }} />,
    );

    expect(screen.getByText(/your exact location/i)).toBeInTheDocument();
  });

  it("admits when it could not place the visitor at all", () => {
    render(
      <LocationControl
        {...props}
        isFallback
        place={{ ...ISTANBUL, city: "Makkah", timeZone: "Asia/Riyadh" }}
      />,
    );

    expect(screen.getByText(/couldn't work out where you are/i)).toBeInTheDocument();
  });

  it("asks for GPS when the button is pressed", async () => {
    const onUseGps = vi.fn();
    render(<LocationControl {...props} onUseGps={onUseGps} />);

    await userEvent.click(screen.getByRole("button", { name: /use my exact location/i }));

    expect(onUseGps).toHaveBeenCalledOnce();
  });

  it("hides the GPS button when the browser cannot provide it", () => {
    render(<LocationControl {...props} canUseGps={false} />);

    expect(screen.queryByRole("button", { name: /use my exact location/i })).toBeNull();
  });

  it("shows progress while the browser prompt is open", () => {
    render(<LocationControl {...props} isLocating />);

    expect(screen.getByRole("button", { name: /locating/i })).toBeDisabled();
  });

  it("searches cities and reports the chosen one", async () => {
    const onUseCity = vi.fn();
    render(<LocationControl {...props} onUseCity={onUseCity} />);

    await userEvent.click(screen.getByRole("button", { name: /change city/i }));
    await userEvent.type(screen.getByRole("combobox", { name: /search for a city/i }), "makk");
    await userEvent.click(screen.getByRole("option", { name: /Makkah/ }));

    expect(onUseCity).toHaveBeenCalledWith(
      expect.objectContaining({ city: "Makkah", timeZone: "Asia/Riyadh" }),
    );
  });

  it("tells the visitor when a search matches nothing", async () => {
    render(<LocationControl {...props} />);

    await userEvent.click(screen.getByRole("button", { name: /change city/i }));
    await userEvent.type(screen.getByRole("combobox", { name: /search for a city/i }), "zzzzz");

    expect(screen.getByText(/No city matches/i)).toBeInTheDocument();
  });

  it("offers to go back to automatic detection once a city is picked", async () => {
    const onReset = vi.fn();
    render(<LocationControl {...props} source="manual" onReset={onReset} />);

    await userEvent.click(screen.getByRole("button", { name: /detect automatically/i }));

    expect(onReset).toHaveBeenCalledOnce();
  });
});
