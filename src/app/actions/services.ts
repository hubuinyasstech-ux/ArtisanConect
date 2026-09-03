"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function createService(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Authentication required to create a service." };
    }

    // Get the artisan profile
    const { data: artisanProfile, error: profileErr } = await supabase
      .from("artisan_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !artisanProfile) {
      return {
        error:
          "Please complete your business profile before creating services.",
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Authentication required." };
    }

    // Verify ownership via artisan_profiles
    const { data: artisanProfile } = await supabase
      .from("artisan_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!artisanProfile) {
      return { error: "Unauthorized. Artisan profile not found." };
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Authentication required." };
    }

    const { data: artisanProfile } = await supabase
      .from("artisan_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!artisanProfile) {
      return { error: "Unauthorized." };
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Authentication required." };
    }

    const { data: artisanProfile } = await supabase
      .from("artisan_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!artisanProfile) {
      return { error: "Unauthorized." };
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
