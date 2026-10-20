import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const axiosPost = vi.fn();
vi.mock("axios", () => ({
  default: { post: (...args: unknown[]) => axiosPost(...args), get: vi.fn() },
}));
vi.mock("react-hot-toast", () => {
  const toast = Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() });
  return { default: toast };
});
vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      pickupAirport: { id: "RUH", label: "RUH", value: "RUH", subtitle: "Riyadh", countryCode: "SA" },
      currency: "SAR",
    },
  }),
  getBrowserTimezone: () => "Asia/Riyadh",
}));

import { useCarResultsSearch } from "./useCarResultsSearch";
import { CarSearchProvider } from "../../../context/CarSearchContext";

const Harness = () => {
  useCarResultsSearch();
  return null;
};

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <CarSearchProvider>
        <Harness />
      </CarSearchProvider>
    </MemoryRouter>,
  );

const availabilityCalls = () => axiosPost.mock.calls.filter(([url]) => String(url).includes("/api/cars/availability"));

beforeEach(() => {
  axiosPost.mockReset();
  axiosPost.mockResolvedValue({ data: { success: true, vehicles: [] } });
});

describe("useCarResultsSearch", () => {
  it("searches the linked pickup, dates and times once", async () => {
    renderAt("/car/car-grid?pickup=DXB&pickupDate=2030-11-20&pickupTime=09:30&returnDate=2030-11-23&returnTime=18:00");

    await waitFor(() => expect(availabilityCalls()).toHaveLength(1));
    const body = availabilityCalls()[0][1];
    expect(body).toMatchObject({
      mode: "same-dropoff",
      pickupDate: "2030-11-20",
      pickupTime: "09:30",
      returnDate: "2030-11-23",
      returnTime: "18:00",
    });
    expect(JSON.stringify(body)).toContain("DXB");
    expect(JSON.stringify(body)).not.toContain("RUH"); // geo default never searched

    await new Promise((r) => setTimeout(r, 50));
    expect(availabilityCalls()).toHaveLength(1);
  });

  it("keeps the old cold-land search when the URL has no search", async () => {
    renderAt("/car/car-grid");
    await waitFor(() => expect(availabilityCalls().length).toBeGreaterThanOrEqual(1));
  });
});
