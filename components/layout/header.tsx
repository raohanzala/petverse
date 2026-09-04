import { Calendar, PawPrint } from "lucide-react";
import Link from "next/link";

export  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About Us", href: "#about" },
    { label: "Why Us", href: "#why-us" },
    { label: "Contact", href: "#contact" },
  ];
  
export default function Header() {

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="container-px mx-auto flex items-center justify-between py-4 max-w-7xl">
        <a
          href="#home"
          className="flex items-center gap-2 text-navy font-bold text-xl"
        >
          <PawPrint className="w-6 h-6 text-navy" />
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

        <Link
          href="/login"
          className="hidden sm:inline-flex items-center gap-2 bg-white border border-navy text-navy text-sm font-medium px-5 py-3 rounded-md hover:bg-navy-800 hover:text-white transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Login
        </Link>
      </div>
    </header>
  );
}
