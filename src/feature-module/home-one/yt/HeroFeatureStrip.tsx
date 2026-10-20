import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A5CF5" strokeWidth="2.8" strokeLinecap="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.6-4.6" />
  </svg>
);
const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#7B4DFF" aria-hidden>
    <path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.5z" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 2 4 5v6.5c0 5 3.4 9 8 10.5 4.6-1.5 8-5.5 8-10.5V5z" fill="#14A89A" />
    <path d="m8.5 12 2.4 2.4L15.8 9.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const HeadsetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22A06B" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="13" width="4" height="6" rx="1.6" fill="#22A06B" />
    <rect x="17" y="13" width="4" height="6" rx="1.6" fill="#22A06B" />
    <path d="M19 19c0 1.5-1.8 2.5-5 2.5" />
  </svg>
);

const ITEMS: { icon: ReactNode; tone: string; titleKey: string; bodyKey: string }[] = [
  { icon: <SearchIcon />, tone: "blue", titleKey: "homeHero.bestPrices", bodyKey: "homeHero.bestPricesSub" },
  { icon: <BoltIcon />, tone: "purple", titleKey: "homeHero.aiPlanner", bodyKey: "homeHero.aiPlannerSub" },
  { icon: <ShieldIcon />, tone: "teal", titleKey: "homeHero.halal", bodyKey: "homeHero.halalSub" },
  { icon: <HeadsetIcon />, tone: "green", titleKey: "homeHero.support", bodyKey: "homeHero.supportSub" },
];

export default function HeroFeatureStrip() {
  const { t } = useTranslation();
  return (
    <div className="hero-feature-strip">
      {ITEMS.map(({ icon, tone, titleKey, bodyKey }) => (
        <div key={titleKey} className="hero-feature-strip__item">
          <span className={`hero-feature-strip__icon hero-feature-strip__icon--${tone}`} aria-hidden>
            {icon}
          </span>
          <div>
            <strong>{t(titleKey)}</strong>
            <p>{t(bodyKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
