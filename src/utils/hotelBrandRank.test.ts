import { describe, expect, it } from "vitest";
import {
  getHotelBrandScore,
  rankHotelsByBrand,
  sortHotels,
} from "./hotelBrandRank";

describe("hotelBrandRank", () => {
  it("scores luxury flagships above generic chain hotels", () => {
    expect(getHotelBrandScore({ name: "JW Marriott Hotel Cairo" })).toBe(100);
    expect(getHotelBrandScore({ name: "The St. Regis Cairo" })).toBe(100);
    expect(getHotelBrandScore({ name: "The Ritz-Carlton, Riyadh" })).toBe(100);
    expect(getHotelBrandScore({ name: "Four Seasons Hotel Dubai" })).toBe(100);
    expect(getHotelBrandScore({ name: "Fairmont Nile City" })).toBe(100);
    expect(
      getHotelBrandScore({ name: "InterContinental Cairo Citystars" }),
    ).toBe(100);
    expect(getHotelBrandScore({ name: "Marriott Mena House Cairo" })).toBe(80);
    expect(
      getHotelBrandScore({ name: "Hilton Cairo Zamalek Residences" }),
    ).toBe(80);
  });

  it("still scores a translated display name when nameOriginal is English", () => {
    expect(
      getHotelBrandScore({
        name: "فندق هيلتون القاهرة",
        nameOriginal: "Hilton Cairo Zamalek Residences",
      }),
    ).toBe(80);
  });

  it("matches Tripjack listings that only put the brand in the hotel name", () => {
    expect(
      getHotelBrandScore({
        name: "Hilton Cairo Omar Elkhayam",
        brand: null,
        chain: null,
      }),
    ).toBe(80);
  });

  it("does not let select-service brands inherit the parent score", () => {
    expect(
      getHotelBrandScore({ name: "Courtyard by Marriott Giza" }),
    ).toBe(55);
    expect(
      getHotelBrandScore({ name: "Hilton Garden Inn New Delhi Saket" }),
    ).toBe(55);
  });

  it("ranks branded hotels above cheaper unknown properties", () => {
    const ranked = rankHotelsByBrand([
      { id: "cheap", name: "The GEM View Boutique", price: 80, rating: 5 },
      {
        id: "hilton",
        name: "Hilton Cairo Zamalek Residences",
        price: 420,
        rating: 5,
      },
      { id: "stregis", name: "The St. Regis Cairo", price: 900, rating: 5 },
      {
        id: "courtyard",
        name: "Courtyard by Marriott Giza",
        price: 310,
        rating: 4,
      },
    ]);

    expect(ranked.map((h) => h.id)).toEqual([
      "stregis",
      "hilton",
      "courtyard",
      "cheap",
    ]);
  });

  it("recommended sort is the default and price sort still works", () => {
    const hotels = [
      { id: "ic", name: "InterContinental Cairo Citystars", price: 500 },
      { id: "cheap", name: "Palace Pyramids Inn", price: 70 },
    ];

    expect(sortHotels(hotels).map((h) => h.id)).toEqual(["ic", "cheap"]);
    expect(sortHotels(hotels, "recommended").map((h) => h.id)).toEqual([
      "ic",
      "cheap",
    ]);
    expect(sortHotels(hotels, "priceLow").map((h) => h.id)).toEqual([
      "cheap",
      "ic",
    ]);
  });
});
