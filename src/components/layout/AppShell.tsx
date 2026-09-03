"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Architectural shell that cleanly separates the Public/Marketplace application
 * from the Administrative Console.
 *
 * - When pathname starts with "/admin", the public Navbar and Footer are suppressed,
 *   allowing the dedicated Admin Console layout (AdminSidebar, AdminHeader) to take full control.
 * - For all marketplace routes (public, customer, artisan), Navbar and Footer render normally.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
