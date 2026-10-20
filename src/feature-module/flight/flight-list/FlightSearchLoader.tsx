import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./FlightSearchLoader.scss";

/** Full-screen loading scene; the progress card overlays it.
 *  Re-encoded with the baked-in border cropped off, a keyframe every 0.5s and
 *  fast-start (moov first) so it starts at once. */
const LOADER_VIDEO = "/assets/video/yotrip-flight-loading.mp4?v=3";
/** First frame of the same video — shown until it plays, and as the fallback
 *  (error / autoplay blocked / reduced motion), so the art never switches. */
const LOADER_POSTER = "/assets/img/flight/flight-loader-video-poster.webp";
/** Slowed so Yori's poses unfold over a typical search (10s clip → ~18s). */
const PLAYBACK_RATE = 0.55;

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
const TipStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F5B301" aria-hidden>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

/** Storyboard stages (status + tip) — advance with the progress %. */
const STAGES: { min: number; status: string; tip: string; icon: ReactNode }[] = [
  { min: 0, status: "Preparing your search...", tip: "Tuesday & Wednesday flights are usually cheaper!", icon: <TipBulb /> },
  { min: 28, status: "Checking availability with 500+ airlines...", tip: "Flexible dates can save you more money!", icon: <TipGlobe /> },
  { min: 52, status: "Finding the best routes...", tip: "Non-stop flights are faster and more convenient!", icon: <TipPlane /> },
  { min: 68, status: "Exploring the best deals for you...", tip: "Sign in to get exclusive member deals!", icon: <TipTag /> },
  { min: 86, status: "Comparing prices across airlines...", tip: "Check nearby airports for better prices!", icon: <TipShield /> },
  { min: 96, status: "Almost done...", tip: "Booking in advance gives you the best fares!", icon: <TipStar /> },
];

const PROGRESS_TAU_SEC = 11;

type FlightSearchLoaderProps = {
  fromCity?: string;
  fromCode?: string;
  toCity?: string;
  toCode?: string;
};

function stageForPercent(percent: number) {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (percent >= s.min) current = s;
  }
  return current;
}

const FlightSearchLoader = ({
  fromCity,
  fromCode,
  toCity,
  toCode,
}: FlightSearchLoaderProps) => {
  const [progress, setProgress] = useState(5);
  const [useVideo, setUseVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const percent = Math.min(100, Math.max(0, Math.round(progress)));
  const stage = useMemo(() => stageForPercent(percent), [percent]);

  const routeLabel =
    fromCity && toCity
      ? `${fromCity}${fromCode ? ` (${fromCode})` : ""} → ${toCity}${toCode ? ` (${toCode})` : ""}`
      : "your route";

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setUseVideo(false);
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

  // Plain playback. (Seeking currentTime on every frame stalled the decoder and
  // left the poster or a frozen frame on screen — "sometimes image, sometimes video".)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;
    const start = () => {
      video.playbackRate = PLAYBACK_RATE;
      void video.play().catch(() => {
        /* autoplay blocked: the poster (same first frame) stays — no art switch */
      });
    };
    if (video.readyState >= 1) start();
    else video.addEventListener("loadedmetadata", start, { once: true });
    return () => video.removeEventListener("loadedmetadata", start);
  }, [useVideo]);

  return (
    <div
      className="fsl fsl--video-scene"
      role="status"
      aria-live="polite"
      aria-label={`Finding the best flights for ${routeLabel}`}
    >
      <div className="fsl__scene-wrap" aria-hidden>
        {useVideo ? (
          <video
            ref={videoRef}
            className="fsl__scene fsl__scene--video"
            src={LOADER_VIDEO}
            poster={LOADER_POSTER}
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={() => setUseVideo(false)}
          />
        ) : (
          <img
            src={LOADER_POSTER}
            alt=""
            className="fsl__scene fsl__scene--video"
            draggable={false}
          />
        )}
      </div>


      <section className="fsl__card">
        <div className="fsl__card-main">
          <img src="/Yotrip-logo-no-bg.svg" alt="" className="fsl__card-mark" aria-hidden="true" />
          <div className="fsl__card-body">
            <p className="fsl__status">{stage.status}</p>
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
