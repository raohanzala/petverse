"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  ADMIN_THEMES,
  ADMIN_THEME_STORAGE_KEY,
  DEFAULT_ADMIN_THEME,
  isAdminThemeId,
  type AdminThemeId,
} from "@/lib/constants/admin-themes"

type AdminThemeContextValue = {
  theme: AdminThemeId
  setTheme: (theme: AdminThemeId) => void
  themes: typeof ADMIN_THEMES
  mounted: boolean
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)

function readStoredTheme(): AdminThemeId {
  if (typeof window === "undefined") return DEFAULT_ADMIN_THEME
  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    if (isAdminThemeId(stored)) return stored
  } catch {
    // ignore storage access errors
  }
  return DEFAULT_ADMIN_THEME
}

export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<AdminThemeId>(DEFAULT_ADMIN_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(readStoredTheme())
    setMounted(true)
  }, [])

  // Apply on <html> so portaled menus/dialogs inherit theme tokens.
  // Clear on unmount so public pages stay on the default :root brand.
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.setAttribute("data-theme", theme)

    return () => {
      root.removeAttribute("data-theme")
    }
  }, [theme, mounted])

  const setTheme = useCallback((next: AdminThemeId) => {
    setThemeState(next)
    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next)
    } catch {
      // ignore storage access errors
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: ADMIN_THEMES,
      mounted,
    }),
    [theme, setTheme, mounted]
  )

  return (
    <AdminThemeContext.Provider value={value}>
      <div className="flex h-svh w-full overflow-hidden">{children}</div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider")
  }
  return context
}
