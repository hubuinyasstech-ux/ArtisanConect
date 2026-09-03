"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Layers,
  Inbox,
  AlertTriangle,
  BarChart3,
  LogOut,
  ExternalLink,
  Shield,
  X,
} from "lucide-react";

export interface AdminSidebarProps {
  pendingVerifications?: number;
  openReports?: number;
  adminName?: string;
  adminEmail?: string;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  pendingVerifications = 0,
  openReports = 0,
  adminName = "Administrator",
  adminEmail = "",
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Artisan Verification",
      href: "/admin/verification",
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: pendingVerifications,
      badgeColor: "bg-[#ea580c] text-white",
    },
    {
      label: "User Accounts",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Services Moderation",
      href: "/admin/services",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Request Monitor",
      href: "/admin/requests",
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      label: "Safety Reports",
      href: "/admin/reports",
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: openReports,
      badgeColor: "bg-red-500 text-white",
    },
    {
      label: "Platform Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

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
    <aside className="w-64 sm:w-72 bg-[#0a1523] text-slate-200 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white shadow-md shadow-[#ea580c]/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">ArtisanConnect</span>
            </div>
            <span className="inline-block text-[9px] font-black uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/10 px-1.5 py-0.5 rounded-sm">
              Admin Console
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Governance & Operations
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "bg-[#ea580c] text-white shadow-sm font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none",
                    isActive ? "bg-white text-[#ea580c]" : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Public Marketplace Quick Link */}
      <div className="px-4 py-2 border-t border-slate-800/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2 rounded-xl text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3 text-[#ea580c]" />
            <span>Open Public Marketplace</span>
          </span>
          <span className="text-[10px] text-slate-400">New Tab ↗</span>
        </Link>
      </div>

      {/* Admin Profile & Sign Out Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070e17]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-white shrink-0">
              {getInitials(adminName)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{adminName}</div>
              <div className="text-[10px] text-slate-400 truncate">{adminEmail || "Super Administrator"}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out of Admin Console"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
