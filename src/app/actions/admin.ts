"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { ModerationStatus } from "@/types/database.types";

export interface AdminActionResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

/**
 * Approves an artisan verification request.
 * Transitions verification_status: pending/unverified/rejected -> verified.
 */
export async function approveArtisanVerification(
  artisanId: string,
  notes?: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized. Administrator privileges required." };
    }

    const { data: artisan, error: fetchErr } = await supabase
      .from("artisan_profiles")
      .select("id, user_id, business_name, verification_status")
      .eq("id", artisanId)
      .maybeSingle();

    if (fetchErr || !artisan) {
      return { error: "Target artisan profile not found." };
    }

    const reviewNotes = notes?.trim() || "Verification requirements satisfied and identity approved.";

    const { error: updateErr } = await supabase
      .from("artisan_profiles")
      .update({
        verification_status: "verified",
        verification_notes: reviewNotes,
        verification_reviewed_at: new Date().toISOString(),
        verification_reviewed_by: adminUser.id,
      })
      .eq("id", artisanId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify artisan of approval
    try {
      await supabase.from("notifications").insert({
        user_id: artisan.user_id,
        title: "Identity Verification Approved 🎉",
        message: `Congratulations! Your business profile "${artisan.business_name}" is now officially verified on ArtisanConnect.`,
        type: "verification_approved",
        is_read: false,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/admin/verification");
    revalidatePath("/admin/dashboard");
    revalidatePath("/artisan/verification");
    revalidatePath("/artisan/dashboard");
    revalidatePath(`/artisans/${artisanId}`);
    revalidatePath("/find-artisans");

    return { success: true };
  } catch (err) {
    console.error("Error approving verification:", err);
    return { error: "An unexpected error occurred while approving verification." };
  }
}

/**
 * Rejects an artisan verification request with feedback reason.
 * Transitions verification_status: pending -> rejected.
 */
export async function rejectArtisanVerification(
  artisanId: string,
  reason: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized. Administrator privileges required." };
    }

    if (!reason?.trim()) {
      return { error: "Please provide a clear reason for rejecting the verification request." };
    }

    const { data: artisan, error: fetchErr } = await supabase
      .from("artisan_profiles")
      .select("id, user_id, business_name")
      .eq("id", artisanId)
      .maybeSingle();

    if (fetchErr || !artisan) {
      return { error: "Target artisan profile not found." };
    }

    const { error: updateErr } = await supabase
      .from("artisan_profiles")
      .update({
        verification_status: "rejected",
        verification_notes: reason.trim(),
        verification_reviewed_at: new Date().toISOString(),
        verification_reviewed_by: adminUser.id,
      })
      .eq("id", artisanId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify artisan of rejection with feedback
    try {
      await supabase.from("notifications").insert({
        user_id: artisan.user_id,
        title: "Verification Request Update",
        message: `Your verification request was reviewed: "${reason.trim()}". You may review the requirements and submit again.`,
        type: "verification_rejected",
        is_read: false,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/admin/verification");
    revalidatePath("/admin/dashboard");
    revalidatePath("/artisan/verification");
    revalidatePath("/artisan/dashboard");
    revalidatePath(`/artisans/${artisanId}`);

    return { success: true };
  } catch (err) {
    console.error("Error rejecting verification:", err);
    return { error: "An unexpected error occurred while rejecting verification." };
  }
}

/**
 * Suspends a user account.
 * Prevents access to protected features and sets account status to 'suspended'.
 */
export async function suspendUser(
  userId: string,
  reason: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized." };
    }

    if (adminUser.id === userId) {
      return { error: "Administrators cannot suspend their own account." };
    }

    if (!reason?.trim()) {
      return { error: "A suspension reason must be provided." };
    }

    const { data: targetProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !targetProfile) {
      return { error: "Target user not found." };
    }

    if (targetProfile.role === "admin") {
      return { error: "Cannot suspend another platform administrator." };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        status: "suspended",
        suspension_reason: reason.trim(),
        suspended_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // If target is an artisan, deactivate their active services to protect customers
    if (targetProfile.role === "artisan") {
      const { data: artisan } = await supabase
        .from("artisan_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (artisan) {
        await supabase
          .from("services")
          .update({ is_active: false })
          .eq("artisan_id", artisan.id);

        await supabase
          .from("artisan_profiles")
          .update({ availability_status: "offline" })
          .eq("id", artisan.id);
      }
    }

    // Notify user of account suspension
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Account Status Notice",
        message: `Your account has been suspended: "${reason.trim()}". Contact support if you believe this is an error.`,
        type: "account_suspended",
        is_read: false,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/find-artisans");

    return { success: true };
  } catch (err) {
    console.error("Error suspending user:", err);
    return { error: "Failed to suspend user." };
  }
}

/**
 * Reactivates a suspended user account.
 */
export async function reactivateUser(userId: string): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized." };
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        status: "active",
        suspension_reason: null,
        suspended_at: null,
      })
      .eq("id", userId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error reactivating user:", err);
    return { error: "Failed to reactivate user." };
  }
}

/**
 * Moderates a service (active, hidden, under_review).
 * When hidden, automatically deactivates is_active.
 */
export async function moderateService(
  serviceId: string,
  status: ModerationStatus,
  reason?: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized." };
    }

    const updatePayload: Record<string, unknown> = {
      moderation_status: status,
      moderation_reason: reason?.trim() || null,
      moderated_at: new Date().toISOString(),
      moderated_by: adminUser.id,
    };

    if (status === "hidden") {
      updatePayload.is_active = false;
    }

    const { error: updateErr } = await supabase
      .from("services")
      .update(updatePayload)
      .eq("id", serviceId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/admin/services");
    revalidatePath("/find-artisans");
    revalidatePath("/artisan/services");

    return { success: true };
  } catch (err) {
    console.error("Error moderating service:", err);
    return { error: "Failed to moderate service." };
  }
}

/**
 * Resolves a reported flag with admin review notes.
 */
export async function resolveReport(
  reportId: string,
  adminNotes: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized." };
    }

    const { data: report, error: fetchErr } = await supabase
      .from("reports")
      .select("id, reporter_id")
      .eq("id", reportId)
      .maybeSingle();

    if (fetchErr || !report) {
      return { error: "Report not found." };
    }

    const { error: updateErr } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        admin_notes: adminNotes.trim(),
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify the reporter that action was taken
    try {
      await supabase.from("notifications").insert({
        user_id: report.reporter_id,
        title: "Report Resolved",
        message: "Thank you for helping keep ArtisanConnect safe. An administrator has investigated and resolved your report.",
        type: "report_resolved",
        is_read: false,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/admin/reports");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error resolving report:", err);
    return { error: "Failed to resolve report." };
  }
}

/**
 * Dismisses a report as invalid or duplicate.
 */
export async function dismissReport(
  reportId: string,
  adminNotes: string
): Promise<AdminActionResponse> {
  try {
    const supabase = await createClient();
    const { user: adminUser, error: authErr } = await requireAdmin(supabase);

    if (authErr || !adminUser) {
      return { error: authErr || "Unauthorized." };
    }

    const { error: updateErr } = await supabase
      .from("reports")
      .update({
        status: "dismissed",
        admin_notes: adminNotes.trim(),
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/admin/reports");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error dismissing report:", err);
    return { error: "Failed to dismiss report." };
  }
}
