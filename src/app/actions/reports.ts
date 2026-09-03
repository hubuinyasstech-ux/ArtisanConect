"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth/admin";

export interface CreateReportPayload {
  reported_user_id?: string | null;
  service_id?: string | null;
  request_id?: string | null;
  reason: string;
  description: string;
}

export interface ReportActionResponse {
  success?: boolean;
  error?: string;
  data?: { reportId: string };
}

/**
 * Submits a trust & safety flag/report.
 * Validates reporter is an active authenticated user and enforces database target constraint.
 */
export async function submitReport(
  payload: CreateReportPayload
): Promise<ReportActionResponse> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "Authentication required to submit a report." };
    }

    const { reported_user_id, service_id, request_id, reason, description } = payload;

    // Must have at least one valid target entity
    if (!reported_user_id && !service_id && !request_id) {
      return {
        error: "A valid report target (artisan, service, or booking) must be specified.",
      };
    }

    if (!reason?.trim()) {
      return { error: "Please select a reason for this report." };
    }

    if (!description?.trim() || description.trim().length < 10) {
      return {
        error: "Please provide a detailed description (at least 10 characters) explaining the concern.",
      };
    }

    // Insert report into database
    const { data: report, error: insertErr } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        reported_user_id: reported_user_id || null,
        service_id: service_id || null,
        request_id: request_id || null,
        reason: reason.trim(),
        description: description.trim(),
        status: "open",
      })
      .select("id")
      .single();

    if (insertErr || !report) {
      console.error("Error inserting report:", insertErr);
      return { error: insertErr?.message || "Failed to submit report." };
    }

    // Safely notify active platform administrators
    try {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("status", "active");

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin) => ({
          user_id: admin.id,
          title: "New Safety Report Filed",
          message: `A new platform report (${reason.trim()}) was filed for review by an administrator.`,
          type: "report_submitted" as const,
          is_read: false,
        }));

        await supabase.from("notifications").insert(notifications);
      }
    } catch {
      // Non-blocking notification
    }

    revalidatePath("/admin/reports");
    revalidatePath("/admin/dashboard");

    return { success: true, data: { reportId: report.id } };
  } catch (err) {
    console.error("Unexpected error submitting report:", err);
    return { error: "An unexpected error occurred while submitting the report." };
  }
}
