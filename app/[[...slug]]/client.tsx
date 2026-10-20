"use client"

import "@ant-design/v5-patch-for-react-19"
import dynamic from "next/dynamic"

// The whole React Router app runs client-side, exactly as it did under Vite.
const App = dynamic(() => import("../../src/App"), { ssr: false })

export function ClientOnly() {
  return <App />
}
