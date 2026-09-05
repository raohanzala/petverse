import Image from "next/image";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Heart,
  Stethoscope,
  Syringe,
  Scissors,
  HeartPulse,
  Award,
  Users,
  UserCheck,
  CheckCircle2,
  // Facebook,
  // Instagram,
  // Twitter,
  // Linkedin,
  Phone,
  Mail,
  MapPin,
  Star,
  Quote,
  PawPrint,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: "Trusted Experts",
    desc: "Professional & caring pet specialists",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    desc: "Quick & hassle-free appointments",
  },
  {
    icon: Heart,
    title: "Happy Pets",
    desc: "Because they deserve the best",
  },
];

export const services = [
  {
    icon: Stethoscope,
    title: "Health Check-ups",
    desc: "Regular health exams to keep your pet in the best shape.",
  },
  {
    icon: Syringe,
    title: "Vaccinations",
    desc: "Safe and effective vaccinations to protect your pet.",
  },
  {
    icon: Scissors,
    title: "Grooming",
    desc: "Professional grooming for a clean and happy pet.",
  },
  {
    icon: ToothIcon,
    title: "Dental Care",
    desc: "Complete dental care for strong teeth and fresh breath.",
  },
  {
    icon: HeartPulse,
    title: "Emergency Care",
    desc: "24/7 care when your pet needs it the most.",
  },
];

const stats = [
  { icon: Award, value: "15+", label: "Years of Experience" },
  { icon: Users, value: "3k+", label: "Happy Pet Parents" },
  { icon: UserCheck, value: "20+", label: "Expert Veterinarians" },
];

const aboutChecklist = [
  "Experienced & Certified Veterinarians",
  "Modern Facilities & Equipment",
  "Personalized Care for Every Pet",
  "Safe, Clean & Friendly Environment",
];

const aboutImages = [
  {
    src: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80&auto=format&fit=crop",
    alt: "Veterinarian examining a small dog",
  },
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop",
    alt: "Clean modern clinic reception area",
  },
  {
    src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80&auto=format&fit=crop",
    alt: "Veterinary operating room",
  },
  {
    src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80&auto=format&fit=crop",
    alt: "Happy golden retriever being petted",
  },
];

const testimonials = [
  {
    quote:
      "The best care and so much love for pets! Booking appointments is super easy and the staff is amazing.",
    name: "Ayesha K.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80&auto=format&fit=crop",
  },
  {
    quote:
      "Professional, friendly, and always available. Highly recommend PetCare for all pet parents!",
    name: "Usman R.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&auto=format&fit=crop",
  },
];

