"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
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

const AdminThemeContext =
  createContext<AdminThemeContextValue | null>(null)

const themeSubscribers = new Set<() => void>()

function subscribeToTheme(callback: () => void) {
  themeSubscribers.add(callback)

  return () => {
    themeSubscribers.delete(callback)
  }
}

function notifyThemeSubscribers() {
  themeSubscribers.forEach((callback) => callback())
}

function readStoredTheme(): AdminThemeId {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_THEME
  }

  try {
    const stored = window.localStorage.getItem(
      ADMIN_THEME_STORAGE_KEY
    )

    if (isAdminThemeId(stored)) {
      return stored
    }
  } catch {
    // Ignore storage access errors.
  }

  return DEFAULT_ADMIN_THEME
}

function getThemeSnapshot(): AdminThemeId {
  return readStoredTheme()
}

function getThemeServerSnapshot(): AdminThemeId {
  return DEFAULT_ADMIN_THEME
}

function subscribeToStorage(callback: () => void) {
  const unsubscribe = subscribeToTheme(callback)

  window.addEventListener("storage", callback)

  return () => {
    unsubscribe()
    window.removeEventListener("storage", callback)
  }
}

function getMountedSnapshot() {
  return true
}

function getMountedServerSnapshot() {
  return false
}

function subscribeToMounted() {
  return () => {}
}

export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useSyncExternalStore(
    subscribeToStorage,
    getThemeSnapshot,
    getThemeServerSnapshot
  )

  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  )

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    root.setAttribute("data-theme", theme)

    return () => {
      root.removeAttribute("data-theme")
    }
  }, [theme, mounted])

  const setTheme = useCallback((next: AdminThemeId) => {
    try {
      window.localStorage.setItem(
        ADMIN_THEME_STORAGE_KEY,
        next
      )
    } catch {
      // Ignore storage access errors.
    }

    notifyThemeSubscribers()
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
      <div className="flex h-svh w-full overflow-hidden">
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)

  if (!context) {
    throw new Error(
      "useAdminTheme must be used within AdminThemeProvider"
    )
  }

  return context
}