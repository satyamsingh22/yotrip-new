import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HalalFeatures from "./HalalFeatures";

const renderPage = () =>
  render(
    <MemoryRouter>
      <HalalFeatures />
    </MemoryRouter>,
  );

describe("HalalFeatures", () => {
  it("explains all six halal travel features", () => {
    renderPage();

    for (const title of [
      "Halal-certified hotels",
      "Alcohol-free rooms",
      "Prayer time alerts",
      "Halal dining nearby",
      "Qibla at your hotel",
      "Hajj & Umrah packages",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("gives each feature a description, not just a label", () => {
    renderPage();

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.getByText(/certified by a recognised halal authority/i)).toBeInTheDocument();
  });

  it("links each destination into flight search with the destination prefilled", () => {
    renderPage();

    // flightList reads ?to=<IATA>; anything else silently searches the default route.
    for (const [city, iata] of [
      ["Madinah", "MED"],
      ["Istanbul", "IST"],
      ["Dubai", "DXB"],
    ] as const) {
      const link = screen.getByRole("link", { name: new RegExp(city) });

      expect(link.getAttribute("href")).toBe(`/flight/flight-list?to=${iata}`);
    }
  });

  it("sends Makkah to Jeddah, the airport pilgrims actually fly into", () => {
    renderPage();

    // Makkah has no airport of its own, so ?to=Makkah would find nothing.
    const makkah = screen.getByRole("link", { name: /Makkah/ });

    expect(makkah.getAttribute("href")).toBe("/flight/flight-list?to=JED");
  });

  it("says on the Makkah card that the flight lands in Jeddah", () => {
    renderPage();

    // Landing on a Jeddah search after clicking "Makkah" is only sensible if
    // the card said so first.
    expect(screen.getByRole("link", { name: /Makkah/ })).toHaveTextContent(/Jeddah/i);
  });

  it("offers all four destinations", () => {
    renderPage();

    for (const city of ["Makkah", "Madinah", "Istanbul", "Dubai"]) {
      expect(screen.getByRole("link", { name: new RegExp(city) })).toBeInTheDocument();
    }
  });

  it("does not send anyone to hotel search from here", () => {
    renderPage();

    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toContain("hotel");
    }
  });

  it("closes with a call to action that lands on the home search widget", () => {
    renderPage();

    // Home is where the visitor picks flights / hotels / cars for themselves,
    // rather than being dropped into a search for a route they never chose.
    expect(screen.getByRole("link", { name: /plan your trip/i })).toHaveAttribute(
      "href",
      "/index",
    );
  });

  it("keeps the closing call to action travel-neutral", () => {
    renderPage();

    // It leads to a page offering every vertical, so naming one would misdescribe it.
    const cta = screen.getByRole("link", { name: /plan your trip/i });

    expect(cta.textContent).not.toMatch(/flight|hotel|car/i);
  });
});
