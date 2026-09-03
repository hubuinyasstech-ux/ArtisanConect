"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityStatus } from "@/types/database.types";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function updateAvailability(
  status: AvailabilityStatus
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Authentication required." };
    }

    const { error: updateErr } = await supabase
      .from("artisan_profiles")
      .update({
        availability_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateErr) {
      console.error("Error updating availability:", updateErr);
      return { error: updateErr.message };
    }

    revalidatePath("/artisan/dashboard");
    revalidatePath("/artisan/profile");
    revalidatePath("/find-artisans");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in updateAvailability:", err);
    return { error: "Failed to update availability status." };
  }
}
