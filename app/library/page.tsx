import type { Metadata } from "next"

import { LibraryShowcase } from "@/components/library/library-showcase"

export const metadata: Metadata = {
  title: "Component Library | PetCare",
  description:
    "Live catalog of PetCare UI primitives and shared components with usage examples.",
}

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-cream">
      <LibraryShowcase />
    </main>
  )
}
