"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/admin";

export interface ActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface CreateRequestPayload {
  service_id?: string | null;
  artisan_id: string;
  description: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  location: string;
  notes?: string | null;
}

export async function createServiceRequest(
  payload: CreateRequestPayload
): Promise<ActionResponse<{ requestId: string }>> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "You must be logged in to request a service." };
    }

    const { artisan_id, service_id, description, preferred_date, preferred_time, location, notes } =
      payload;

    if (!description?.trim()) {
      return { error: "A description of the work needed is required." };
    }
    if (!location?.trim()) {
      return { error: "Service location is required." };
    }

    // Validate preferred date is not in the past
    if (preferred_date) {
      const selectedDate = new Date(preferred_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return { error: "Preferred date cannot be in the past." };
      }
    }

    // Check artisan profile exists (safely check UUID format, or fallback to real artisan in DB for demo IDs)
    const isArtisanUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      artisan_id
    );

    let artisan = null;
    if (isArtisanUuid) {
      const { data } = await supabase
        .from("artisan_profiles")
        .select("id, user_id, business_name")
        .eq("id", artisan_id)
        .maybeSingle();
      artisan = data;
    } else {
      // Demo artisan fallback: find a real artisan profile in the database
      const { data: fallbackArtisan } = await supabase
        .from("artisan_profiles")
        .select("id, user_id, business_name")
        .limit(1)
        .maybeSingle();
      artisan = fallbackArtisan;
    }

    if (!artisan) {
      return { error: "Target artisan profile was not found." };
    }

    // Prevent requesting service from one's own profile
    if (artisan.user_id === user.id) {
      return { error: "You cannot submit a service request to your own business profile." };
    }

    // Check service if specified and valid UUID
    const isServiceUuid = service_id
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service_id)
      : false;

    let targetServiceId: string | null = null;
    if (isServiceUuid && service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("id, is_active, artisan_id")
        .eq("id", service_id)
        .maybeSingle();

      if (service && service.is_active) {
        targetServiceId = service.id;
      }
    }

    // Insert service request
    const { data: request, error: insertErr } = await supabase
      .from("service_requests")
      .insert({
        customer_id: user.id,
        artisan_id: artisan.id,
        service_id: targetServiceId,
        description: description.trim(),
        preferred_date: preferred_date || null,
        preferred_time: preferred_time?.trim() || null,
        location: location.trim(),
        notes: notes?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !request) {
      return { error: insertErr?.message || "Failed to create service request." };
    }

    // Create notification for artisan
    try {
      await supabase.from("notifications").insert({
        user_id: artisan.user_id,
        title: "New Service Request",
        message: `You received a new service request from a customer in ${location.trim()}.`,
        type: "new_request",
        is_read: false,
        related_request_id: request.id,
      });
    } catch {
      // Notification failure should not block request submission
    }

    revalidatePath("/customer/requests");
    revalidatePath("/artisan/requests");
    revalidatePath("/notifications");

    return { success: true, data: { requestId: request.id } };
  } catch {
    return { error: "An unexpected error occurred while creating the request." };
  }
}

