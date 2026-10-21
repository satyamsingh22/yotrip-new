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
      [/^flights/i, "/index?tab=flights&focus=flight-from"],
      [/^hotels/i, "/index?tab=hotels&focus=hotel-city"],
      [/^car rentals/i, "/index?tab=cars&focus=car-pickup"],
      [/^holiday packages/i, "/index?tab=packages&focus=package-destination"],
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
