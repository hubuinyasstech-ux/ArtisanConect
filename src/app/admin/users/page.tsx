import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminUsersTable, AdminUserItem } from "@/components/admin/AdminUsersTable";
import { UserRole, AccountStatus } from "@/types/database.types";
import { Users, MapPin } from "lucide-react";

export const metadata = {
  title: "User Management — Admin Console",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // Fetch all profiles along with artisan_profiles if available
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      phone,
      role,
      location,
      status,
      suspension_reason,
      created_at,
      artisan_profiles (
        id
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

  const formattedUsers: AdminUserItem[] = (users || []).map((u) => {
    const artisanProfiles = u.artisan_profiles;
    const artisanId = Array.isArray(artisanProfiles)
      ? artisanProfiles[0]?.id
      : (artisanProfiles as { id?: string })?.id || null;

    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role as UserRole,
      location: u.location || "Osogbo, Osun State",
      status: (u.status || "active") as AccountStatus,
      suspension_reason: u.suspension_reason,
      created_at: u.created_at,
      artisan_profile_id: artisanId,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Account Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">User Accounts Directory</h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Monitor client and artisan accounts across Osogbo. Enforce community trust standards through suspension
            or reactivation controls.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-800 text-xs text-neutral-300 shrink-0">
          <Users className="h-4 w-4 text-blue-400" />
          <span>{formattedUsers.length} Registered Accounts</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav
        pendingVerifications={pendingVerifications || 0}
        openReports={openReports || 0}
      />

      {/* Users Table */}
      <AdminUsersTable initialUsers={formattedUsers} currentAdminId={user.id} />
    </div>
  );
}
