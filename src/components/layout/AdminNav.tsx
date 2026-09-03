"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Layers,
  Inbox,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AdminNavProps {
  pendingVerifications?: number;
  openReports?: number;
}

export function AdminNav({ pendingVerifications = 0, openReports = 0 }: AdminNavProps) {
  const pathname = usePathname();

  const navItems: AdminNavItem[] = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Artisan Verification",
      href: "/admin/verification",
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: pendingVerifications,
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
    },
    {
      label: "Platform Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  return (
    <nav className="flex space-x-1.5 border-b border-slate-200 pb-2 mb-8 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap",
              isActive
                ? "bg-[#0f2942] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0f2942] hover:bg-slate-100"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black",
                  isActive ? "bg-[#ea580c] text-white" : "bg-red-100 text-red-700"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
