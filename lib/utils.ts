import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** URL-safe slug from a display name (e.g. "Health Check-up" → "health-check-up") */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function parseDateTime(
  value: string | null | undefined
) {
  if (!value) {
    return {
      date: undefined,
      time: "",
    }
  }

  const [datePart, timePart] = value.split("T")

  return {
    date: datePart
      ? new Date(`${datePart}T00:00:00`)
      : undefined,
    time: timePart ?? "",
  }
}
