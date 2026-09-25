import { getAppMode } from "@/lib/app-mode/get-app-mode"
import type { AppMode } from "@/lib/supabase/types/index"

import {
  APP_FEATURES,
  isFeatureEnabled,
  type AppFeature,
} from "./feature-registry"

export type FeatureConfig = {
  mode: AppMode
  petEnabled: boolean
  features: Record<AppFeature, boolean>
}

export async function getFeatureConfig(): Promise<FeatureConfig> {
  const mode = await getAppMode()

  const features = Object.values(APP_FEATURES).reduce(
    (config, feature) => {
      config[feature] = isFeatureEnabled(feature, mode)
      return config
    },
    {} as Record<AppFeature, boolean>,
  )

  return {
    mode,
    petEnabled: mode === "pet",
    features,
  }
}