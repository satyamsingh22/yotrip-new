import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrayerCard from "./PrayerCard";
import type { PrayerRow } from "@/hooks/useHalalLocation";
import type { Countdown } from "@/hooks/useNextPrayerCountdown";

const PRAYERS: PrayerRow[] = [
  { name: "fajr", label: "Fajr", arabic: "الفجر", time: "04:13", isNext: false },
  { name: "dhuhr", label: "Dhuhr", arabic: "الظهر", time: "13:10", isNext: true },
  { name: "asr", label: "Asr", arabic: "العصر", time: "17:04", isNext: false },
  { name: "maghrib", label: "Maghrib", arabic: "المغرب", time: "20:17", isNext: false },
  { name: "isha", label: "Isha", arabic: "العشاء", time: "21:59", isNext: false },
];

const COUNTDOWN: Countdown = {
  name: "dhuhr",
  label: "Dhuhr",
  isTomorrow: false,
  remainingMs: 8_040_000,
  text: "2h 14m 00s",
};

describe("PrayerCard", () => {
  it("lists all five prayers with their times", () => {
    render(<PrayerCard prayers={PRAYERS} sunrise="05:47" countdown={COUNTDOWN} />);

    for (const prayer of PRAYERS) {
      expect(screen.getByText(prayer.label)).toBeInTheDocument();
      expect(screen.getByText(prayer.time)).toBeInTheDocument();
    }
  });

  it("shows the Arabic name alongside each prayer", () => {
    render(<PrayerCard prayers={PRAYERS} sunrise="05:47" countdown={COUNTDOWN} />);

    expect(screen.getByText("الفجر")).toBeInTheDocument();
  });

  it("shows sunrise separately from the five prayers", () => {
    render(<PrayerCard prayers={PRAYERS} sunrise="05:47" countdown={COUNTDOWN} />);

    expect(screen.getByText("05:47")).toBeInTheDocument();
    expect(screen.getByText(/Sunrise/i)).toBeInTheDocument();
  });

  it("announces the countdown to the next prayer", () => {
    render(<PrayerCard prayers={PRAYERS} sunrise="05:47" countdown={COUNTDOWN} />);

    expect(screen.getByText("2h 14m 00s")).toBeInTheDocument();
    expect(screen.getByText(/Dhuhr in/i)).toBeInTheDocument();
  });

  it("says so when the next prayer is tomorrow's Fajr", () => {
    render(
      <PrayerCard
        prayers={PRAYERS}
        sunrise="05:47"
        countdown={{ ...COUNTDOWN, name: "fajr", label: "Fajr", isTomorrow: true }}
      />,
    );

    expect(screen.getByText(/Fajr tomorrow in/i)).toBeInTheDocument();
  });

  it("marks the next prayer's row for assistive tech", () => {
    render(<PrayerCard prayers={PRAYERS} sunrise="05:47" countdown={COUNTDOWN} />);

    expect(screen.getByRole("listitem", { current: "time" })).toHaveTextContent("Dhuhr");
  });
});
