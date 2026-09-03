import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Admin Console — ArtisanConnect",
  description: "Administrative console and platform management for ArtisanConnect.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // If visiting the unauthorized access screen, render it directly without the admin shell
  if (pathname === "/admin/unauthorized") {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { user, profile, error } = await requireAdmin(supabase);

  if (error || !user || !profile) {
    if (!user) {
      redirect("/login?redirect=/admin/dashboard");
    }
    if (profile && profile.status === "suspended") {
      redirect("/suspended");
    }
    redirect("/admin/unauthorized");
  }

  // Fetch real-time badge counts for navigation
  const [{ count: pendingVerifications }, { count: openReports }] =
    await Promise.all([
      supabase
        .from("artisan_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending"),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
    ]);

  return (
    <AdminShell
      adminName={profile.full_name || "Administrator"}
      adminEmail={profile.email || user.email || ""}
      pendingVerifications={pendingVerifications || 0}
      openReports={openReports || 0}
    >
      {children}
    </AdminShell>
  );
}
