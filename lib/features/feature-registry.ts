import { APP_MODES, type AppMode } from "@/lib/supabase/types/index"

export const APP_FEATURES = {
  PETS: "pets",
  BOARDING: "boarding",
  DAYCARE: "daycare",
  VACCINATIONS: "vaccinations",
  PET_PASSPORT: "pet-passport",
  PET_UPDATES: "pet-updates",
  PET_PHOTOS: "pet-photos",
  PET_NOTES: "pet-notes",
} as const

export type AppFeature =
  (typeof APP_FEATURES)[keyof typeof APP_FEATURES]

export const PET_FEATURES: readonly AppFeature[] = [
  APP_FEATURES.PETS,
  APP_FEATURES.BOARDING,
  APP_FEATURES.DAYCARE,
  APP_FEATURES.VACCINATIONS,
  APP_FEATURES.PET_PASSPORT,
  APP_FEATURES.PET_UPDATES,
  APP_FEATURES.PET_PHOTOS,
  APP_FEATURES.PET_NOTES,
]

export function isFeatureEnabled(
  feature: AppFeature,
  mode: AppMode,
): boolean {
  if (mode === APP_MODES.PET) {
    return true
  }

  return !PET_FEATURES.includes(feature)
}