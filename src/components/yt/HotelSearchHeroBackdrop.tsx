import "./HotelSearchHeroBackdrop.scss";

type Props = {
  active?: boolean;
  /** `hero` = full homepage header; `strip` = hotel grid search card */
  variant?: "hero" | "strip";
};

/**
 * Animated cruise + hotel hero layer for the homepage hotel tab.
 * Uses a generated still + CSS motion (performant vs heavy video).
 */
export default function HotelSearchHeroBackdrop({
  active = true,
  variant = "hero",
}: Props) {
  if (!active) return null;

  return (
    <div className={`yt-hotel-hero-bg yt-hotel-hero-bg--${variant}`} aria-hidden>
      <div
        className="yt-hotel-hero-bg__photo"
        style={{ backgroundImage: "url(/assets/img/yt/hotel-cruise-hero.jpg)" }}
      />
      <div className="yt-hotel-hero-bg__wash" />
      <svg className="yt-hotel-hero-bg__waves" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          className="yt-hotel-hero-bg__wave yt-hotel-hero-bg__wave--a"
          d="M0,64 C240,96 480,32 720,64 C960,96 1200,48 1440,72 L1440,120 L0,120 Z"
        />
        <path
          className="yt-hotel-hero-bg__wave yt-hotel-hero-bg__wave--b"
          d="M0,80 C360,48 720,104 1080,72 C1260,56 1380,88 1440,80 L1440,120 L0,120 Z"
        />
      </svg>
      <div className="yt-hotel-hero-bg__cruise">
        <span className="yt-hotel-hero-bg__ship" role="presentation">
          🚢
        </span>
      </div>
    </div>
  );
}
