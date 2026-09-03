import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminReportsTable, AdminReportItem } from "@/components/admin/AdminReportsTable";
import { ReportStatus } from "@/types/database.types";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Safety Reports & Disputes — Admin Console",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // Fetch all reports
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      id,
      reporter_id,
      reported_user_id,
      service_id,
      request_id,
      reason,
      description,
      status,
      admin_notes,
      created_at,
      profiles!reports_reporter_id_fkey (
        full_name,
        email
      ),
      reported_user:profiles!reports_reported_user_id_fkey (
        full_name
      ),
      services (
        title
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

  const formattedReports: AdminReportItem[] = (reports || []).map((r) => {
    const reporter = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const reportedUser = Array.isArray(r.reported_user)
      ? r.reported_user[0]
      : r.reported_user;
    const service = Array.isArray(r.services) ? r.services[0] : r.services;

    return {
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_name: reporter?.full_name || "Anonymous User",
      reporter_email: reporter?.email || "",
      reported_user_id: r.reported_user_id,
      reported_user_name: reportedUser?.full_name || null,
      service_id: r.service_id,
      service_title: service?.title || null,
      request_id: r.request_id,
      reason: r.reason,
      description: r.description,
      status: r.status as ReportStatus,
      admin_notes: r.admin_notes,
      created_at: r.created_at,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Trust & Safety Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">User Reports & Dispute Resolution</h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Investigate reported marketplace violations, safety concerns, and dispute flags. Take disciplinary action,
            suspend fraudulent accounts, or dismiss invalid claims.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-800 text-xs text-neutral-300 shrink-0">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>{openReports || 0} Open Flags Awaiting Action</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav
        pendingVerifications={pendingVerifications || 0}
        openReports={openReports || 0}
      />

      {/* Reports Table */}
      <AdminReportsTable initialReports={formattedReports} />
    </div>
  );
}
