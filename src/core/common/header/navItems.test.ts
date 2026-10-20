import { describe, it, expect } from "vitest";
import { buildNavItems } from "./navItems";

const allOn = () => true;
const allOff = () => false;

describe("buildNavItems", () => {
  it("lists home followed by the booking verticals", () => {
    const keys = buildNavItems(allOn).map((item) => item.labelKey);

    expect(keys).toEqual([
      "nav.home",
      "nav.flight",
      "nav.hotel",
      "nav.car",
      "nav.package",
    ]);
  });

  it("never surfaces Halal in the top bar", () => {
    // The page itself still lives at /halal — it just isn't a nav item.
    expect(buildNavItems(allOn).map((item) => item.labelKey)).not.toContain(
      "nav.halal",
    );
    expect(buildNavItems(allOn).map((item) => item.path)).not.toContain(
      "/halal",
    );
  });

  it("accents nothing now that Halal is gone", () => {
    expect(buildNavItems(allOn).filter((item) => item.accent)).toHaveLength(0);
  });

  it("leaves home and packages when every booking vertical is off", () => {
    expect(buildNavItems(allOff).map((item) => item.labelKey)).toEqual([
      "nav.home",
      "nav.package",
    ]);
  });

  it("still hides a disabled vertical", () => {
    const keys = buildNavItems((vertical) => vertical !== "cars").map(
      (item) => item.labelKey,
    );

    expect(keys).toEqual([
      "nav.home",
      "nav.flight",
      "nav.hotel",
      "nav.package",
    ]);
  });
});
