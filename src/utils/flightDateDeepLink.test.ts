import { describe, it, expect } from "vitest";
import { readDateDeepLink } from "./flightDateDeepLink";

describe("readDateDeepLink", () => {
  const today = new Date("2026-08-06T00:00:00Z");

  it("reads a valid departure date", () => {
    expect(readDateDeepLink("?dep=2026-11-08", today)).toEqual({
      departureDate: "2026-11-08",
      returnDate: "",
    });
  });

  it("reads a departure and return pair", () => {
    expect(readDateDeepLink("?dep=2026-11-08&ret=2026-11-11", today)).toEqual({
      departureDate: "2026-11-08",
      returnDate: "2026-11-11",
    });
  });

  it("ignores a return date earlier than departure", () => {
    expect(readDateDeepLink("?dep=2026-11-08&ret=2026-11-01", today)).toEqual({
      departureDate: "2026-11-08",
      returnDate: "",
    });
  });

  it("ignores past dates", () => {
    expect(readDateDeepLink("?dep=2020-01-01", today)).toBeNull();
  });

  it("ignores malformed dates", () => {
    expect(readDateDeepLink("?dep=notadate", today)).toBeNull();
    expect(readDateDeepLink("?dep=2026-13-45", today)).toBeNull();
  });

  it("returns null when no date params are present", () => {
    expect(readDateDeepLink("", today)).toBeNull();
    expect(readDateDeepLink("?to=DXB", today)).toBeNull();
  });
});
