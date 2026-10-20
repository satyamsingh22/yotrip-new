import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FlightResultsSkeleton from "./FlightResultsSkeleton";

describe("FlightResultsSkeleton", () => {
  it("announces itself to assistive tech", () => {
    render(<FlightResultsSkeleton />);
    const status = screen.getByRole("status", { name: /searching flights/i });
    expect(status).toBeInTheDocument();
  });

  it("renders five placeholder rows by default", () => {
    const { container } = render(<FlightResultsSkeleton />);
    expect(
      container.querySelectorAll(".yt-flight-skeleton__card"),
    ).toHaveLength(5);
  });

  it("honours an explicit row count", () => {
    const { container } = render(<FlightResultsSkeleton rows={2} />);
    expect(
      container.querySelectorAll(".yt-flight-skeleton__card"),
    ).toHaveLength(2);
  });

  it("never positions itself as a full-screen overlay", () => {
    const { container } = render(<FlightResultsSkeleton />);

    // The whole point of this component is to be in-flow: SearchLoader's
    // `position: fixed; inset: 0` is the bug it replaces. Styling lives in the
    // embedded <style> block, so checking only the inline attribute would pass
    // even if the stylesheet reintroduced the overlay.
    const root = container.querySelector(".yt-flight-skeleton") as HTMLElement;
    expect(root.style.position).not.toBe("fixed");

    const css = Array.from(container.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("");
    expect(css).not.toMatch(/position\s*:\s*fixed/);
  });
});
