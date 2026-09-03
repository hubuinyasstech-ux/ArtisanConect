import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminUsersTable, AdminUserItem } from "@/components/admin/AdminUsersTable";
import { UserRole, AccountStatus } from "@/types/database.types";
import { Users } from "lucide-react";

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Account Governance
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">User Accounts Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor client and artisan accounts across Osogbo. Enforce community trust standards through suspension
            or reactivation controls.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">{formattedUsers.length} Registered Accounts</span>
        </div>
      </div>

      {/* Users Table */}
      <AdminUsersTable initialUsers={formattedUsers} currentAdminId={user.id} />
    </div>
  );
}