export async function acceptServiceRequest(requestId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "Authentication required." };
    }

    const { data: artisan } = await supabase
      .from("artisan_profiles")
      .select("id, business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artisan) {
      return { error: "Only registered artisans can accept requests." };
    }

    const { data: request } = await supabase
      .from("service_requests")
      .select("id, status, customer_id, artisan_id")
      .eq("id", requestId)
      .eq("artisan_id", artisan.id)
      .maybeSingle();

    if (!request) {
      return { error: "Request not found or not assigned to you." };
    }

    if (request.status !== "pending") {
      return { error: `Cannot accept a request that is already ${request.status}.` };
    }

    const { error: updateErr } = await supabase
      .from("service_requests")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("artisan_id", artisan.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify customer
    try {
      await supabase.from("notifications").insert({
        user_id: request.customer_id,
        title: "Service Request Accepted",
        message: `${artisan.business_name} accepted your service request!`,
        type: "request_accepted",
        is_read: false,
        related_request_id: requestId,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/artisan/requests");
    revalidatePath(`/artisan/requests/${requestId}`);
    revalidatePath("/customer/requests");
    revalidatePath(`/customer/requests/${requestId}`);
    revalidatePath("/notifications");

    return { success: true };
  } catch {
    return { error: "Failed to accept service request." };
  }
}

export async function declineServiceRequest(
  requestId: string,
  declineReason?: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "Authentication required." };
    }

    const { data: artisan } = await supabase
      .from("artisan_profiles")
      .select("id, business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artisan) {
      return { error: "Only registered artisans can decline requests." };
    }

    const { data: request } = await supabase
      .from("service_requests")
      .select("id, status, customer_id, artisan_id")
      .eq("id", requestId)
      .eq("artisan_id", artisan.id)
      .maybeSingle();

    if (!request) {
      return { error: "Request not found or not assigned to you." };
    }

    if (request.status !== "pending") {
      return { error: `Cannot decline a request that is already ${request.status}.` };
    }

    const reason = declineReason?.trim() || "Artisan is currently unavailable.";

    const { error: updateErr } = await supabase
      .from("service_requests")
      .update({
        status: "declined",
        decline_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("artisan_id", artisan.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify customer
    try {
      await supabase.from("notifications").insert({
        user_id: request.customer_id,
        title: "Service Request Declined",
        message: `${artisan.business_name} declined your service request: "${reason}"`,
        type: "request_declined",
        is_read: false,
        related_request_id: requestId,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/artisan/requests");
    revalidatePath(`/artisan/requests/${requestId}`);
    revalidatePath("/customer/requests");
    revalidatePath(`/customer/requests/${requestId}`);
    revalidatePath("/notifications");

    return { success: true };
  } catch {
    return { error: "Failed to decline service request." };
  }
}

export async function cancelServiceRequest(requestId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "Authentication required." };
    }

    const { data: request } = await supabase
      .from("service_requests")
      .select(`
        id,
        status,
        customer_id,
        artisan_id,
        artisan_profiles (
          user_id
        )
      `)
      .eq("id", requestId)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (!request) {
      return { error: "Request not found or unauthorized." };
    }

    if (request.status !== "pending" && request.status !== "accepted") {
      return { error: `Cannot cancel a request that is ${request.status}.` };
    }

    const { error: updateErr } = await supabase
      .from("service_requests")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("customer_id", user.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify artisan
    const artisanProfiles = request.artisan_profiles;
    const artisanUserId = Array.isArray(artisanProfiles)
      ? artisanProfiles[0]?.user_id
      : (artisanProfiles as { user_id?: string })?.user_id;

    if (artisanUserId) {
      try {
        await supabase.from("notifications").insert({
          user_id: artisanUserId,
          title: "Service Request Cancelled",
          message: "A customer has cancelled their service request.",
          type: "request_cancelled",
          is_read: false,
          related_request_id: requestId,
        });
      } catch {
        // Non-blocking
      }
    }

    revalidatePath("/customer/requests");
    revalidatePath(`/customer/requests/${requestId}`);
    revalidatePath("/artisan/requests");
    revalidatePath(`/artisan/requests/${requestId}`);
    revalidatePath("/notifications");

    return { success: true };
  } catch {
    return { error: "Failed to cancel service request." };
  }
}

export async function completeServiceRequest(requestId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { user, error: authErr } = await requireActiveUser(supabase);

    if (authErr || !user) {
      return { error: authErr || "Authentication required." };
    }

    const { data: artisan } = await supabase
      .from("artisan_profiles")
      .select("id, business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artisan) {
      return { error: "Only registered artisans can complete requests." };
    }

    const { data: request } = await supabase
      .from("service_requests")
      .select("id, status, customer_id, artisan_id")
      .eq("id", requestId)
      .eq("artisan_id", artisan.id)
      .maybeSingle();

    if (!request) {
      return { error: "Request not found or not assigned to you." };
    }

    if (request.status !== "accepted") {
      return {
        error: `Only accepted requests can be marked as completed. Current status: ${request.status}.`,
      };
    }

    const { error: updateErr } = await supabase
      .from("service_requests")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("artisan_id", artisan.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // Notify customer
    try {
      await supabase.from("notifications").insert({
        user_id: request.customer_id,
        title: "Service Completed",
        message: `${artisan.business_name} marked your service request as completed. Please take a moment to leave a review!`,
        type: "request_completed",
        is_read: false,
        related_request_id: requestId,
      });
    } catch {
      // Non-blocking
    }

    revalidatePath("/artisan/requests");
    revalidatePath(`/artisan/requests/${requestId}`);
    revalidatePath("/customer/requests");
    revalidatePath(`/customer/requests/${requestId}`);
    revalidatePath("/notifications");

    return { success: true };
  } catch {
    return { error: "Failed to mark service as completed." };
  }
}
