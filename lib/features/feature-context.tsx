"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import type { FeatureConfig } from "./get-feature-config"
import type { AppFeature } from "./feature-registry"

const FeatureContext = createContext<FeatureConfig | null>(null)

type FeatureProviderProps = {
  children: ReactNode
  config: FeatureConfig
}

export function FeatureProvider({
  children,
  config,
}: FeatureProviderProps) {
  return (
    <FeatureContext.Provider value={config}>
      {children}
    </FeatureContext.Provider>
  )
}

export function useFeatures() {
  const context = useContext(FeatureContext)

  if (!context) {
    throw new Error(
      "useFeatures must be used inside FeatureProvider",
    )
  }

  return context
}

export function useFeature(feature: AppFeature) {
  const { features } = useFeatures()

  return features[feature]
}