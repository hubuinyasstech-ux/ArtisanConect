import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminServicesTable, AdminServiceItem } from "@/components/admin/AdminServicesTable";
import { ModerationStatus } from "@/types/database.types";
import { Layers } from "lucide-react";

export const metadata = {
  title: "Service Moderation — Admin Console",
};

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // Fetch all services with artisan business profile
  const { data: services } = await supabase
    .from("services")
    .select(`
      id,
      artisan_id,
      title,
      description,
      category,
      price,
      location,
      is_active,
      moderation_status,
      moderation_reason,
      moderated_at,
      created_at,
      artisan_profiles (
        business_name
      )
    `)
    .order("created_at", { ascending: false });

  // Counts for nav badges
  const { count: pendingVerifications } = await supabase
    .from("artisan_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  const { count: openReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const formattedServices: AdminServiceItem[] = (services || []).map((s) => {
    const artisan = Array.isArray(s.artisan_profiles)
      ? s.artisan_profiles[0]
      : s.artisan_profiles;

    return {
      id: s.id,
      artisan_id: s.artisan_id,
      business_name: artisan?.business_name || "Unknown Artisan",
      title: s.title,
      description: s.description,
      category: s.category,
      price: Number(s.price),
      location: s.location,
      is_active: s.is_active,
      moderation_status: (s.moderation_status || "active") as ModerationStatus,
      moderation_reason: s.moderation_reason,
      moderated_at: s.moderated_at,
      created_at: s.created_at,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Catalog Moderation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Services & Pricing Moderation</h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Audit published trades and starting estimates in Osogbo. Enforce fair pricing, hide inappropriate listings,
            and maintain customer quality standards.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-800 text-xs text-neutral-300 shrink-0">
          <Layers className="h-4 w-4 text-blue-400" />
          <span>{formattedServices.length} Published Offerings</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav
        pendingVerifications={pendingVerifications || 0}
        openReports={openReports || 0}
      />

      {/* Services Table */}
      <AdminServicesTable initialServices={formattedServices} />
    </div>
  );
}
