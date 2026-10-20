/* Clean line icons for the YoTrip homepage — no emojis. */
type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Mosque = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 2c1.8 1.6 3 3.1 3 4.6S13.6 9 12 9 9 8.1 9 6.6 10.2 3.6 12 2Z" />
    <path d="M4 21v-6.5a8 8 0 0 1 16 0V21" />
    <path d="M3 21h18" />
    <path d="M9.5 21v-3.5a2.5 2.5 0 0 1 5 0V21" />
    <path d="M4 12.5V21M20 12.5V21" />
  </svg>
);

export const Sparkle = ({ size = 26, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7z" />
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
  </svg>
);

export const Crystal = ({ size = 26, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="9.5" r="6" />
    <path d="M9.5 8.2A2.6 2.6 0 0 1 12 6.4" />
    <path d="M7.5 15.5 6.5 20M16.5 15.5 17.5 20" />
    <path d="M5.5 21h13" />
  </svg>
);

export const Chat = ({ size = 26, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M21 11.4a8.4 8.4 0 0 1-11.8 7.7L3.5 20.5l1.4-4.7A8.4 8.4 0 1 1 21 11.4Z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
  </svg>
);

export const Moon = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M21 12.9A8.5 8.5 0 1 1 11.1 3a6.6 6.6 0 0 0 9.9 9.9Z" />
  </svg>
);

export const Sun = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4 4.2 19.8M19.8 4.2l-1.4 1.4" />
  </svg>
);

export const Sunset = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="13.5" r="3.4" />
    <path d="M12 3.5v3M5.5 9 7 10.4M18.5 9 17 10.4M3 17.5h18M6.5 20.5h11" />
  </svg>
);

export const Compass = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" />
  </svg>
);
