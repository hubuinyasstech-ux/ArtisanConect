import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/layout/AdminNav";
import {
  AdminVerificationTable,
  AdminArtisanVerificationItem,
} from "@/components/admin/AdminVerificationTable";
import { VerificationStatus } from "@/types/database.types";
import { ShieldCheck, MapPin } from "lucide-react";

export const metadata = {
  title: "Artisan Verification Desk — Admin Console",
};

export default async function AdminVerificationPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // Fetch all artisans with owner profile details
  const { data: artisans } = await supabase
    .from("artisan_profiles")
    .select(`
      id,
      user_id,
      business_name,
      category,
      years_experience,
      verification_status,
      verification_notes,
      verification_requested_at,
      verification_reviewed_at,
      profiles (
        full_name,
        email,
        phone,
        location
      )
    `)
    .order("verification_requested_at", { ascending: false, nullsFirst: false });

  // Count open reports and pending verifications for nav badges
  const { count: pendingVerifications } = await supabase
    .from("artisan_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  const { count: openReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const formattedArtisans: AdminArtisanVerificationItem[] = (artisans || []).map((a) => {
    const owner = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    return {
      id: a.id,
      user_id: a.user_id,
      business_name: a.business_name,
      category: a.category,
      years_experience: a.years_experience,
      location: owner?.location || "Osogbo, Osun State",
      verification_status: a.verification_status as VerificationStatus,
      verification_notes: a.verification_notes,
      verification_requested_at: a.verification_requested_at,
      verification_reviewed_at: a.verification_reviewed_at,
      owner_name: owner?.full_name || "Unknown Artisan",
      owner_email: owner?.email || "No email",
      owner_phone: owner?.phone || null,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Governance & Vetting
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Artisan Verification Review Desk</h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Review trade credential submissions from local Osogbo service providers. Approving grants the verified
            badge and elevates discovery ranking.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-800 text-xs text-neutral-300 shrink-0">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span>Osogbo Pilot Jurisdiction</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav
        pendingVerifications={pendingVerifications || 0}
        openReports={openReports || 0}
      />

      {/* Verification Table */}
      <AdminVerificationTable initialArtisans={formattedArtisans} />
    </div>
  );
}
