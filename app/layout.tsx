import type { Metadata } from "next"
import Script from "next/script"

// Converted from the Vite index.html (same <head> links and body scripts).
export const metadata: Metadata = {
  title: "Yotrip",
  icons: {
    icon: "/Yotrip-logo-no-bg.svg",
    shortcut: "/Yotrip-logo-no-bg.svg",
    apple: [{ url: "/Yotrip-logo-no-bg.svg", sizes: "180x180" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* YoTrip homepage fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- same stylesheet link as index.html */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Kalam:wght@700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-css-tags -- served as-is from /public (see src/App.tsx) */}
        <link rel="stylesheet" href="/assets/css/iconsax.css" />
      </head>
      <body>
        <div id="root">{children}</div>
        {/* YoTrip AI assistant (Relay chat widget). The stub queues Relay(...) calls
            until widget.js loads. Wired up in src/utils/relayChat.ts. */}
        <Script id="relay-stub" strategy="beforeInteractive">
          {`window.Relay = window.Relay || function (command, argument) {
  (window.Relay.q = window.Relay.q || []).push([command, argument]);
};`}
        </Script>
        <Script
          src="https://relay-widget.useoneos.com/widget.js"
          data-site-id={process.env.NEXT_PUBLIC_RELAY_SITE_ID || "site_PIVvMGv0TJ3Sjh1Icr4ObLGX"}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
