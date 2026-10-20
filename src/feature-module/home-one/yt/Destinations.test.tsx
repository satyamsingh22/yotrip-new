import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Destinations from "./Destinations";

const renderCards = () =>
  render(
    <MemoryRouter>
      <Destinations />
    </MemoryRouter>,
  );

describe("home destination cards", () => {
  it("links each city to a flight search for that destination", () => {
    renderCards();

    const expected: [string, string][] = [
      ["Dubai", "DXB"],
      ["Istanbul", "IST"],
      ["Maldives", "MLE"],
      ["Kuala Lumpur", "KUL"],
    ];

    for (const [city, code] of expected) {
      const card = screen.getByText(city).closest("a");
      expect(card, city).toHaveAttribute(
        "href",
        expect.stringContaining(`to=${code}`),
      );
    }
  });

  // The cards used to print a hardcoded "LON → DXB". Every visitor departs from
  // their own city, so a fixed origin on the card promised a route the search
  // would never run.
  it("promises no origin airport it cannot honour", () => {
    renderCards();

    for (const city of ["Dubai", "Istanbul", "Maldives", "Kuala Lumpur"]) {
      const card = screen.getByText(city).closest("a")!;
      expect(card.textContent, city).not.toMatch(/LON/);
      expect(card.textContent, city).not.toMatch(/→/);
    }
    for (const code of ["DXB", "IST", "MLE", "KUL"]) {
      expect(screen.queryByText(new RegExp(code)), code).toBeNull();
    }
  });

  it("still shows the city and its note", () => {
    renderCards();

    expect(screen.getByText("Dubai")).toBeInTheDocument();
    expect(screen.getByText("Beaches, souks & skyline")).toBeInTheDocument();
    expect(screen.queryByText(/Halal/i)).toBeNull();
  });
});
