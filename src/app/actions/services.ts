"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireArtisan } from "@/lib/auth/admin";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function createService(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, artisanProfile, error: authErr } = await requireArtisan(supabase);

    if (authErr || !user || !artisanProfile) {
      return { error: authErr || "Authentication required to create a service." };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const category = (formData.get("category") as string)?.trim() || "Plumbing";
    const priceStr = formData.get("price") as string;
    const location = (formData.get("location") as string)?.trim() || "Osogbo, Osun State";
    const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";

    if (!title) {
      return { error: "Service title is required." };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return { error: "Please provide a valid starting price." };
    }

    const photoUrl = (formData.get("photo_url") as string)?.trim();
    if (photoUrl && user) {
      await supabase
        .from("profiles")
        .update({ avatar_url: photoUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    const { data: newService, error: insertErr } = await supabase
      .from("services")
      .insert({
        artisan_id: artisanProfile.id,
        title,
        description,
        category,
        price,
        location,
        is_active: isActive,
        moderation_status: "active",
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("Error creating service:", insertErr);
      return { error: insertErr.message };
    }

    revalidatePath("/artisan/services");
    revalidatePath("/artisan/dashboard");
    revalidatePath("/find-artisans");

    return { success: true, data: newService };
  } catch (err: unknown) {
    console.error("Unexpected error in createService:", err);
    return { error: "An unexpected error occurred while creating the service." };
  }
}

export async function updateService(
  serviceId: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, artisanProfile, error: authErr } = await requireArtisan(supabase);

    if (authErr || !user || !artisanProfile) {
      return { error: authErr || "Authentication required." };
    }

    // Check existing service and its moderation status
    const { data: existingService, error: fetchErr } = await supabase
      .from("services")
      .select("id, moderation_status, is_active")
      .eq("id", serviceId)
      .eq("artisan_id", artisanProfile.id)
      .maybeSingle();

    if (fetchErr || !existingService) {
      return { error: "Service not found or you do not have permission to edit it." };
    }

    if (existingService.moderation_status === "hidden") {
      return {
        error:
          "This service has been hidden by platform administrators due to a moderation review. It cannot be edited or republished without admin clearance.",
      };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const category = (formData.get("category") as string)?.trim() || "Plumbing";
    const priceStr = formData.get("price") as string;
    const location = (formData.get("location") as string)?.trim() || "Osogbo, Osun State";
    const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";

    if (!title) {
      return { error: "Service title is required." };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return { error: "Please provide a valid starting price." };
    }

    const photoUrl = (formData.get("photo_url") as string)?.trim();
    if (photoUrl && user) {
      await supabase
        .from("profiles")
        .update({ avatar_url: photoUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    const { error: updateErr } = await supabase
      .from("services")
      .update({
        title,
        description,
        category,
        price,
        location,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId)
      .eq("artisan_id", artisanProfile.id);

    if (updateErr) {
      console.error("Error updating service:", updateErr);
      return { error: updateErr.message };
    }

    revalidatePath("/artisan/services");
    revalidatePath("/artisan/dashboard");
    revalidatePath(`/artisan/services/${serviceId}/edit`);
    revalidatePath("/find-artisans");

    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in updateService:", err);
    return { error: "An unexpected error occurred while updating the service." };
  }
}

export async function toggleServiceStatus(
  serviceId: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, artisanProfile, error: authErr } = await requireArtisan(supabase);

    if (authErr || !user || !artisanProfile) {
      return { error: authErr || "Authentication required." };
    }

    // Verify service and moderation status
    const { data: existingService, error: fetchErr } = await supabase
      .from("services")
      .select("id, moderation_status")
      .eq("id", serviceId)
      .eq("artisan_id", artisanProfile.id)
      .maybeSingle();

    if (fetchErr || !existingService) {
      return { error: "Service not found or unauthorized." };
    }

    if (existingService.moderation_status === "hidden" && isActive) {
      return {
        error:
          "This service has been hidden by platform administrators. You cannot activate a moderated service.",
      };
    }

    const { error: updateErr } = await supabase
      .from("services")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId)
      .eq("artisan_id", artisanProfile.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/artisan/services");
    revalidatePath("/artisan/dashboard");
    revalidatePath("/find-artisans");

    return { success: true };
  } catch {
    return { error: "Failed to toggle service status." };
  }
}

export async function deleteService(serviceId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, artisanProfile, error: authErr } = await requireArtisan(supabase);

    if (authErr || !user || !artisanProfile) {
      return { error: authErr || "Authentication required." };
    }

    const { error: deleteErr } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("artisan_id", artisanProfile.id);

    if (deleteErr) {
      return { error: deleteErr.message };
    }

    revalidatePath("/artisan/services");
    revalidatePath("/artisan/dashboard");
    revalidatePath("/find-artisans");

    return { success: true };
  } catch {
    return { error: "Failed to delete service." };
  }
}
