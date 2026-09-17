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

  const marketplaceUrl =
    process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Artisan Verification",
      href: "/verification",
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: pendingVerifications,
      badgeColor: "bg-[#ea580c] text-white",
    },
    {
      label: "User Accounts",
      href: "/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Services Moderation",
      href: "/services",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Request Monitor",
      href: "/requests",
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      label: "Safety Reports",
      href: "/reports",
      icon: <AlertTriangle className="h-4 w-4" />,
      badge: openReports,
      badgeColor: "bg-red-500 text-white",
    },
    {
      label: "Platform Analytics",
      href: "/analytics",
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
    return (
      name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AD"
    );
  };

  return (
    <aside className="w-64 sm:w-72 bg-[#0a1523] text-slate-200 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
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
        </Link>

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
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-[#ea580c] text-white shadow-sm shadow-[#ea580c]/30 font-bold"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {typeof item.badge === "number" && item.badge > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-full",
                    isActive ? "bg-white text-[#ea580c]" : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 pb-2 px-3">
          <div className="border-t border-slate-800/80 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              External Navigation
            </span>
          </div>
        </div>

        <a
          href={marketplaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Open Public Marketplace</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">↗</span>
        </a>
      </div>

      {/* Admin User Footer Block */}
      <div className="p-3 border-t border-slate-800/70 bg-[#070f1a]">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-[#ea580c]/20 border border-[#ea580c]/40 text-[#ea580c] flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(adminName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {adminEmail || "Super Admin"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out of Admin Console"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
