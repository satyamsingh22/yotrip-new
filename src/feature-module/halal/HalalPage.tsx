/**
 * The Halal page.
 *
 * Composition only — every piece of logic lives in a hook or a pure module, so
 * this file reads as the page's outline and nothing more.
 */

import { useEffect, useState } from "react";
import PageMeta from "@/core/common/PageMeta";
import { useHalalLocation } from "@/hooks/useHalalLocation";
import { useNextPrayerCountdown } from "@/hooks/useNextPrayerCountdown";
import PrayerCard from "./PrayerCard";
import LocationControl from "./LocationControl";
import QiblaCompass from "./QiblaCompass";
import HijriStrip from "./HijriStrip";
import MonthlyTimetable from "./MonthlyTimetable";
import HalalFeatures from "./HalalFeatures";
import "./halal.scss";

const TITLE = "Halal Travel — Prayer Times, Qibla & Timetable | YoTrip";

const DESCRIPTION =
  "Accurate prayer times, qibla direction and a full monthly timetable for wherever you are — plus halal-certified stays, alcohol-free rooms and Hajj & Umrah travel from YoTrip.";

/** The date only matters to the day, so an hourly tick is plenty to roll it over. */
const DAY_TICK_MS = 3_600_000;

const HalalPage = () => {
  const location = useHalalLocation();
  const countdown = useNextPrayerCountdown(location.times, location.place, location.method);
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setToday(new Date()), DAY_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const placeLabel = location.source === "gps" ? "your location" : location.place.city;

  return (
    <div className="yt-halal">
      <PageMeta title={TITLE} description={DESCRIPTION} canonicalPath="/halal" />

      <section className="hl-hero">
        <div className="wrap">
          <span className="sec-eyebrow">Halal travel</span>
          <h1>Prayer times, wherever you are.</h1>
          <p className="hl-hero-sub">
            Accurate to your location, calculated on your device, and free to use — whether or not
            you ever book with us.
          </p>

          <div className="hl-hero-grid">
            <div>
              <LocationControl
                place={location.place}
                source={location.source}
                isFallback={location.isFallback}
                canUseGps={location.canUseGps}
                isLocating={location.isLocating}
                onUseGps={location.useGps}
                onUseCity={location.useCity}
                onReset={location.reset}
              />
              <PrayerCard
                prayers={location.prayers}
                sunrise={location.sunrise}
                countdown={countdown}
              />
            </div>

            <div className="hl-hero-side">
              <HijriStrip now={today} timeZone={location.place.timeZone} />
              <QiblaCompass
                degrees={location.qibla.degrees}
                point={location.qibla.point}
                placeLabel={placeLabel}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section hl-table-section">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eyebrow">Plan ahead</span>
            <h2>This month, at a glance</h2>
            <p>Scan the month or print it for the fridge.</p>
          </div>

          <MonthlyTimetable place={location.place} today={today} placeLabel={placeLabel} />

          <p className="hl-method">
            Method: <strong>{location.methodName}</strong>. Times are calculated astronomically on
            your device and may differ from your local mosque by a minute or two. Always follow your
            mosque where they differ.
          </p>
        </div>
      </section>

      <HalalFeatures />
    </div>
  );
};

export default HalalPage;
