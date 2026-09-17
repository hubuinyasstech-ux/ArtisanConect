"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  pendingVerifications: number;
  openReports: number;
}

export function AdminShell({
  children,
  adminName,
  adminEmail,
  pendingVerifications,
  openReports,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:shrink-0 z-40">
        <AdminSidebar
          adminName={adminName}
          adminEmail={adminEmail}
          pendingVerifications={pendingVerifications}
          openReports={openReports}
        />
      </div>

      {/* Mobile Sliding Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0a1523] z-10 shadow-2xl">
            <AdminSidebar
              adminName={adminName}
              adminEmail={adminEmail}
              pendingVerifications={pendingVerifications}
              openReports={openReports}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          adminName={adminName}
          adminEmail={adminEmail}
          pendingVerifications={pendingVerifications}
          openReports={openReports}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
