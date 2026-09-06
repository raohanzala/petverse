export const ADMIN_THEME_STORAGE_KEY = "petverse-admin-theme"

export const ADMIN_THEMES = [
  {
    id: "petcare",
    label: "PetCare Classic",
    description: "Ink navy & amber gold",
    swatches: ["#06152a", "#c9974c", "#fafafc"],
  },
  {
    id: "professional-blue",
    label: "Professional Blue",
    description: "Enterprise slate & blue",
    swatches: ["#2563eb", "#0f172a", "#f8fafc"],
  },
] as const

export type AdminThemeId = (typeof ADMIN_THEMES)[number]["id"]

export const DEFAULT_ADMIN_THEME: AdminThemeId = "petcare"

export function isAdminThemeId(value: unknown): value is AdminThemeId {
  return ADMIN_THEMES.some((theme) => theme.id === value)
}
