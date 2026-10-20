import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CultureBand from "./CultureBand";

vi.mock("./HalalBand", () => ({
  default: () => <div data-testid="halal-band" />,
}));

const payload = {
  country: "India",
  holidays: [
    { name: "Diwali", date: "2026-11-08", endDate: "2026-11-08", emoji: "🪔", span: null },
  ],
};

const draw = (timeZone: string, fetchImpl: unknown) =>
  render(
    <MemoryRouter>
      <CultureBand timeZone={timeZone} fetchImpl={fetchImpl as typeof fetch} />
    </MemoryRouter>,
  );

describe("CultureBand", () => {
  it("renders the halal band for a Middle East visitor and never fetches", () => {
    const spy = vi.fn();
    draw("Asia/Riyadh", spy);
    expect(screen.getByTestId("halal-band")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("renders the halal band for an uncovered country", () => {
    draw("Europe/Berlin", vi.fn());
    expect(screen.getByTestId("halal-band")).toBeInTheDocument();
  });

  it("renders the holiday band for a covered country", async () => {
    const ok = vi.fn(async () => ({ ok: true, json: async () => payload }));
    draw("Asia/Kolkata", ok);
    await waitFor(() => expect(screen.getByText("Diwali")).toBeInTheDocument());
    expect(screen.queryByTestId("halal-band")).not.toBeInTheDocument();
  });

  it("falls back to the halal band when the holiday fetch fails", async () => {
    const bad = vi.fn(async () => {
      throw new Error("network");
    });
    draw("Asia/Kolkata", bad);
    await waitFor(() => expect(screen.getByTestId("halal-band")).toBeInTheDocument());
  });
});
