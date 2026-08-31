import { services } from '@/app/page'
import { MapPin, Mail, PawPrint, Phone } from 'lucide-react'
import React from 'react'
import { navLinks } from './header'

export default function Footer() {

  return (
    <footer id="contact" className="bg-navy pt-16 pb-6">
    <div className="container-px mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
      <div>
        <a href="#home" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
          <PawPrint className="w-6 h-6" />
          PetCare
        </a>
        <p className="text-white/50 text-sm mb-5">Caring for pets, enriching lives.</p>
        <div className="flex gap-3">
          {/* {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))} */}
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2.5 text-sm text-white/50">
          {navLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="hover:text-gold transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Services</h4>
        <ul className="space-y-2.5 text-sm text-white/50">
          {services.map((s) => (
            <li key={s.title}>
              <a href="#services" className="hover:text-gold transition-colors">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Contact Us</h4>
        <ul className="space-y-3 text-sm text-white/50">
          <li className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-gold shrink-0" />
            +92 300 1234567
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-gold shrink-0" />
            info@petcare.com
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            123 PetCare Lane, Loving City, PK 12345
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 pt-6">
      <p className="text-center text-white/40 text-xs">
        © 2024 PetCare. All rights reserved.
      </p>
    </div>
  </footer>
  )
}
