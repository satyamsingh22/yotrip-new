import { describe, it, expect } from "vitest";
import { isLightHeroPath } from "./lightHero";

describe("isLightHeroPath", () => {
  it("covers the pale-sky homepage", () => {
    expect(isLightHeroPath("/")).toBe(true);
    expect(isLightHeroPath("/index")).toBe(true);
  });

  it("covers the Halal page, whose hero is the same pale sky gradient", () => {
    expect(isLightHeroPath("/halal")).toBe(true);
  });

  it("leaves dark-hero pages on the default white chrome", () => {
    expect(isLightHeroPath("/flight/flight-list")).toBe(false);
    expect(isLightHeroPath("/hotel/hotel-grid")).toBe(false);
    expect(isLightHeroPath("/car/car-grid")).toBe(false);
  });

  it("ignores a trailing slash so /halal/ is not left unreadable", () => {
    expect(isLightHeroPath("/halal/")).toBe(true);
  });
});
