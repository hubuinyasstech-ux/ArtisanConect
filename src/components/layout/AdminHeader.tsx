"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Menu,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  MapPin,
  Shield,
} from "lucide-react";

export interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
  pendingVerifications: number;
  openReports: number;
  onOpenMobileSidebar: () => void;
}

export function AdminHeader({
  adminName,
  adminEmail,
  pendingVerifications = 0,
  openReports = 0,
  onOpenMobileSidebar,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Jurisdiction */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#0f2942] hover:bg-slate-100"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-[#0f2942] flex items-center justify-center text-white lg:hidden">
            <Shield className="h-4 w-4 text-[#ea580c]" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-[#0f2942] block sm:hidden">
              Admin Console
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">ArtisanConnect Administration</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                <MapPin className="h-3 w-3 text-emerald-600" />
                Osogbo Pilot Jurisdiction
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Action Indicators & User Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Verification Alert Badge */}
        {pendingVerifications > 0 && (
          <Link
            href="/admin/verification"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#ea580c]" />
            <span className="hidden md:inline">Vetting:</span>
            <span>{pendingVerifications}</span>
          </Link>
        )}

        {/* Safety Reports Alert Badge */}
        {openReports > 0 && (
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold hover:bg-red-100 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <span className="hidden md:inline">Reports:</span>
            <span>{openReports}</span>
          </Link>
        )}

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Admin Avatar & Sign Out */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[#0f2942] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
              {getInitials(adminName)}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-[#0f2942]">{adminName}</div>
              <div className="text-[10px] text-slate-400">{adminEmail}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
