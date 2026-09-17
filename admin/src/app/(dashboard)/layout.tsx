import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Admin Console — ArtisanConnect",
  description: "Administrative console and platform management for ArtisanConnect.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { user, profile, error } = await requireAdmin(supabase);

  if (error || !user || !profile) {
    if (!user) {
      redirect("/login?redirect=/dashboard");
    }
    if (profile && profile.status === "suspended") {
      redirect("/unauthorized?reason=suspended");
    }
    redirect("/unauthorized");
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
