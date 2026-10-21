import { useEffect, useState, type ReactNode } from "react";
import LoaderStageScenes from "@/components/loader/LoaderStageScenes";
import { loaderStages, stageForPercent } from "@/components/loader/loaderStages";
import "./FlightSearchLoader.scss";

/** One storyboard scene per step, picked by the progress bar (never repeats). */
const STAGE_IMAGES = loaderStages("/assets/img/flight/loader", "flight-stage");

const TipBulb = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A6CF5" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </svg>
);
const TipGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="#1A6CF5" />
    <path d="M5 9c2 0 3 1 3 3s2 2 2 4-1 3-1 4M14 3c-1 2 0 3 2 3s3 2 2 4 1 3 3 3" fill="none" stroke="#7FD1A8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TipPlane = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1A6CF5" aria-hidden>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(45 12 12)" />
  </svg>
);
const TipTag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 12.6V4a1 1 0 0 1 1-1h8.6a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.6 8.6a1 1 0 0 1-1.4 0L3.3 13.3a1 1 0 0 1-.3-.7z" fill="#1A6CF5" />
    <circle cx="8" cy="8" r="1.8" fill="#fff" />
  </svg>
);
const TipShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2 4 5v6.5c0 5 3.4 9 8 10.5 4.6-1.5 8-5.5 8-10.5V5z" fill="#1A6CF5" />
    <path d="m8.5 12 2.4 2.4L15.8 9.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
/** Status + tip per storyboard scene (same order as the flight-stage-N images). */
const STAGES: { status: string; tip: string; icon: ReactNode }[] = [
  { status: "Searching flights...", tip: "Tuesday & Wednesday flights are usually cheaper!", icon: <TipBulb /> },
  { status: "Comparing prices across airlines...", tip: "Check nearby airports for better prices!", icon: <TipShield /> },
  { status: "Checking seat availability...", tip: "Flexible dates can save you more money!", icon: <TipGlobe /> },
  { status: "Applying the best deals...", tip: "Sign in to get exclusive member deals!", icon: <TipTag /> },
  { status: "Finalizing your options...", tip: "Non-stop flights are faster and more convenient!", icon: <TipPlane /> },
];

const PROGRESS_TAU_SEC = 8; // ~5% → 80% (scene 5) in about 14s

type FlightSearchLoaderProps = {
  fromCity?: string;
  fromCode?: string;
  toCity?: string;
  toCode?: string;
};

const FlightSearchLoader = ({
  fromCity,
  fromCode,
  toCity,
  toCode,
}: FlightSearchLoaderProps) => {
  const [progress, setProgress] = useState(5);
  const percent = Math.min(100, Math.max(0, Math.round(progress)));
  const activeStep = stageForPercent(percent, STAGE_IMAGES.length);
  const stage = STAGES[activeStep];

  const routeLabel =
    fromCity && toCity
      ? `${fromCity}${fromCode ? ` (${fromCode})` : ""} → ${toCity}${toCode ? ` (${toCode})` : ""}`
      : "your route";

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setProgress(50);
      return;
    }
    let frame = 0;
    let cancelled = false;
    const started = performance.now();
    // Eases towards 96% — the real search result replaces the loader.
    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = (now - started) / 1000;
      setProgress(Math.min(96, 5 + 91 * (1 - Math.exp(-elapsed / PROGRESS_TAU_SEC))));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fsl fsl--video-scene"
      role="status"
      aria-live="polite"
      aria-label={`Finding the best flights for ${routeLabel}`}
    >
      <div className="fsl__scene-wrap" aria-hidden>
        <LoaderStageScenes images={STAGE_IMAGES} active={activeStep} />
      </div>

      <section className="fsl__card">
        <div className="fsl__card-main">
          <img src="/Yotrip-logo-no-bg.svg" alt="" className="fsl__card-mark" aria-hidden="true" />
          <div className="fsl__card-body">
            <p className="fsl__status" key={activeStep}>
              {activeStep + 1}/{STAGES.length} · {stage.status}
            </p>
            <div className="fsl__progress">
              <div
                className="fsl__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={`${percent} percent — ${stage.status}`}
              >
                <div className="fsl__progress-bar" style={{ width: `${percent}%` }}>
                  <span className="fsl__progress-plane" aria-hidden>
                    <svg viewBox="0 0 24 24" width="30" height="30">
                      <path
                        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
                        transform="rotate(90 12 12)"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <span className="fsl__progress-pct">{percent}%</span>
            </div>
          </div>
        </div>

        <div className="fsl__tip">
          <span className="fsl__tip-icon" aria-hidden="true">
            {stage.icon}
          </span>
          <p className="fsl__tip-text">
            <span className="fsl__tip-label">Tip:</span> {stage.tip}
          </p>
        </div>
      </section>
    </div>
  );
};

export default FlightSearchLoader;
