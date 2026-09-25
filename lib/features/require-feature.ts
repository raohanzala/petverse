import { redirect } from "next/navigation"

import { getFeatureConfig } from "./get-feature-config"
import type { AppFeature } from "./feature-registry"

export async function requireFeature(
  feature: AppFeature,
): Promise<void> {
  const { features } = await getFeatureConfig()

  if (!features[feature]) {
    redirect("/admin")
  }
}