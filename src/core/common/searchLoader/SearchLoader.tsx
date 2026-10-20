import type { ReactNode } from "react";

type SearchLoaderProps = {
  children: ReactNode;
  /** Shown under the animation. Prefer this over text baked into Lottie. */
  title?: string;
  /** Tight crop for square Lotties that have lots of empty canvas. */
  crop?: "none" | "flight" | "car";
};

/**
 * Full-screen search overlay used by flight / car / hotel.
 * Brand logo + vertical animation as one compact composition.
 */
const SearchLoader = ({
  children,
  title,
  crop = "none",
}: SearchLoaderProps) => (
  <div
    className="yt-search-loader-overlay"
    role="status"
    aria-live="polite"
    aria-label={title ?? "Loading"}
  >
    <div className="yt-search-loader-glow" aria-hidden="true" />
    <div className="yt-search-loader">
      <img
        src="/assets/img/logo-dark.svg"
        alt="YoTrip"
        className="yt-search-loader__logo"
      />

      <div
        className={`yt-search-loader__stage yt-search-loader__stage--${crop}`}
      >
        {children}
      </div>

      {title ? (
        <p className="yt-search-loader__title">{title}</p>
      ) : null}

      <div className="yt-search-loader__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>

    <style>{`
      .yt-search-loader-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(ellipse 70% 55% at 50% 35%, rgba(10, 154, 155, 0.10), transparent 70%),
          radial-gradient(ellipse 60% 50% at 50% 70%, rgba(25, 120, 186, 0.08), transparent 65%),
          linear-gradient(180deg, #f4fafc 0%, #ffffff 45%, #eef6fa 100%);
      }

      .yt-search-loader-glow {
        position: absolute;
        width: min(420px, 80vw);
        height: min(420px, 80vw);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(20, 90, 147, 0.07), transparent 68%);
        pointer-events: none;
        animation: ytSearchGlow 3.2s ease-in-out infinite;
      }

      .yt-search-loader {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: min(340px, 88vw);
        padding: 28px 20px 24px;
        text-align: center;
      }

      .yt-search-loader__logo {
        height: 52px;
        width: auto;
        margin-bottom: 8px;
        filter: drop-shadow(0 6px 16px rgba(21, 44, 111, 0.12));
        animation: ytSearchLogoIn 0.55s ease-out both;
      }

      .yt-search-loader__stage {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        overflow: hidden;
        animation: ytSearchFloat 2.8s ease-in-out infinite;
      }

      /* Flight Lottie is 1080² with empty margins + baked-in title — crop to the plane. */
      .yt-search-loader__stage--flight {
        height: 168px;
        margin: 4px 0 2px;
      }
      .yt-search-loader__stage--flight > * {
        width: 260px !important;
        height: 260px !important;
        margin-top: -28px !important;
        margin-bottom: -64px !important;
        transform: scale(1.05);
      }

      /* Car Lottie is wide (1700×1000) — keep it compact. */
      .yt-search-loader__stage--car {
        height: 150px;
        margin: 8px 0 4px;
      }
      .yt-search-loader__stage--car > * {
        width: 280px !important;
        height: 165px !important;
      }

      .yt-search-loader__stage--none {
        margin: 8px 0;
      }

      .yt-search-loader__title {
        margin: 6px 0 0;
        font-size: 17px;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #152c6f;
        animation: ytSearchFade 0.7s ease-out 0.15s both;
      }

      .yt-search-loader__dots {
        display: flex;
        justify-content: center;
        gap: 7px;
        margin-top: 14px;
      }

      .yt-search-loader__dots span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #0a9a9b;
        animation: ytSearchDot 1.15s ease-in-out infinite;
      }

      .yt-search-loader__dots span:nth-child(2) {
        animation-delay: 0.14s;
        background: #1978ba;
      }

      .yt-search-loader__dots span:nth-child(3) {
        animation-delay: 0.28s;
        background: #153b7d;
      }

      @keyframes ytSearchLogoIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes ytSearchFade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes ytSearchFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }

      @keyframes ytSearchGlow {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
      }

      @keyframes ytSearchDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

export default SearchLoader;
