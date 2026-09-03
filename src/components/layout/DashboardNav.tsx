"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Search,
  Briefcase,
  Layers,
  Inbox,
  CalendarCheck,
} from "lucide-react";
import { UserRole } from "@/types/database.types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardNavProps {
  role: UserRole;
}

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();

  const customerLinks: NavItem[] = [
    {
      label: "Overview",
      href: "/customer/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Requests",
      href: "/customer/requests",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      label: "Find Artisans",
      href: "/find-artisans",
      icon: <Search className="h-4 w-4" />,
    },
    {
      label: "My Profile",
      href: "/customer/profile",
      icon: <User className="h-4 w-4" />,
    },
  ];

  const artisanLinks: NavItem[] = [
    {
      label: "Overview",
      href: "/artisan/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Service Requests",
      href: "/artisan/requests",
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      label: "My Services",
      href: "/artisan/services",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Business Profile",
      href: "/artisan/profile",
      icon: <Briefcase className="h-4 w-4" />,
    },
  ];

  const adminLinks: NavItem[] = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: <Layers className="h-4 w-4" />,
    },
  ];

  let items = customerLinks;
  if (role === "artisan") items = artisanLinks;
  if (role === "admin") items = adminLinks;

  return (
    <nav className="flex space-x-2 border-b border-neutral-200 pb-2 mb-8 overflow-x-auto">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              isActive
                ? "bg-slate-100 text-[#0f2942] font-bold border-b-2 border-[#ea580c]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
