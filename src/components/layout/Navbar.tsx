"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  LogOut,
  Menu,
  X,
  MapPin,
  LayoutDashboard,
  Layers,
  User as UserIcon,
} from "lucide-react";
import { Profile } from "@/types/database.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUserProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (isMounted && data) {
        setProfile(data as Profile);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsSigningOut(false);
    router.push("/login");
    router.refresh();
  };

  const role = profile?.role || user?.user_metadata?.role || "customer";

  const getDashboardUrl = () => {
    if (role === "artisan") return "/artisan/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/customer/dashboard";
  };

  const getProfileUrl = () => {
    if (role === "artisan") return "/artisan/profile";
    return "/customer/profile";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Logo size="md" />

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
            <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
            <span>Pilot: Osogbo, Osun State</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/find-artisans"
            className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors"
          >
            Find Artisans
          </Link>

          {user && role === "customer" && (
            <Link
              href="/customer/requests"
              className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors"
            >
              My Requests
            </Link>
          )}

          {user && role === "artisan" && (
            <Link
              href="/artisan/requests"
              className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors"
            >
              Requests
            </Link>
          )}

          {user && role === "artisan" && (
            <Link
              href="/artisan/services"
              className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors flex items-center gap-1.5"
            >
              <Layers className="h-3.5 w-3.5 text-[#ea580c]" />
              <span>Services</span>
            </Link>
          )}

          {user && (
            <Link
              href={getProfileUrl()}
              className="text-sm font-medium text-slate-600 hover:text-[#ea580c] transition-colors flex items-center gap-1.5"
            >
              <UserIcon className="h-3.5 w-3.5 text-slate-400" />
              <span>Profile</span>
            </Link>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell userRole={role} />

              <Link href={getDashboardUrl()}>
                <Button variant="outline" size="sm" className="gap-2 text-[#0f2942]">
                  <LayoutDashboard className="h-4 w-4 text-[#ea580c]" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 line-clamp-1 max-w-[120px]">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#ea580c]">
                    {role}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  isLoading={isSigningOut}
                  className="text-slate-400 hover:text-rose-600 h-8 w-8 p-0"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="sm" className="font-semibold shadow-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-1.5 py-1 text-xs text-slate-700 font-medium bg-slate-50 px-3 rounded-lg border border-slate-100">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
            <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
            <span>Pilot: Osogbo, Osun State</span>
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
            >
              Home
            </Link>
            <Link
              href="/find-artisans"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
            >
              Find Artisans
            </Link>

            {user && role === "artisan" && (
              <Link
                href="/artisan/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
              >
                Services
              </Link>
            )}

            {user && role === "customer" && (
              <Link
                href="/customer/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
              >
                My Requests
              </Link>
            )}

            {user && role === "artisan" && (
              <Link
                href="/artisan/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
              >
                Service Requests
              </Link>
            )}

            {user && (
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
              >
                Notifications
              </Link>
            )}

            {user && (
              <Link
                href={getProfileUrl()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
              >
                Profile
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {profile?.full_name || user.email}
                  </span>
                  <Badge variant="brand">
                    {role}
                  </Badge>
                </div>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  isLoading={isSigningOut}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
