import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Trust & Safety Desk
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">User Reports & Dispute Resolution</h1>
          <p className="text-xs text-slate-500 mt-1">
            Investigate reported marketplace violations, safety concerns, and dispute flags. Take disciplinary action,
            suspend fraudulent accounts, or dismiss invalid claims.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="font-semibold">{formattedReports.length} Disciplinary Cases Logged</span>
        </div>
      </div>

      {/* Reports Table */}
      <AdminReportsTable initialReports={formattedReports} />
    </div>
  );
}
