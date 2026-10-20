import { describe, expect, it } from "vitest";
import {
  displayAirlineName,
  displayAmenity,
  displayCabinClass,
  displayCarLabel,
  displayCarTitle,
  displayHotelAddress,
  displayHotelName,
  dedupeAmenitiesForDisplay,
  resolveCarListingTitle,
} from "./displayLabels";

const zhDict: Record<string, string> = {
  "flightList.economy": "经济舱",
  "flightList.businessClass": "商务舱",
  "airlines.airIndia": "印度航空",
  "airlines.emirates": "阿联酋航空",
  "airlines.indigo": "靛蓝航空",
  "amenities.wifi": "无线网络",
  "amenities.checkIn": "入住",
  "amenities.roomService": "客房服务",
  "amenities.giftShop": "礼品店",
  "amenities.atm": "自动取款机",
  "amenities.nonSmoking": "无烟",
  "amenities.parking": "停车场",
  "amenities.pool": "游泳池",
  "amenities.spa": "水疗中心",
  "amenities.rollawayBed": "折叠床",
  "amenities.extraPerson": "可加人",
  "amenities.crib": "婴儿床",
  "carCategories.standard": "标准",
  "carCategories.sedan": "轿车",
  "carCategories.standard_sedan": "标准轿车",
  "carCategories.compact_4_5_door": "紧凑型 4/5 门",
  "carCategories.automatic": "自动挡",
  "carCategories.economy": "经济型",
  "carCategories.door": "门",
  "carCategories.4_5": "4/5",
  "carList.orSimilar": "或同级",
  "hotelNameTokens.hotel": "酒店",
  "hotelNameTokens.inn": "客栈",
  "hotelNameTokens.resort": "度假村",
  "hotelNameTokens.guestHouse": "宾馆",
  "cities.Jaipur": "斋浦尔",
  "holidayCountries.India": "印度",
  "regions.Rajasthan": "拉贾斯坦邦",
};

const t = (key: string, options?: { defaultValue?: string }) =>
  zhDict[key] ?? options?.defaultValue ?? key;

describe("displayLabels", () => {
  it("localises cabin classes", () => {
    expect(displayCabinClass("Economy", t)).toBe("经济舱");
    expect(displayCabinClass("Business Class", t)).toBe("商务舱");
    expect(displayCabinClass("Weird Cabin", t)).toBe("Weird Cabin");
  });

  it("localises airline brand names", () => {
    expect(displayAirlineName("Air India Limited", t)).toBe("印度航空");
    expect(displayAirlineName("Emirates", t)).toBe("阿联酋航空");
    expect(displayAirlineName("IndiGo Airlines", t)).toBe("靛蓝航空");
    expect(displayAirlineName("Unknown Air", t)).toBe("Unknown Air");
  });

  it("localises car category compounds", () => {
    expect(displayCarLabel("Standard Sedan", t)).toBe("标准轿车");
    expect(displayCarLabel("Compact 4/5 Door", t)).toBe("紧凑型 4/5 门");
    expect(displayCarLabel("Automatic", t)).toBe("自动挡");
  });

  it("localises car titles with or-similar suffix", () => {
    expect(displayCarTitle("Toyota Corolla or similar", t)).toBe(
      "Toyota Corolla 或同级",
    );
    expect(displayCarTitle("Standard Sedan", t)).toBe("标准轿车");
  });

  it("prefers localised category as car listing title", () => {
    const resolved = resolveCarListingTitle(
      {
        display: { title: "Toyota Corolla or similar" },
        car: {
          class: "Economy",
          bodyType: "4/5 Door",
          makeAndModel: "Toyota Corolla or similar",
        },
      },
      t,
      "Vehicle",
    );
    expect(resolved.title).toBe("经济型 4/5 门");
    expect(resolved.subtitle).toBe("Toyota Corolla 或同级");
  });

  it("localises common hotel amenities", () => {
    expect(displayAmenity("Wifi", t)).toBe("无线网络");
    expect(displayAmenity("Check-in", t)).toBe("入住");
    expect(displayAmenity("Room Service", t)).toBe("客房服务");
    expect(displayAmenity("Gift/Souvenir Shop", t)).toBe("礼品店");
    expect(displayAmenity("Atm/Cash Machine", t)).toBe("自动取款机");
    expect(displayAmenity("Smoke-Complimentary Property", t)).toBe("无烟");
  });

  it("localises Sabre bed/occupancy jargon instead of trusting the machine translation", () => {
    // The live-translated fallback is what produced "بالغ قابل للطي"
    // ("foldable adult") in Arabic — the dictionary must win over it.
    expect(displayAmenity("Rollaway adult", t, "可折叠的成人")).toBe("折叠床");
    expect(displayAmenity("Rollaway bed", t, "可折叠的成人")).toBe("折叠床");
    expect(displayAmenity("Extra adult charge", t, "额外成人费")).toBe("可加人");
    expect(displayAmenity("Extra Person", t, "额外的人")).toBe("可加人");
    expect(displayAmenity("Cribs", t, "婴儿床们")).toBe("婴儿床");
    expect(displayAmenity("Crib charge", t, "婴儿床费")).toBe("婴儿床");
  });

  it("drops amenities that collapse to the same localised label", () => {
    const amenities = [
      "Air conditioning",
      "Pool",
      "Outdoor pool",
      "Parking",
      "Free Parking",
      "Spa",
      "Health spa",
      "Rooftop helipad",
    ];
    const entries = dedupeAmenitiesForDisplay(amenities, undefined, t);

    expect(entries.map((entry) => entry.label)).toEqual([
      "Air conditioning",
      "游泳池",
      "停车场",
      "水疗中心",
      "Rooftop helipad",
    ]);
    // The first raw string of each group survives, so icon lookup still works.
    expect(entries.map((entry) => entry.amenity)).toEqual([
      "Air conditioning",
      "Pool",
      "Parking",
      "Spa",
      "Rooftop helipad",
    ]);
  });

  it("de-dupes unrecognised amenities on their translated label", () => {
    const amenities = ["Rooftop helipad", "Roof-top helipad", "Golf"];
    const translated = ["屋顶停机坪", "屋顶停机坪", "高尔夫"];
    const entries = dedupeAmenitiesForDisplay(amenities, translated, t);

    expect(entries.map((entry) => entry.label)).toEqual([
      "屋顶停机坪",
      "高尔夫",
    ]);
  });

  it("ignores blank amenities when de-duping", () => {
    const entries = dedupeAmenitiesForDisplay(
      ["Wifi", "", null, undefined, "  ", "Golf"],
      undefined,
      t,
    );

    expect(entries.map((entry) => entry.label)).toEqual(["无线网络", "Golf"]);
  });

  it("localises generic hotel name tokens from API strings", () => {
    expect(displayHotelName("Hotel New City Inn", t)).toBe("酒店 New City 客栈");
    expect(displayHotelName("Kailash Hotel", t)).toBe("Kailash 酒店");
    expect(displayHotelName("Beach Resort", t)).toBe("Beach 度假村");
    expect(displayHotelName("Palm Guest House", t)).toBe("Palm 宾馆");
  });

  it("localises known fragments inside hotel addresses", () => {
    expect(
      displayHotelAddress("Johari Bazar, Jaipur, Rajasthan, India", t),
    ).toBe("Johari Bazar, 斋浦尔, 拉贾斯坦邦, 印度");
  });
});
