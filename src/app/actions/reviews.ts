"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateReviewPayload {
  request_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewActionResponse {
  success?: boolean;
  error?: string;
}

export async function createReview(
  payload: CreateReviewPayload
): Promise<ReviewActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to submit a review." };
    }

    const { request_id, rating, comment } = payload;

    if (!rating || rating < 1 || rating > 5) {
      return { error: "Please provide a valid rating between 1 and 5 stars." };
    }

    // Verify request ownership and completed status
    const { data: request, error: reqErr } = await supabase
      .from("service_requests")
      .select(`
        id,
        status,
        customer_id,
        artisan_id,
        artisan_profiles (
          id,
          user_id,
          business_name
        )
      `)
      .eq("id", request_id)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (reqErr || !request) {
      return { error: "Completed service request not found or unauthorized." };
    }

    if (request.status !== "completed") {
      return { error: "Reviews can only be submitted for completed services." };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("request_id", request_id)
      .maybeSingle();

    if (existingReview) {
      return { error: "You have already submitted a review for this service request." };
    }

    // Insert review
    const { error: insertErr } = await supabase.from("reviews").insert({
      request_id,
      customer_id: user.id,
      artisan_id: request.artisan_id,
      rating: Math.round(rating),
      comment: comment?.trim() || null,
    });

    if (insertErr) {
      return { error: insertErr.message || "Failed to submit review." };
    }

    // Notify artisan
    const artisanProfile = Array.isArray(request.artisan_profiles)
      ? request.artisan_profiles[0]
      : (request.artisan_profiles as { user_id?: string; business_name?: string } | null);

    if (artisanProfile?.user_id) {
      try {
        await supabase.from("notifications").insert({
          user_id: artisanProfile.user_id,
          title: "New Review Received",
          message: `A customer left a ${Math.round(rating)}-star review for your completed service!`,
          type: "new_review",
          is_read: false,
          related_request_id: request_id,
        });
      } catch {
        // Non-blocking
      }
    }

    revalidatePath("/customer/requests");
    revalidatePath(`/customer/requests/${request_id}`);
    revalidatePath(`/artisans/${request.artisan_id}`);
    revalidatePath("/artisan/dashboard");

    return { success: true };
  } catch {
    return { error: "An unexpected error occurred while submitting your review." };
  }
}
