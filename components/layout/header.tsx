"use client"

import { useState } from "react"
import Link from "next/link"
import { LogIn, Menu, PawPrint } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navLinks } from "@/components/layout/nav-links"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="container-px mx-auto flex items-center justify-between py-3 sm:py-4 max-w-7xl">
        <a
          href="#home"
          className="flex items-center gap-2 text-navy font-bold text-lg sm:text-xl"
        >
          <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
          PetCare
        </a>

        <nav className="hidden lg:flex items-center gap-9 text-sm font-medium text-navy/80">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-navy/80 px-3 py-2 rounded-md hover:text-navy hover:bg-navy/5 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-navy"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] p-0 gap-0"
            >
              <SheetHeader className="border-b border-gray-100 px-5 py-4">
                <SheetTitle className="flex items-center gap-2 text-navy font-bold">
                  <PawPrint className="w-5 h-5" />
                  PetCare
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-1 flex-col px-3 py-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <a
                        href={link.href}
                        className="rounded-md px-3 py-3 text-base font-medium text-navy/80 hover:bg-cream hover:text-navy transition-colors"
                        onClick={() => setOpen(false)}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>

              <div className="border-t border-gray-100 p-4 space-y-2">
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-navy/20 px-4 py-3 text-sm font-medium text-navy hover:bg-navy/5 transition-colors"
                      onClick={() => setOpen(false)}
                    />
                  }
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </SheetClose>

                <SheetClose
                  render={
                    <Link
                      href="/book"
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-colors"
                      onClick={() => setOpen(false)}
                    />
                  }
                >
                  Book Appointment
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
