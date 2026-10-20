import { ClientOnly } from "./client"

// Optional catch-all: every URL renders the SPA and React Router (src/feature-module/router)
// resolves the route — same URLs as the Vite build.
export default function Page() {
  return <ClientOnly />
}
