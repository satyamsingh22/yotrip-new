import { describe, it, expect, vi } from "vitest";
import { buildFareCalendarBody, fetchFareCalendar, indexByDate } from "./fareCalendar";

describe("buildFareCalendarBody", () => {
  it("uppercases codes and applies defaults", () => {
    const b = buildFareCalendarBody({ origin: "del", destination: "bom", centerDate: "2026-08-15" });
    expect(b).toMatchObject({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15", days: 14 });
  });

  it("sends the visible month so the backend prices the whole grid", () => {
    const b = buildFareCalendarBody({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15", month: "2026-09" });
    expect(b.month).toBe("2026-09");
  });

  it("derives the month from centerDate when the caller does not pass one", () => {
    const b = buildFareCalendarBody({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15" });
    expect(b.month).toBe("2026-08");
  });

  it("lets the caller widen the window explicitly", () => {
    const b = buildFareCalendarBody({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15", days: 30 });
    expect(b.days).toBe(30);
  });
});

describe("fetchFareCalendar", () => {
  it("returns the parsed response on success", async () => {
    const post = vi.fn().mockResolvedValue({ data: { success: true, days: [{ date: "2026-08-15", price: 4342, provider: "sabre", indicative: true }], cheapest: { date: "2026-08-15", price: 4342 }, currency: "INR", providers: ["sabre"], tripjackUnavailable: false, unavailable: false } });
    const res = await fetchFareCalendar({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15", month: "2026-08", days: 30 }, { post });
    expect(res.days[0].price).toBe(4342);
  });

  it("returns a safe unavailable response on error (UI falls back)", async () => {
    const post = vi.fn().mockRejectedValue(new Error("network"));
    const res = await fetchFareCalendar({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15", month: "2026-08", days: 30 }, { post });
    expect(res.unavailable).toBe(true);
    expect(res.days).toEqual([]);
  });
});

describe("indexByDate", () => {
  it("maps ISO date -> day", () => {
    const idx = indexByDate([{ date: "2026-08-15", price: 4342, provider: "sabre", indicative: true }]);
    expect(idx["2026-08-15"].price).toBe(4342);
  });
});
