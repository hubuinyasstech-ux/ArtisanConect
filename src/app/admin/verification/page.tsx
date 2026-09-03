import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  AdminVerificationTable,
  AdminArtisanVerificationItem,
} from "@/components/admin/AdminVerificationTable";
import { VerificationStatus } from "@/types/database.types";
import { MapPin } from "lucide-react";

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Governance & Vetting
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">Artisan Verification Review Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review trade credential submissions from local Osogbo service providers. Approving grants the verified
            badge and elevates discovery ranking.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold">Osogbo Pilot Jurisdiction</span>
        </div>
      </div>

      {/* Verification Table */}
      <AdminVerificationTable initialArtisans={formattedArtisans} />
    </div>
  );
}
