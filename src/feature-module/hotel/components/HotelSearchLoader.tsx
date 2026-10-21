import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderStageScenes from "@/components/loader/LoaderStageScenes";
import { loaderStages, stageForPercent } from "@/components/loader/loaderStages";

const STEPS = [
  { icon: "isax-buildings5", labelKey: "step1" },
  { icon: "isax-tag", labelKey: "step2" },
  { icon: "isax-home-2", labelKey: "step3" },
  { icon: "isax-percentage-circle", labelKey: "step4" },
  { icon: "isax-tick-circle5", labelKey: "step5" },
] as const;

const TIP_KEYS = ["tip1", "tip2", "tip3", "tip4"] as const;

/** One storyboard scene per step, picked by the progress bar (never repeats). */
const STAGE_IMAGES = loaderStages("/assets/img/hotels/loader", "hotel-stage");

const TIP_MS = 4200;

/**
 * Full-screen hotel search loading experience.
 * Fake progress eases toward ~96% while the real search runs; unmount ends it.
 */
type HotelSearchLoaderProps = {
  /** Covers the listing body only so the breadcrumb hero stays visible. */
  scoped?: boolean;
};

const HotelSearchLoader = ({ scoped = false }: HotelSearchLoaderProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(4);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = (now - started) / 1000;
      // Ease toward 96% so the bar never finishes before the search does.
      const next = Math.min(96, 4 + 92 * (1 - Math.exp(-elapsed / 5.5)));
      setProgress(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIP_KEYS.length);
    }, TIP_MS);
    return () => window.clearInterval(id);
  }, []);

  const percent = Math.round(progress);
  const activeStep = stageForPercent(percent, STAGE_IMAGES.length);
  const stepLabel = t(`hotelList.${STEPS[activeStep].labelKey}`);
  const loaderTitle = t("hotelList.loaderTitle");

  return (
    <div
      className={`hsl${scoped ? " hsl--scoped" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={loaderTitle}
    >
      <div className="hsl__hero">
        <LoaderStageScenes images={STAGE_IMAGES} active={activeStep} />
      </div>

      <div className="hsl__content">
        <div className="hsl__spacer" aria-hidden="true" />

        <section className="hsl__card">
          <div className="hsl__card-row">
            <img
              src="/Yotrip-logo-no-bg.svg"
              alt=""
              className="hsl__card-mark"
              aria-hidden="true"
            />
            <p className="hsl__card-copy" key={activeStep}>
              <strong>
                {activeStep + 1}/{STEPS.length}
              </strong>{" "}
              {stepLabel}…
            </p>
          </div>

          <div className="hsl__progress">
            <div
              className="hsl__progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${percent}% — ${stepLabel}`}
            >
              <div
                className="hsl__progress-fill"
                style={{ transform: `scaleX(${percent / 100})` }}
              />
            </div>
            <span className="hsl__progress-pct">{percent}%</span>
          </div>

          <div className="hsl__tip" key={tipIndex}>
            <span className="hsl__tip-icon" aria-hidden="true">
              <i className="isax isax-lamp-on5" />
            </span>
            <p className="hsl__tip-text">
              <span className="hsl__tip-label">{t("hotelList.tip")}</span>{" "}
              {t(`hotelList.${TIP_KEYS[tipIndex]}`)}
            </p>
            <span className="hsl__tip-decor" aria-hidden="true">
              <i className="isax isax-reserve" />
              <i className="isax isax-bag-2" />
            </span>
          </div>
        </section>
      </div>

      <style>{`
        .hsl--scoped {
          position: absolute;
          inset: 0;
          z-index: 40;
          min-height: 420px;
          border-radius: 0 0 16px 16px;
        }

        .hsl {
          --hsl-navy: #152c6f;
          --hsl-blue: #1978ba;
          --hsl-teal: #0a9a9b;
          --hsl-sky: #e8f4fb;
          --hsl-card: #ffffff;
          --hsl-display: "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif;
          --hsl-body: "Plus Jakarta Sans", "IBM Plex Sans", sans-serif;

          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;
          background: #0b1f3a;
          color: var(--hsl-navy);
          font-family: var(--hsl-body);
        }

        .hsl__hero {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .hsl__hero-img {
          position: absolute;
          inset: -4%;
          background-size: cover;
          background-position: center 42%;
          background-repeat: no-repeat;
          transform-origin: 55% 40%;
          animation: hslKenBurns 18s ease-in-out infinite alternate;
        }

        .hsl__hero-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(244, 249, 252, 0.96) 0%, rgba(244, 249, 252, 0.78) 18%, rgba(244, 249, 252, 0.18) 42%, rgba(11, 31, 58, 0.18) 62%, rgba(11, 31, 58, 0.55) 100%),
            radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255, 255, 255, 0.75), transparent 70%);
        }

        .hsl__content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: clamp(20px, 4vh, 40px) clamp(16px, 4vw, 40px) clamp(16px, 3vh, 28px);
        }

        .hsl__header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: hslFadeUp 0.55s ease-out both;
        }

        .hsl__logo {
          height: clamp(48px, 7vw, 64px);
          width: auto;
          margin-bottom: 14px;
          filter: drop-shadow(0 8px 18px rgba(21, 44, 111, 0.14));
        }

        .hsl__title {
          margin: 0;
          max-width: 18ch;
          font-family: var(--hsl-display);
          font-size: clamp(1.45rem, 3.4vw, 2.15rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        }

        .hsl__ellipsis {
          display: inline-flex;
          gap: 4px;
          margin-left: 4px;
          vertical-align: middle;
        }

        .hsl__ellipsis i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          animation: hslDot 1.2s ease-in-out infinite;
        }

        .hsl__ellipsis i:nth-child(2) { animation-delay: 0.15s; background: #b8ecff; }
        .hsl__ellipsis i:nth-child(3) { animation-delay: 0.3s; background: rgba(255, 255, 255, 0.7); }

        .hsl__steps {
          list-style: none;
          margin: clamp(22px, 4vh, 36px) 0 0;
          padding: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          width: min(920px, 100%);
          animation: hslFadeUp 0.65s ease-out 0.08s both;
        }

        .hsl__step {
          position: relative;
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 0;
          text-align: center;
        }

        .hsl__connector {
          position: absolute;
          top: 25px;
          right: calc(50% + 30px);
          width: calc(100% - 60px);
          height: 2px;
          pointer-events: none;
          background-image: linear-gradient(
            90deg,
            rgba(25, 120, 186, 0.35) 0 45%,
            transparent 45% 100%
          );
          background-size: 10px 2px;
          background-repeat: repeat-x;
        }

        .hsl__step.is-done .hsl__connector,
        .hsl__step.is-active .hsl__connector {
          background-image: linear-gradient(
            90deg,
            var(--hsl-blue) 0 50%,
            transparent 50% 100%
          );
          animation: hslDash 0.9s linear infinite;
        }

        .hsl__step-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #fff;
          border: 2px solid rgba(25, 120, 186, 0.18);
          color: var(--hsl-blue);
          box-shadow: 0 8px 20px rgba(21, 44, 111, 0.08);
          transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s ease;
        }

        .hsl__step-icon .isax {
          font-size: 22px;
          line-height: 1;
        }

        .hsl__step.is-done .hsl__step-icon {
          background: linear-gradient(145deg, #1a86c8, #145a93);
          border-color: transparent;
          color: #fff;
        }

        .hsl__step.is-active .hsl__step-icon {
          background: linear-gradient(145deg, #1f93d6, #1569a8);
          border-color: transparent;
          color: #fff;
          transform: scale(1.06);
          animation: hslPulse 1.6s ease-in-out infinite;
        }

        .hsl__step-label {
          margin-top: 10px;
          max-width: 9.5rem;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.78);
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
          transition: color 0.3s ease;
        }

        .hsl__step.is-done .hsl__step-label,
        .hsl__step.is-active .hsl__step-label {
          color: #fff;
        }

        .hsl__spacer {
          flex: 1 1 auto;
          min-height: 80px;
          width: 100%;
        }

        .hsl__card {
          width: min(720px, 100%);
          background: var(--hsl-card);
          border-radius: 22px;
          padding: 18px 20px 0;
          box-shadow:
            0 18px 50px rgba(11, 31, 58, 0.22),
            0 2px 0 rgba(255, 255, 255, 0.4) inset;
          animation: hslCardIn 0.7s ease-out 0.15s both;
        }

        .hsl__card-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hsl__card-mark {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          object-fit: contain;
        }

        .hsl__card-copy {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: #3d5278;
          line-height: 1.35;
        }

        .hsl__card-copy strong {
          color: var(--hsl-navy);
          font-weight: 700;
        }

        .hsl__progress {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
          margin-bottom: 16px;
        }

        .hsl__progress-track {
          position: relative;
          flex: 1;
          height: 12px;
          border-radius: 999px;
          background: #e7eef6;
          overflow: hidden;
        }

        .hsl__progress-fill {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          transform-origin: left center;
          background: linear-gradient(90deg, #0a9a9b 0%, #1978ba 55%, #4eb7ef 100%);
          box-shadow: 0 0 16px rgba(25, 120, 186, 0.35);
          transition: transform 0.15s linear;
        }

        .hsl__progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: hslShimmer 1.6s ease-in-out infinite;
        }

        .hsl__progress-pct {
          min-width: 3.2rem;
          text-align: right;
          font-family: var(--hsl-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--hsl-blue);
        }

        .hsl__tip {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 -20px;
          padding: 14px 20px;
          border-radius: 0 0 22px 22px;
          background: linear-gradient(90deg, #e8f5fb 0%, #eef8fc 100%);
          animation: hslTipIn 0.45s ease-out both;
        }

        .hsl__tip-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: linear-gradient(145deg, #1f93d6, #1569a8);
          color: #fff;
        }

        .hsl__tip-icon .isax { font-size: 16px; }

        .hsl__tip-text {
          margin: 0;
          flex: 1;
          font-size: 13.5px;
          font-weight: 500;
          color: #3d5278;
          line-height: 1.35;
        }

        .hsl__tip-label {
          font-weight: 700;
          color: var(--hsl-navy);
        }

        .hsl__tip-decor {
          display: inline-flex;
          gap: 10px;
          color: var(--hsl-blue);
          opacity: 0.75;
          flex-shrink: 0;
        }

        .hsl__tip-decor .isax { font-size: 20px; }

        @keyframes hslKenBurns {
          from { transform: scale(1.02) translate3d(0, 0, 0); }
          to { transform: scale(1.1) translate3d(-1.5%, -1%, 0); }
        }

        @keyframes hslFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes hslCardIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes hslTipIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes hslPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(25, 120, 186, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(25, 120, 186, 0); }
        }

        @keyframes hslDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-3px); opacity: 1; }
        }

        @keyframes hslDash {
          to { background-position: 10px 0; }
        }

        @keyframes hslShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .hsl__steps {
            flex-wrap: wrap;
            row-gap: 14px;
            justify-content: center;
          }

          .hsl__step {
            flex: 0 0 30%;
          }

          .hsl__connector {
            display: none;
          }

          .hsl__step-label {
            font-size: 11.5px;
          }

          .hsl__tip-decor {
            display: none;
          }

          .hsl__card-copy {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .hsl__step {
            flex: 0 0 46%;
          }

          .hsl__step-icon {
            width: 46px;
            height: 46px;
          }

          .hsl__title {
            max-width: 16ch;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hsl__hero-img,
          .hsl__step.is-active .hsl__step-icon,
          .hsl__ellipsis i,
          .hsl__progress-fill::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HotelSearchLoader;
