import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Standard layout shell for the ArtisanConnect Public & Marketplace application.
 * Renders the Marketplace Navbar, main content area, and Footer.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
