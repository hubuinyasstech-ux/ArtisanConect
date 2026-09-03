import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Catalog Moderation
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">Services & Pricing Moderation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit published trades and starting estimates in Osogbo. Enforce fair pricing, hide inappropriate listings,
            and maintain customer quality standards.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <Layers className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">{formattedServices.length} Published Offerings</span>
        </div>
      </div>

      {/* Services Table */}
      <AdminServicesTable initialServices={formattedServices} />
    </div>
  );
}
