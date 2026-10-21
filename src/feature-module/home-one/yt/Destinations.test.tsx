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
  it("links each city to homepage packages with that destination prefilled", () => {
    renderCards();

    const expected: [string, string, string][] = [
      ["Dubai", "Dubai", "AE"],
      ["Istanbul", "Istanbul", "TR"],
      ["Maldives", "Maldives", "MV"],
      ["Kuala Lumpur", "Kuala Lumpur", "MY"],
    ];

    for (const [label, dest, country] of expected) {
      const card = screen.getByText(label).closest("a");
      const href = card?.getAttribute("href") ?? "";
      expect(href, label).toContain("tab=packages");
      expect(href, label).toContain(`destCountry=${country}`);
      expect(href, label).toMatch(
        new RegExp(`dest=${dest.replace(/\s+/g, "[+%20]")}`),
      );
    }
  });

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
