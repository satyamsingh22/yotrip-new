import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const STEP_DEFS = [
  { icon: "isax-search-status", labelKey: "carList.step1" },
  { icon: "isax-tag", labelKey: "carList.step2" },
  { icon: "isax-car5", labelKey: "carList.step3" },
  { icon: "isax-percentage-circle", labelKey: "carList.step4" },
  { icon: "isax-tick-circle5", labelKey: "carList.step5" },
] as const;

const TIP_KEYS = [
  "carList.tip1",
  "carList.tip2",
  "carList.tip3",
  "carList.tip4",
] as const;

const FLOAT_ICONS = [
  "isax-car",
  "isax-gas-station",
  "isax-location",
  "isax-map-1",
  "isax-shield-tick",
  "isax-driving",
] as const;

const STEP_MS = 2000;
const TIP_MS = 4000;

type CarSearchLoaderProps = {
  /** Covers the listing body only so the breadcrumb hero stays visible. */
  scoped?: boolean;
};

/**
 * Full-screen car search loading experience.
 * Fake progress eases toward ~96% while the real search runs; unmount ends it.
 */
const CarSearchLoader = ({ scoped = false }: CarSearchLoaderProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [pctBump, setPctBump] = useState(false);

  const steps = useMemo(
    () =>
      STEP_DEFS.map((step) => ({
        icon: step.icon,
        label: t(step.labelKey),
        labelKey: step.labelKey,
      })),
    [t],
  );
  const tips = useMemo(() => TIP_KEYS.map((key) => t(key)), [t]);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 7) % 88)}%`,
        delay: `${(i % 7) * 0.45}s`,
        duration: `${7 + (i % 5) * 1.2}s`,
        size: 4 + (i % 4) * 2,
        drift: `${-18 + (i % 6) * 8}px`,
      })),
    [],
  );

  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    let lastPct = 4;

    const tick = (now: number) => {
      const elapsed = (now - started) / 1000;
      const next = Math.min(96, 4 + 92 * (1 - Math.exp(-elapsed / 5.5)));
      const rounded = Math.round(next);
      if (rounded !== lastPct) {
        lastPct = rounded;
        setPctBump(true);
        window.setTimeout(() => setPctBump(false), 180);
      }
      setProgress(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, STEP_DEFS.length - 1));
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIP_KEYS.length);
    }, TIP_MS);
    return () => window.clearInterval(id);
  }, []);

  const percent = Math.round(progress);
  const loaderTitle = t("carList.loaderTitle");

  return (
    <div
      className={`csl${scoped ? " csl--scoped" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={loaderTitle}
    >
      <div className="csl__hero" aria-hidden="true">
        <div
          className="csl__hero-img"
          style={{
            backgroundImage:
              "url(/assets/img/cars/car-search-loader-hero.jpg)",
          }}
        />
        <div className="csl__hero-scrim" />
        <div className="csl__scan" />
        <div className="csl__glow csl__glow--a" />
        <div className="csl__glow csl__glow--b" />
        <div className="csl__dots csl__dots--tl" />
        <div className="csl__dots csl__dots--br" />
        <div className="csl__particles">
          {particles.map((p) => (
            <span
              key={p.id}
              className="csl__particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
                ["--csl-drift" as string]: p.drift,
              }}
            />
          ))}
        </div>
        <div className="csl__floaters">
          {FLOAT_ICONS.map((icon, i) => (
            <span
              key={icon}
              className={`csl__floater csl__floater--${i + 1}`}
              style={{ animationDelay: `${i * 0.55}s` }}
            >
              <i className={`isax ${icon}`} />
            </span>
          ))}
        </div>
        <div className="csl__wave" />
      </div>

      <div className="csl__content">
        <header className="csl__header">
          <div className="csl__logo-wrap">
            <span className="csl__logo-ring" />
            <img
              src="/assets/img/logo-dark.svg"
              alt="YoTrip"
              className="csl__logo"
            />
          </div>
          <h1 className="csl__title">
            <span className="csl__title-text">{loaderTitle}</span>
            <span className="csl__ellipsis" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </h1>
          <p className="csl__subtitle" key={activeStep}>
            {steps[activeStep].label}…
          </p>
        </header>

        <ol className="csl__steps">
          {steps.map((step, index) => {
            const done = index < activeStep;
            const current = index === activeStep;
            return (
              <li
                key={step.labelKey}
                className={[
                  "csl__step",
                  done ? "is-done" : "",
                  current ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
              >
                {index > 0 ? (
                  <span className="csl__connector" aria-hidden="true">
                    <span className="csl__connector-flow" />
                  </span>
                ) : null}
                <span className="csl__step-icon" aria-hidden="true">
                  <span className="csl__step-ripple" />
                  <span className="csl__step-ripple csl__step-ripple--delay" />
                  <i className={`isax ${step.icon}`} />
                </span>
                <span className="csl__step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="csl__spacer" aria-hidden="true" />

        <section className="csl__card">
          <div className="csl__card-shine" aria-hidden="true" />
          <div className="csl__card-row">
            <span className="csl__card-mark-wrap">
              <img
                src="/Yotrip-logo-no-bg.svg"
                alt=""
                className="csl__card-mark"
                aria-hidden="true"
              />
            </span>
            <p className="csl__card-copy">
              Please wait while we search hundreds of{" "}
              <strong className="csl__highlight">cars</strong> for you.
            </p>
          </div>

          <div className="csl__progress">
            <div
              className="csl__progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="csl__progress-fill"
                style={{ transform: `scaleX(${Math.round(progress) / 100})` }}
              />
            </div>
            <span
              className={`csl__progress-pct${pctBump ? " is-bump" : ""}`}
            >
              {percent}%
            </span>
          </div>

          <div className="csl__tip" key={tipIndex}>
            <span className="csl__tip-icon" aria-hidden="true">
              <i className="isax isax-lamp-on5" />
            </span>
            <p className="csl__tip-text">
              <span className="csl__tip-label">{t("carList.tip")}</span>{" "}
              {tips[tipIndex]}
            </p>
            <span className="csl__tip-decor" aria-hidden="true">
              <i className="isax isax-car5" />
              <i className="isax isax-shield-tick" />
            </span>
          </div>
        </section>
      </div>

      <style>{`
        .csl--scoped {
          position: absolute;
          inset: 0;
          z-index: 40;
          min-height: 420px;
          border-radius: 0 0 16px 16px;
        }

        .csl {
          --csl-navy: #152c6f;
          --csl-blue: #1978ba;
          --csl-teal: #0a9a9b;
          --csl-card: #ffffff;
          --csl-display: "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif;
          --csl-body: "Plus Jakarta Sans", "IBM Plex Sans", sans-serif;

          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;
          background: #0b1f3a;
          color: var(--csl-navy);
          font-family: var(--csl-body);
        }

        .csl__hero {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .csl__hero-img {
          position: absolute;
          inset: -6%;
          background-size: cover;
          background-position: center 55%;
          background-repeat: no-repeat;
          transform-origin: 40% 55%;
          animation: cslKenBurns 14s ease-in-out infinite alternate;
          filter: saturate(1.06) contrast(1.02);
        }

        .csl__hero-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(236, 246, 252, 0.96) 0%, rgba(236, 246, 252, 0.72) 16%, rgba(236, 246, 252, 0.12) 40%, rgba(11, 31, 58, 0.12) 68%, rgba(11, 31, 58, 0.45) 100%),
            radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255, 255, 255, 0.78), transparent 70%);
        }

        .csl__scan {
          position: absolute;
          left: -10%;
          right: -10%;
          height: 28%;
          top: 30%;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 40%,
            rgba(78, 183, 239, 0.18) 50%,
            rgba(255, 255, 255, 0.08) 60%,
            transparent 100%
          );
          mix-blend-mode: soft-light;
          animation: cslScan 4.8s ease-in-out infinite;
          pointer-events: none;
        }

        .csl__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          opacity: 0.5;
        }

        .csl__glow--a {
          width: min(340px, 50vw);
          height: min(340px, 50vw);
          left: 6%;
          top: 34%;
          background: rgba(10, 154, 155, 0.26);
          animation: cslGlowDrift 7s ease-in-out infinite alternate;
        }

        .csl__glow--b {
          width: min(300px, 45vw);
          height: min(300px, 45vw);
          right: 4%;
          top: 40%;
          background: rgba(25, 120, 186, 0.28);
          animation: cslGlowDrift 8.5s ease-in-out infinite alternate-reverse;
        }

        .csl__dots {
          position: absolute;
          width: 72px;
          height: 72px;
          opacity: 0.35;
          background-image: radial-gradient(#1978ba 1.4px, transparent 1.4px);
          background-size: 12px 12px;
          pointer-events: none;
          animation: cslDotsPulse 3.2s ease-in-out infinite;
        }

        .csl__dots--tl { top: 18px; left: 18px; }
        .csl__dots--br { right: 22px; bottom: 120px; animation-delay: 0.8s; }

        .csl__particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .csl__particle {
          position: absolute;
          bottom: -12px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, rgba(78, 183, 239, 0.85) 55%, transparent 70%);
          opacity: 0;
          animation-name: cslFloatUp;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .csl__floaters {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .csl__floater {
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.84);
          color: var(--csl-blue);
          box-shadow: 0 10px 24px rgba(11, 31, 58, 0.16);
          backdrop-filter: blur(4px);
          animation: cslFloater 9s ease-in-out infinite;
        }

        .csl__floater .isax { font-size: 18px; }

        .csl__floater--1 { left: 8%; top: 48%; }
        .csl__floater--2 { left: 18%; top: 62%; animation-duration: 10.5s; }
        .csl__floater--3 { right: 14%; top: 46%; animation-duration: 8.5s; }
        .csl__floater--4 { right: 8%; top: 64%; animation-duration: 11s; }
        .csl__floater--5 { left: 28%; top: 72%; animation-duration: 9.8s; }
        .csl__floater--6 { right: 24%; top: 74%; animation-duration: 10.2s; }

        .csl__wave {
          position: absolute;
          left: -5%;
          right: -5%;
          bottom: -2px;
          height: 56px;
          background:
            radial-gradient(120% 90% at 10% 100%, #1978ba 0 42%, transparent 43%),
            radial-gradient(120% 90% at 40% 100%, #0a9a9b 0 40%, transparent 41%),
            radial-gradient(120% 90% at 70% 100%, #1978ba 0 42%, transparent 43%),
            radial-gradient(120% 90% at 95% 100%, #145a93 0 40%, transparent 41%);
          opacity: 0.55;
          animation: cslWave 5s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .csl__content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: clamp(20px, 4vh, 40px) clamp(16px, 4vw, 40px) clamp(16px, 3vh, 28px);
        }

        .csl__header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: cslFadeUp 0.55s ease-out both;
        }

        .csl__logo-wrap {
          position: relative;
          margin-bottom: 14px;
          display: grid;
          place-items: center;
        }

        .csl__logo-ring {
          position: absolute;
          width: 92px;
          height: 92px;
          border-radius: 50%;
          border: 2px solid rgba(25, 120, 186, 0.22);
          animation: cslLogoRing 2.4s ease-out infinite;
        }

        .csl__logo {
          position: relative;
          height: clamp(48px, 7vw, 64px);
          width: auto;
          filter: drop-shadow(0 8px 18px rgba(21, 44, 111, 0.14));
          animation: cslLogoFloat 2.8s ease-in-out infinite;
        }

        .csl__title {
          margin: 0;
          max-width: 20ch;
          font-family: var(--csl-display);
          font-size: clamp(1.45rem, 3.4vw, 2.15rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
          display: inline-flex;
          align-items: baseline;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2px;
        }

        .csl__title-text {
          color: #fff;
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          animation: none;
        }

        .csl__subtitle {
          margin: 10px 0 0;
          min-height: 1.2em;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
          animation: cslSubtitleIn 0.4s ease-out both;
        }

        .csl__ellipsis {
          display: inline-flex;
          gap: 4px;
          margin-left: 4px;
          vertical-align: middle;
        }

        .csl__ellipsis i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          animation: cslDot 1.2s ease-in-out infinite;
        }

        .csl__ellipsis i:nth-child(2) { animation-delay: 0.15s; background: #b8ecff; }
        .csl__ellipsis i:nth-child(3) { animation-delay: 0.3s; background: rgba(255, 255, 255, 0.7); }

        .csl__steps {
          list-style: none;
          margin: clamp(18px, 3.5vh, 32px) 0 0;
          padding: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          width: min(920px, 100%);
        }

        .csl__step {
          position: relative;
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 0;
          text-align: center;
          opacity: 0;
          animation: cslStepIn 0.55s ease-out both;
        }

        .csl__connector {
          position: absolute;
          top: 25px;
          right: calc(50% + 30px);
          width: calc(100% - 60px);
          height: 2px;
          pointer-events: none;
          overflow: hidden;
          background-image: linear-gradient(
            90deg,
            rgba(25, 120, 186, 0.28) 0 45%,
            transparent 45% 100%
          );
          background-size: 10px 2px;
          background-repeat: repeat-x;
        }

        .csl__connector-flow {
          position: absolute;
          inset: 0;
          width: 28%;
          background: linear-gradient(90deg, transparent, #4eb7ef, transparent);
          opacity: 0;
          transform: translateX(-120%);
        }

        .csl__step.is-done .csl__connector,
        .csl__step.is-active .csl__connector {
          background-image: linear-gradient(
            90deg,
            var(--csl-blue) 0 50%,
            transparent 50% 100%
          );
        }

        .csl__step.is-done .csl__connector-flow,
        .csl__step.is-active .csl__connector-flow {
          opacity: 1;
          animation: cslConnectorFlow 1.35s linear infinite;
        }

        .csl__step-icon {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #fff;
          border: 2px solid rgba(25, 120, 186, 0.18);
          color: var(--csl-blue);
          box-shadow: 0 8px 20px rgba(21, 44, 111, 0.08);
          transition: background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s ease;
        }

        .csl__step-icon .isax {
          position: relative;
          z-index: 1;
          font-size: 22px;
          line-height: 1;
        }

        .csl__step-ripple {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid rgba(25, 120, 186, 0.45);
          opacity: 0;
          transform: scale(0.85);
        }

        .csl__step.is-done .csl__step-icon {
          background: linear-gradient(145deg, #1a86c8, #145a93);
          border-color: transparent;
          color: #fff;
          animation: cslStepPop 0.45s cubic-bezier(0.34, 1.45, 0.64, 1) both;
        }

        .csl__step.is-active .csl__step-icon {
          background: linear-gradient(145deg, #1f93d6, #1569a8);
          border-color: transparent;
          color: #fff;
          transform: scale(1.08);
          animation: cslActiveBob 1.5s ease-in-out infinite;
        }

        .csl__step.is-active .csl__step-icon .isax {
          animation: cslIconWiggle 1.8s ease-in-out infinite;
        }

        .csl__step.is-active .csl__step-ripple {
          animation: cslRipple 1.8s ease-out infinite;
        }

        .csl__step.is-active .csl__step-ripple--delay {
          animation-delay: 0.55s;
        }

        .csl__step-label {
          margin-top: 10px;
          max-width: 9.5rem;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.78);
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .csl__step.is-done .csl__step-label,
        .csl__step.is-active .csl__step-label {
          color: #fff;
        }

        .csl__step.is-active .csl__step-label {
          transform: translateY(-1px);
          animation: cslLabelPulse 1.5s ease-in-out infinite;
        }

        .csl__spacer {
          flex: 1 1 auto;
          min-height: 80px;
          width: 100%;
        }

        .csl__card {
          position: relative;
          width: min(720px, 100%);
          background: var(--csl-card);
          border-radius: 22px;
          padding: 18px 20px 0;
          overflow: hidden;
          box-shadow:
            0 18px 50px rgba(11, 31, 58, 0.22),
            0 2px 0 rgba(255, 255, 255, 0.4) inset;
          animation:
            cslCardIn 0.7s ease-out 0.15s both,
            cslCardFloat 4.5s ease-in-out 0.9s infinite;
        }

        .csl__card-shine {
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.55),
            transparent
          );
          transform: skewX(-18deg);
          animation: cslCardShine 3.8s ease-in-out infinite;
          pointer-events: none;
        }

        .csl__card-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .csl__card-mark-wrap {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: #eef7fb;
          animation: cslMarkPulseRing 2.2s ease-in-out infinite;
        }

        .csl__card-mark {
          width: 28px;
          height: 28px;
          object-fit: contain;
          animation: cslMarkPulse 2s ease-in-out infinite;
        }

        .csl__card-copy {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: #3d5278;
          line-height: 1.35;
        }

        .csl__highlight {
          font-weight: 700;
          background: linear-gradient(90deg, #152c6f, #1978ba, #0a9a9b, #152c6f);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: cslTitleShine 2.8s linear infinite;
        }

        .csl__progress {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
          margin-bottom: 16px;
        }

        .csl__progress-track {
          position: relative;
          flex: 1;
          height: 12px;
          border-radius: 999px;
          background: #e7eef6;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(21, 44, 111, 0.08);
        }

        .csl__progress-fill {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          transform-origin: left center;
          background: linear-gradient(90deg, #0a9a9b 0%, #1978ba 55%, #4eb7ef 100%);
          box-shadow: 0 0 16px rgba(25, 120, 186, 0.35);
          transition: transform 0.15s linear;
        }

        .csl__progress-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: cslShimmer 1.4s ease-in-out infinite;
        }

        .csl__progress-pct {
          min-width: 3.2rem;
          text-align: right;
          font-family: var(--csl-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--csl-blue);
          transition: transform 0.18s ease;
        }

        .csl__progress-pct.is-bump {
          transform: scale(1.14);
          color: var(--csl-teal);
        }

        .csl__tip {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 -20px;
          padding: 14px 20px;
          border-radius: 0 0 22px 22px;
          background: linear-gradient(90deg, #e8f5fb 0%, #eef8fc 100%);
          animation: cslTipSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .csl__tip-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: linear-gradient(145deg, #1f93d6, #1569a8);
          color: #fff;
          animation: cslTipGlow 1.6s ease-in-out infinite;
        }

        .csl__tip-icon .isax {
          font-size: 16px;
          animation: cslIconWiggle 2s ease-in-out infinite;
        }

        .csl__tip-text {
          margin: 0;
          flex: 1;
          font-size: 13.5px;
          font-weight: 500;
          color: #3d5278;
          line-height: 1.35;
        }

        .csl__tip-label {
          font-weight: 700;
          color: var(--csl-navy);
        }

        .csl__tip-decor {
          display: inline-flex;
          gap: 10px;
          color: var(--csl-blue);
          opacity: 0.85;
          flex-shrink: 0;
        }

        .csl__tip-decor .isax {
          font-size: 20px;
          animation: cslDecorBob 2.2s ease-in-out infinite;
        }

        .csl__tip-decor .isax:last-child {
          animation-delay: 0.35s;
        }

        @keyframes cslKenBurns {
          from { transform: scale(1.03) translate3d(0, 0, 0); }
          to { transform: scale(1.14) translate3d(-2%, -1.2%, 0); }
        }

        @keyframes cslScan {
          0% { transform: translateY(-40%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.7; }
          100% { transform: translateY(180%); opacity: 0; }
        }

        @keyframes cslGlowDrift {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(24px, -18px, 0) scale(1.12); }
        }

        @keyframes cslDotsPulse {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.04); }
        }

        @keyframes cslFloatUp {
          0% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0; }
          15% { opacity: 0.85; }
          100% {
            transform: translate3d(var(--csl-drift, 0px), -105vh, 0) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes cslFloater {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-4deg); }
          50% { transform: translate3d(10px, -18px, 0) rotate(5deg); }
        }

        @keyframes cslWave {
          from { transform: translateX(-1.5%) scaleY(1); }
          to { transform: translateX(1.5%) scaleY(1.08); }
        }

        @keyframes cslFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cslLogoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes cslLogoRing {
          0% { transform: scale(0.72); opacity: 0.7; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes cslTitleShine {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes cslSubtitleIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cslStepIn {
          from { opacity: 0; transform: translateY(14px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes cslStepPop {
          0% { transform: scale(0.86); }
          60% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        @keyframes cslActiveBob {
          0%, 100% {
            transform: scale(1.08) translateY(0);
            box-shadow: 0 0 0 0 rgba(25, 120, 186, 0.35);
          }
          50% {
            transform: scale(1.12) translateY(-3px);
            box-shadow: 0 0 0 12px rgba(25, 120, 186, 0);
          }
        }

        @keyframes cslIconWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.05); }
          75% { transform: rotate(8deg) scale(1.05); }
        }

        @keyframes cslRipple {
          0% { transform: scale(0.9); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        @keyframes cslLabelPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        @keyframes cslConnectorFlow {
          from { transform: translateX(-120%); }
          to { transform: translateX(320%); }
        }

        @keyframes cslCardIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cslCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes cslCardShine {
          0%, 55% { left: -40%; opacity: 0; }
          70% { opacity: 0.8; }
          100% { left: 120%; opacity: 0; }
        }

        @keyframes cslMarkPulseRing {
          from { box-shadow: 0 0 0 0 rgba(25, 120, 186, 0.28); }
          50% { box-shadow: 0 0 0 8px rgba(25, 120, 186, 0); }
          to { box-shadow: 0 0 0 0 rgba(25, 120, 186, 0); }
        }

        @keyframes cslMarkPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes cslBarShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        @keyframes cslHeadPulse {
          0%, 100% { transform: translate(35%, -50%) scale(1); }
          50% { transform: translate(35%, -50%) scale(1.2); }
        }

        @keyframes cslTipSlide {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes cslTipGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(25, 120, 186, 0.35); }
          50% { box-shadow: 0 0 0 8px rgba(25, 120, 186, 0); }
        }

        @keyframes cslDecorBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes cslDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-3px); opacity: 1; }
        }

        @keyframes cslShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .csl__steps {
            flex-wrap: wrap;
            row-gap: 14px;
            justify-content: center;
          }

          .csl__step { flex: 0 0 30%; }
          .csl__connector { display: none; }
          .csl__step-label { font-size: 11.5px; }
          .csl__tip-decor { display: none; }
          .csl__card-copy { font-size: 14px; }
          .csl__floater--5,
          .csl__floater--6 { display: none; }
        }

        @media (max-width: 480px) {
          .csl__step { flex: 0 0 46%; }
          .csl__step-icon { width: 46px; height: 46px; }
          .csl__title { max-width: 16ch; }
          .csl__floater { width: 34px; height: 34px; }
          .csl__floater .isax { font-size: 15px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .csl__hero-img,
          .csl__scan,
          .csl__glow,
          .csl__dots,
          .csl__particle,
          .csl__floater,
          .csl__wave,
          .csl__logo,
          .csl__logo-ring,
          .csl__title-text,
          .csl__highlight,
          .csl__step,
          .csl__step.is-active .csl__step-icon,
          .csl__step.is-active .csl__step-icon .isax,
          .csl__step-ripple,
          .csl__connector-flow,
          .csl__ellipsis i,
          .csl__progress-fill::after,
          .csl__card,
          .csl__card-shine,
          .csl__card-mark-wrap,
          .csl__card-mark,
          .csl__tip-icon,
          .csl__tip-icon .isax,
          .csl__tip-decor .isax {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CarSearchLoader;
