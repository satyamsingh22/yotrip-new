import { writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

import { PHASE_PRODUCTION_BUILD } from "next/constants.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Mirrors vite.config.ts:
 * - __BUILD_ID__ baked into the bundle + /version.json shipped with each build,
 *   so an open tab can detect a newer deploy (src/utils/versionCheck.ts).
 * - `moment` alias.
 * The "@" path alias comes from tsconfig.json paths.
 */
export default function nextConfig(phase) {
  const buildId = phase === PHASE_PRODUCTION_BUILD
    ? String(process.env.YOTRIP_BUILD_ID || Date.now())
    : ""
  if (buildId) writeFileSync(path.join(__dirname, "public/version.json"), JSON.stringify({ buildId }))

  /** @type {import('next').NextConfig} */
  return {
    compiler: {
      define: { __BUILD_ID__: buildId },
    },
    turbopack: {
      root: __dirname,
      resolveAlias: { moment: "moment/moment.js" },
    },
    // The SPA uses plain <img> tags and external image hosts; no Next image optimisation.
    images: { unoptimized: true },
    // `vite build` never type-checked either (the old build script was just `vite build`).
    typescript: { ignoreBuildErrors: true },
  }
}
