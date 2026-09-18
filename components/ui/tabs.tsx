"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    "group/tabs-list",
    "inline-flex",
    "w-full",
    "items-center",
    "justify-between",
    "rounded-xl",
    "border",
    "border-slate-200",
    "bg-white",
    "text-slate-500",
    "shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
    "overflow-hidden",

    // Vertical
    "group-data-vertical/tabs:h-fit",
    "group-data-vertical/tabs:flex-col",
    "group-data-vertical/tabs:items-stretch",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "gap-1",
          "p-1.5",
          "rounded-xl",
          "group-data-horizontal/tabs:min-h-[58px]",
        ].join(" "),

        compact: [
          "gap-0.5",
          "p-1",
          "group-data-horizontal/tabs:min-h-[40px]",
        ].join(" "),
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "group/tab-trigger",
        "relative",
        "inline-flex",
        "flex-1",
        "items-center",
        "justify-center",
        "gap-2",
        "rounded-lg",
        "border",
        "border-transparent",
        "px-3",
        "py-1.5",
        "text-sm",
        "font-medium",
        "whitespace-nowrap",
        "text-slate-500",
        "transition-all",
        "duration-200",
        "ease-out",

        // Default variant
        "group-data-[variant=default]/tabs-list:min-h-10",

        // Compact variant
        "group-data-[variant=compact]/tabs-list:min-h-8",
        "group-data-[variant=compact]/tabs-list:px-2.5",
        "group-data-[variant=compact]/tabs-list:py-1",
        "group-data-[variant=compact]/tabs-list:text-[13px]",

        "hover:bg-slate-50",
        "hover:text-slate-900",

        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-blue-500/30",

        "data-active:bg-blue-50",
        "data-active:text-blue-600",
        "data-active:border-blue-100",

        "disabled:pointer-events-none",
        "disabled:opacity-50",
        "aria-disabled:pointer-events-none",
        "aria-disabled:opacity-50",

        "group-data-vertical/tabs:w-full",
        "group-data-vertical/tabs:justify-start",

        "[&_svg]:pointer-events-none",
        "[&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-[17px]",
        "[&_svg]:text-slate-400",
        "data-active:[&_svg]:text-blue-600",

        "after:absolute",
        "after:bottom-0",
        "after:left-1/2",
        "after:h-[2px]",
        "after:w-0",
        "after:-translate-x-1/2",
        "after:rounded-full",
        "after:bg-blue-600",
        "after:opacity-0",
        "after:transition-all",
        "after:duration-200",

        "group-data-[variant=default]/tabs-list:data-active:after:w-[70%]",
        "group-data-[variant=default]/tabs-list:data-active:after:opacity-100",

        "group-data-[variant=compact]/tabs-list:data-active:after:hidden",

        "group-data-vertical/tabs:after:bottom-auto",
        "group-data-vertical/tabs:after:left-auto",
        "group-data-vertical/tabs:after:right-[-7px]",
        "group-data-vertical/tabs:after:top-1/2",
        "group-data-vertical/tabs:after:h-[70%]",
        "group-data-vertical/tabs:after:w-[3px]",
        "group-data-vertical/tabs:after:-translate-y-1/2",
        "group-data-vertical/tabs:after:translate-x-0",

        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1",
        "text-sm",
        "outline-none",
        "focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
}