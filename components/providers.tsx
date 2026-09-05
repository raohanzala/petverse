"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "./ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  )
}
