"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireArtisan } from "@/lib/auth/admin";

export interface VerificationActionResponse {
  success?: boolean;
  error?: string;
}

/**
 * Allows an artisan to submit a verification request.
 * Strictly enforces valid transitions: unverified -> pending, or rejected -> pending.
 * Artisans can NEVER set their status directly to verified or rejected.
 */
export async function submitVerificationRequest(
  notes?: string
): Promise<VerificationActionResponse> {
  try {
    const supabase = await createClient();
    const { user, artisanProfile, error: authErr } = await requireArtisan(supabase);

    if (authErr || !user || !artisanProfile) {
      return { error: authErr || "Artisan authentication required." };
    }

    if (artisanProfile.verification_status === "pending") {
      return {
        error: "Your verification request is already submitted and awaiting administrative review.",
      };
    }

    if (artisanProfile.verification_status === "verified") {
      return {
        error: "Your profile has already been verified by ArtisanConnect.",
      };
    }

    // Only unverified or rejected can transition to pending
    const { error: updateErr } = await supabase
      .from("artisan_profiles")
      .update({
        verification_status: "pending",
        verification_notes: notes?.trim() || null,
        verification_requested_at: new Date().toISOString(),
      })
      .eq("id", artisanProfile.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify all active platform administrators
    try {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .eq("status", "active");

      if (admins && admins.length > 0) {
        const notificationsToInsert = admins.map((admin) => ({
          user_id: admin.id,
          title: "New Artisan Verification Request",
          message: `Artisan "${artisanProfile.business_name}" (${artisanProfile.category}) submitted their trade verification for review in Osogbo.`,
          type: "verification_submitted" as const,
          is_read: false,
        }));

        await supabase.from("notifications").insert(notificationsToInsert);
      }
    } catch {
      // Non-blocking notification dispatch
    }

    revalidatePath("/artisan/verification");
    revalidatePath("/artisan/dashboard");
    revalidatePath("/admin/verification");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error submitting verification request:", err);
    return { error: "An unexpected error occurred while submitting your verification request." };
  }
}