export function ToothIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5.5c-1.1-1.4-2.6-2-4-2C5.8 3.5 4 5.4 4 8c0 1.7.4 2.9.9 4.4.5 1.6 1.1 3.6 1.4 6.7.1 1 .9 1.4 1.6 1.4.9 0 1.4-.7 1.6-1.6.3-1.6.6-3.7 1.4-3.7s1.1 2.1 1.4 3.7c.2.9.7 1.6 1.6 1.6.7 0 1.5-.4 1.6-1.4.3-3.1.9-5.1 1.4-6.7.5-1.5.9-2.7.9-4.4 0-2.6-1.8-4.5-4-4.5-1.4 0-2.9.6-4 2z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      {/* ---------- Header ---------- */}
     
     <Header/>

      <section
        id="home"
        className="relative min-h-[min(100svh,640px)] sm:min-h-[620px] lg:min-h-[680px] overflow-hidden bg-cream"
      >
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="Golden retriever and grey tabby cat"
            fill
            priority
            className="object-cover object-[70%_center] sm:object-center"
            sizes="100vw"
          />

          {/* Readable overlay on small screens; lighter on desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/90 via-cream/75 to-cream/55 sm:bg-gradient-to-r sm:from-cream/90 sm:via-cream/50 sm:to-transparent lg:from-cream/70 lg:via-cream/25" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container-px mx-auto max-w-7xl min-h-[min(100svh,640px)] sm:min-h-[620px] lg:min-h-[680px] flex items-center">
          <div className="w-full lg:w-[52%] py-14 sm:py-20 lg:py-24">
            <p className="text-gold font-semibold tracking-wide text-xs sm:text-sm mb-3 sm:mb-5">
              Trusted Care. Happy Pets.
            </p>

            <h1 className="text-[2.35rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.05] font-extrabold text-navy">
              Better Care
              <br />
              for Your Best
              <br />
              <span className="text-gold">Friend </span>
              <Heart
                className="inline-block w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-gold align-middle"
                strokeWidth={2}
              />
            </h1>

            <p className="mt-4 sm:mt-6 text-navy/65 text-base sm:text-lg leading-relaxed max-w-md">
              Book an appointment for your pet&apos;s grooming, health
              check-up, or any of our expert services.
            </p>

            <a
              href="/book"
              className="mt-6 sm:mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-navy text-white font-semibold px-6 sm:px-7 py-3.5 sm:py-4 rounded-md hover:bg-navy-800 transition-all duration-200 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-xl">
              {heroFeatures.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 sm:gap-2.5 rounded-lg bg-white/40 sm:bg-transparent p-3 sm:p-0 backdrop-blur-[2px] sm:backdrop-blur-none"
                >
                  <f.icon
                    className="w-5 h-5 sm:w-6 sm:h-6 text-navy shrink-0 mt-0.5"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-navy font-semibold text-sm leading-tight">
                      {f.title}
                    </p>
                    <p className="text-navy/50 text-xs leading-snug mt-1">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="py-14 sm:py-20 lg:py-24">
        <div className="container-px mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 lg:mb-14">
            <p className="text-gold font-semibold tracking-wide text-xs sm:text-sm mb-2 sm:mb-3 flex items-center justify-center gap-2">
              <PawPrint className="w-4 h-4" /> OUR SERVICES
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
              Comprehensive Care for Your Pets
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-navy/50 px-1">
              From routine check-ups to specialized treatments, we provide
              everything your pet needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
            {services.map((s) => (
              <div
                key={s.title}
                className="border border-gray-100 rounded-xl p-5 sm:p-6 lg:p-7 text-left sm:text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-cream flex items-center justify-center shrink-0 sm:mx-auto sm:mb-5">
                  <s.icon
                    className="w-6 h-6 sm:w-7 sm:h-7 text-navy"
                    strokeWidth={1.6}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1 sm:mb-2 text-[0.95rem] sm:text-base">
                    {s.title}
                  </h3>
                  <p className="text-sm text-navy/50 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-10 sm:mt-14 lg:mt-16 py-2 sm:py-4 bg-navy rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center flex-col justify-center gap-2 py-7 sm:py-9 px-6"
              >
                <s.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={1.5} />
                <div className="text-center">
                  <p className="text-white text-3xl sm:text-4xl font-semibold mb-1 sm:mb-2 leading-none">
                    {s.value}
                  </p>
                  <p className="text-white/60 text-xs mt-1.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="py-8 pb-24">
        <div className="container-px mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold font-semibold tracking-wide text-sm mb-3 flex items-center gap-2">
              <PawPrint className="w-4 h-4" /> ABOUT US
            </p>
            <h2 className="text-4xl font-extrabold text-navy leading-tight mb-5">
              Your Pet&apos;s Health
              <br />
              is Our Priority
            </h2>
            <p className="text-navy/50 mb-7 max-w-md">
              We combine expertise, compassion, and advanced facilities to provide the
              best care for your furry family members.
            </p>

            <ul className="space-y-3 mb-9">
              {aboutChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3 text-navy/80 text-sm font-medium">
                  <span className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-navy text-white font-medium px-6 py-3.5 rounded-md hover:bg-navy-800 transition-colors"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {aboutImages.map((img, i) => (
              <div
                key={img.alt}
                className={`relative rounded-xl overflow-hidden aspect-square ${
                  i % 2 === 1 ? "mt-6" : ""
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section id="why-us" className="relative bg-navy py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=60&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative container-px mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold font-semibold tracking-wide text-sm mb-3 flex items-center gap-2">
              <PawPrint className="w-4 h-4" /> TESTIMONIALS
            </p>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5">
              What Pet Parents
              <br />
              Say About Us
            </h2>
            <p className="text-white/50 mb-8 max-w-sm">
              We&apos;re trusted by thousands of pet parents who rely on us for the
              best care.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-gold text-navy font-semibold px-6 py-3.5 rounded-md hover:bg-gold-light transition-colors"
            >
              View All Reviews
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-7">
                <Quote className="w-6 h-6 text-gold/60 mb-4" fill="currentColor" />
                <p className="text-navy/70 text-sm leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-navy font-semibold text-sm">{t.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 text-gold" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-cream">
        <div className="container-px mx-auto max-w-7xl py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <PawPrint className="w-6 h-6 text-navy" />
            </span>
            <div>
              <p className="text-navy font-bold text-lg">
                Ready to give your pet the best care?
              </p>
              <p className="text-navy/50 text-sm mt-1">
                Book an appointment today and let us take care of the rest.
              </p>
            </div>
          </div>
          <a
            href="/book"
            className="inline-flex items-center gap-2 bg-navy text-white font-medium px-6 py-4 rounded-md hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <Footer/>
    </main>
  );
}
