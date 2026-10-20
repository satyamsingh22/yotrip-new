import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  // Only scan the admin panel — the storefront stays 100% Bootstrap.
  content: ["./src/feature-module/admin-panel/**/*.{ts,tsx}"],
  // Every Tailwind utility is emitted as `tw-…`. Bootstrap utilities (which are
  // global AND !important, e.g. `.p-3{padding:1rem!important}`) therefore can
  // never collide with admin classes, and admin classes never leak to the
  // storefront. This also lets un-migrated Bootstrap pages keep working while
  // the admin is migrated to Tailwind page by page.
  prefix: "tw-",
  // Tailwind's global reset would fight Bootstrap. Off — we add a small scoped
  // reset under `.admin-area` in admin-theme.css instead.
  corePlugins: { preflight: false },
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Deep navy rail surface
        rail: {
          DEFAULT: "hsl(var(--rail))",
          foreground: "hsl(var(--rail-foreground))",
          muted: "hsl(var(--rail-muted))",
          accent: "hsl(var(--rail-accent))",
        },
      },
      borderColor: { DEFAULT: "hsl(var(--border))" },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        card: "0 1px 3px rgb(16 24 40 / 0.06), 0 1px 2px -1px rgb(16 24 40 / 0.04)",
        lift: "0 12px 28px -8px rgb(16 24 40 / 0.18), 0 4px 10px -4px rgb(16 24 40 / 0.10)",
        rail: "8px 0 30px -12px rgb(8 15 40 / 0.45)",
        glow: "0 0 0 1px hsl(var(--ring) / 0.4), 0 8px 24px -6px hsl(var(--primary) / 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in .4s ease both",
        "scale-in": "scale-in .25s cubic-bezier(.16,1,.3,1) both",
        shimmer: "shimmer 1.6s infinite",
        "accordion-down": "accordion-down .2s ease-out",
        "accordion-up": "accordion-up .2s ease-out",
      },
      backgroundImage: {
        "rail-gradient":
          "linear-gradient(180deg, hsl(224 64% 18%) 0%, hsl(225 62% 13%) 55%, hsl(226 60% 10%) 100%)",
        "grid-faint":
          "linear-gradient(hsl(var(--border) / .6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / .6) 1px, transparent 1px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
