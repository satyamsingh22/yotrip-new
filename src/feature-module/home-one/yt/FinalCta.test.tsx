import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FinalCta from "./FinalCta";

const renderCta = () =>
  render(
    <MemoryRouter>
      <FinalCta />
    </MemoryRouter>,
  );

describe("FinalCta", () => {
  it("shows the closing headline", () => {
    renderCta();
    expect(
      screen.getByRole("heading", { name: /your next story\s*starts here/i }),
    ).toBeInTheDocument();
  });

  it("links each product tile to its live search page", () => {
    renderCta();
    const expected: [RegExp, string][] = [
      [/^flights/i, "/flight/flight-list"],
      [/^hotels/i, "/hotel/hotel-grid"],
      [/^car rentals/i, "/car/car-grid"],
      [/^holiday packages/i, "/package/package-grid"],
    ];
    for (const [name, href] of expected) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("does not link to the dead /register page", () => {
    renderCta();
    const registerLink = screen
      .queryAllByRole("link")
      .find((el) => el.getAttribute("href")?.startsWith("/register"));
    expect(registerLink).toBeUndefined();
  });
});
