import React from "react";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#0a1b2c] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Mission */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Find trusted, skilled, and vetted artisans near you in Nigeria. Starting from
              our pilot in Osogbo, Osun State, connecting households and businesses with
              reliable professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-300">
              <MapPin className="h-4 w-4 text-[#ea580c]" />
              <span>Pilot Launch: Osogbo, Osun State</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/find-artisans" className="hover:text-[#ea580c] transition-colors">
                  Find Artisans
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#ea580c] transition-colors">
                  Service Categories
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#ea580c] transition-colors">
                  Join as an Artisan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#ea580c] transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Initial Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Plumbing</li>
              <li>Electrical</li>
              <li>Carpentry</li>
              <li>Painting</li>
              <li>Deep Cleaning</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ArtisanConnect. Built for Nigerian communities.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-[#ea580c] fill-[#ea580c]" />
            <span>for Nigerian artisans & customers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
