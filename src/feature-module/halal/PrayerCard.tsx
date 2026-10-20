/**
 * The five daily prayers, the next one picked out, and a live countdown.
 *
 * Sunrise sits apart from the list: it is not a prayer, but it bounds fajr and
 * people look for it, so it belongs on the card without being counted as one of
 * the five.
 */

import { Moon, Sun, Sunset } from "@/feature-module/home-one/yt/icons";
import type { PrayerRow } from "@/hooks/useHalalLocation";
import type { Countdown } from "@/hooks/useNextPrayerCountdown";
import type { PrayerName } from "@/utils/prayer/prayerTimes";

const ICONS: Record<PrayerName, typeof Moon> = {
  fajr: Moon,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

type Props = {
  prayers: PrayerRow[];
  sunrise: string;
  countdown: Countdown;
};

const PrayerCard = ({ prayers, sunrise, countdown }: Props) => (
  <div className="hl-card" data-testid="prayer-card">
    <div className="hl-countdown" aria-live="polite">
      <span className="hl-countdown-label">
        {countdown.isTomorrow ? `${countdown.label} tomorrow in` : `${countdown.label} in`}
      </span>
      <span className="hl-countdown-value">{countdown.text}</span>
    </div>

    <ul className="hl-times">
      {prayers.map((prayer) => {
        const Icon = ICONS[prayer.name];
        return (
          <li
            key={prayer.name}
            className={prayer.isNext ? "hl-time is-next" : "hl-time"}
            aria-current={prayer.isNext ? "time" : undefined}
          >
            <span className="hl-time-name">
              <Icon size={18} />
              <span>
                {prayer.label}
                <em className="hl-time-ar" lang="ar" dir="rtl">
                  {prayer.arabic}
                </em>
              </span>
            </span>
            <span className="hl-time-val">{prayer.time}</span>
          </li>
        );
      })}
    </ul>

    <div className="hl-sunrise">
      <span>
        <Sun size={16} /> Sunrise (Shurooq)
      </span>
      <span>{sunrise}</span>
    </div>
  </div>
);

export default PrayerCard;
