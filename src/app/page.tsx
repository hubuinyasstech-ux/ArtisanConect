import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  MapPin,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Search,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    {
      name: "Plumbing",
      slug: "plumbing",
      icon: <Wrench className="h-5 w-5 text-sky-600" />,
      iconBg: "bg-sky-50 border-sky-100 text-sky-600",
      description: "Pipes, leak repairs, borehole maintenance & bathroom installations",
      count: "Verified Specialists",
    },
    {
      name: "Electrical",
      slug: "electrical",
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      iconBg: "bg-amber-50 border-amber-100 text-amber-600",
      description: "Wiring, generator/inverter setup, appliance repair & lighting",
      count: "Verified Electricians",
    },
    {
      name: "Carpentry",
      slug: "carpentry",
      icon: <Hammer className="h-5 w-5 text-orange-600" />,
      iconBg: "bg-orange-50 border-orange-100 text-orange-600",
      description: "Furniture craftsmanship, doors, roofing, and structural repairs",
      count: "Master Carpenters",
    },
    {
      name: "Painting",
      slug: "painting",
      icon: <Paintbrush className="h-5 w-5 text-indigo-600" />,
      iconBg: "bg-indigo-50 border-indigo-100 text-indigo-600",
      description: "Interior/exterior wall painting, screeding, and decorative finishes",
      count: "Experienced Painters",
    },
    {
      name: "Cleaning",
      slug: "cleaning",
      icon: <Sparkles className="h-5 w-5 text-teal-600" />,
      iconBg: "bg-teal-50 border-teal-100 text-teal-600",
      description: "Deep home cleaning, office sanitization, post-construction cleanup",
      count: "Trusted Cleaners",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Enhanced Hero Section with Official Logo & Interactive Discovery */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-orange-50/20 pt-10 sm:pt-16 pb-16 border-b border-slate-200/80">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 right-1/4 -mt-16 h-72 w-72 rounded-full bg-[#ea580c]/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#0f2942]/5 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Core Value Proposition, Pilot Pill, & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pilot Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#ea580c] animate-pulse" />
                <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
                <span>Pilot Active in Osogbo, Osun State</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f2942] leading-[1.15]">
                  Find <span className="text-[#ea580c]">Trusted Artisans</span> Near You in Nigeria
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Connect with verified plumbers, electricians, carpenters, painters, and cleaners.
                  Review verified previous work, transparent pricing, and contact professionals
                  instantly through direct call or WhatsApp.
                </p>
              </div>

              {/* Quick Search & Location Bar */}
              <form
                action="/find-artisans"
                method="GET"
                className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-300 shadow-sm flex flex-col sm:flex-row gap-2 max-w-xl focus-within:border-[#ea580c] focus-within:ring-2 focus-within:ring-[#ea580c]/15 transition-all duration-150"
              >
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="What service do you need? (e.g. Plumber)"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="w-full sm:w-48 relative flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                  <MapPin className="absolute left-2.5 sm:left-3.5 h-4 w-4 text-[#ea580c]" />
                  <input
                    type="text"
                    name="location"
                    defaultValue="Osogbo, Osun State"
                    className="w-full pl-8 pr-2 py-2 text-xs font-medium text-slate-700 border-0 focus:outline-none focus:ring-0 bg-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="shrink-0 font-semibold px-5"
                >
                  <span>Find</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/find-artisans">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-7 font-bold shadow-sm"
                  >
                    Browse All Artisans
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-7 font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Briefcase className="h-4 w-4 mr-2 text-[#ea580c]" />
                    Join as an Artisan
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Free direct calls & WhatsApp
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Verified local portfolios
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Zero commission on client quotes
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Card with Brand Logo & Floating Social Proof */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative">
                {/* Official Logo Brand Display */}
                <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-100">
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden rounded-2xl shadow-inner bg-slate-50 p-2 border border-slate-200/80 transition-transform duration-300 hover:scale-[1.02]">
                    <Image
                      src="/logo.jpeg"
                      alt="ArtisanConnect Official Logo"
                      fill
                      sizes="(max-width: 640px) 176px, 208px"
                      className="object-contain p-2 rounded-xl"
                      priority
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Platform
                    </span>
                    <h3 className="text-xl font-extrabold text-[#0f2942]">
                      Artisan<span className="text-[#ea580c]">Connect</span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                      Find Trusted Artisans Near You
                    </p>
                  </div>
                </div>

                {/* Popular Trades Snapshot */}
                <div className="pt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 uppercase tracking-wide text-[11px]">
                      Available Services in Osogbo
                    </span>
                    <span className="text-emerald-700 font-bold">5 Trades Active</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/find-artisans?category=${cat.slug}`}
                        className="group flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div className={`p-2 rounded-xl border ${cat.iconBg} group-hover:shadow-xs transition-colors`}>
                          {cat.icon}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 mt-1 line-clamp-1 group-hover:text-[#ea580c]">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Floating Mini Badge 1: Verification Proof */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">100% Vetted</p>
                    <p className="text-[10px] text-slate-500">Identity & Skill Checked</p>
                  </div>
                </div>

                {/* Floating Mini Badge 2: Direct Contact */}
                <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-[#ea580c]">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Direct Contact</p>
                    <p className="text-[10px] text-slate-500">Call & WhatsApp Instant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="brand" className="mb-2">
              Popular Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f2942]">
              Browse Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any category to find experienced professionals in your neighborhood
            </p>
          </div>
          <Link href="/find-artisans">
            <Button variant="outline" size="sm">
              View All Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/find-artisans?category=${category.slug}`}
              className="group"
            >
              <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md border-slate-200 hover:border-[#ea580c]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${category.iconBg} transition-colors`}>
                      {category.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-[#ea580c] transition-colors">
                      Explore →
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#ea580c] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{category.count}</span>
                    <span className="text-[#ea580c] font-medium">Osogbo Area</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50/80 py-16 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="default">Simple 3-Step Process</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f2942]">
              How ArtisanConnect Works
            </h2>
            <p className="text-sm text-slate-600">
              Whether you are hiring or offering your skills, ArtisanConnect makes it effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f2942] text-white font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Choose Service & Location</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by service category and specify your area in Osogbo or neighbouring towns
                to view artisans close to your project.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ea580c] text-white font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Inspect Experience & Portfolio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check their years of experience, verified badges, past project photos, and
                starting estimates before reaching out.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f2942] text-white font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Call, WhatsApp, or Request</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contact the artisan directly via phone or WhatsApp, or submit a formal service
                request with your preferred schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Value Proposition Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0f2942] text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-orange-200">
              <Briefcase className="h-3.5 w-3.5 text-[#ea580c]" />
              <span>For Nigerian Artisans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Grow Your Trade Business. Get Consistent Local Clients.
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Create a professional digital portfolio in minutes. Showcase your craftsmanship to
              hundreds of homeowners, landlords, and contractors looking for your skills daily in
              Osogbo and beyond.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                <span>Zero commission on direct calls</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                <span>Showcase photos of completed work</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                <span>Verified badge builds instant trust</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                <span>Direct WhatsApp and phone leads</span>
              </li>
            </ul>
          </div>

          <div className="shrink-0">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="font-bold px-8 shadow-lg text-base"
              >
                Register Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
