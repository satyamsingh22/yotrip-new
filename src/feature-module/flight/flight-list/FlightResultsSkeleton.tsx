type FlightResultsSkeletonProps = {
  /** Placeholder cards to render. Roughly a viewport's worth by default. */
  rows?: number;
};

/**
 * In-flow placeholder for the results column while a re-search is running.
 * Unlike SearchLoader this never covers the page, so the search bar, filters
 * and scroll position survive the search.
 */
const FlightResultsSkeleton = ({ rows = 5 }: FlightResultsSkeletonProps) => (
  <div
    className="yt-flight-skeleton"
    role="status"
    aria-live="polite"
    aria-label="Searching flights"
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div className="yt-flight-skeleton__card" key={i}>
        <div className="yt-flight-skeleton__head">
          <span className="yt-flight-skeleton__dot" />
          <span className="yt-flight-skeleton__bar yt-flight-skeleton__bar--sm" />
        </div>
        <div className="yt-flight-skeleton__body">
          <span className="yt-flight-skeleton__bar yt-flight-skeleton__bar--md" />
          <span className="yt-flight-skeleton__bar yt-flight-skeleton__bar--lg" />
          <span className="yt-flight-skeleton__bar yt-flight-skeleton__bar--md" />
        </div>
        <div className="yt-flight-skeleton__foot">
          <span className="yt-flight-skeleton__bar yt-flight-skeleton__bar--sm" />
          <span className="yt-flight-skeleton__pill" />
        </div>
      </div>
    ))}

    <style>{`
      .yt-flight-skeleton__card {
        border: 1px solid #eef1f5;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
        background: #fff;
      }
      .yt-flight-skeleton__head,
      .yt-flight-skeleton__foot {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .yt-flight-skeleton__head { margin-bottom: 18px; }
      .yt-flight-skeleton__foot {
        margin-top: 18px;
        justify-content: space-between;
      }
      .yt-flight-skeleton__body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .yt-flight-skeleton__dot,
      .yt-flight-skeleton__bar,
      .yt-flight-skeleton__pill {
        display: block;
        background: linear-gradient(90deg, #eef1f5 25%, #f7f9fb 37%, #eef1f5 63%);
        background-size: 400% 100%;
        animation: ytFlightSkeleton 1.4s ease infinite;
        border-radius: 6px;
      }
      .yt-flight-skeleton__dot {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex: none;
      }
      .yt-flight-skeleton__bar { height: 12px; }
      .yt-flight-skeleton__bar--sm { width: 96px; }
      .yt-flight-skeleton__bar--md { width: 128px; }
      .yt-flight-skeleton__bar--lg { width: 180px; }
      .yt-flight-skeleton__pill {
        width: 120px;
        height: 38px;
        border-radius: 999px;
        flex: none;
      }

      @keyframes ytFlightSkeleton {
        0% { background-position: 100% 50%; }
        100% { background-position: 0 50%; }
      }

      @media (prefers-reduced-motion: reduce) {
        .yt-flight-skeleton__dot,
        .yt-flight-skeleton__bar,
        .yt-flight-skeleton__pill { animation: none; }
      }
    `}</style>
  </div>
);

export default FlightResultsSkeleton;
