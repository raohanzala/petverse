"use client"

import { PaletteIcon } from "lucide-react"

import { useAdminTheme } from "@/components/admin/admin-theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminThemeId } from "@/lib/constants/admin-themes"
import { cn } from "@/lib/utils"

export function AdminThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, themes, mounted } = useAdminTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "size-10 rounded-lg text-muted-foreground hover:text-foreground",
              className
            )}
            aria-label="Choose theme"
          />
        }
      >
        <PaletteIcon className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Admin theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={mounted ? theme : undefined}
            onValueChange={(value) => {
              if (!value) return
              setTheme(value as AdminThemeId)
            }}
          >
            {themes.map((item) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={item.id}
                className="items-start gap-3 py-2.5 pr-8"
              >
                <span className="mt-0.5 flex gap-1" aria-hidden>
                  {item.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="size-3.5 rounded-full border border-border/60"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
