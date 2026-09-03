import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { CustomerRequestsList, CustomerRequestCardData } from "@/components/requests/CustomerRequestsList";
import { ServiceRequestStatus } from "@/types/database.types";

export const metadata = {
  title: "My Service Requests — ArtisanConnect",
  description: "Track and manage your submitted service requests with vetted artisans in Osogbo.",
};

export default async function CustomerRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/customer/requests");
  }

  // Fetch customer's service requests
  let requestsList: CustomerRequestCardData[] = [];

  try {
    const { data: requests } = await supabase
      .from("service_requests")
      .select(`
        id,
        description,
        preferred_date,
        preferred_time,
        location,
        status,
        decline_reason,
        created_at,
        artisan_id,
        artisan_profiles (
          id,
          business_name,
          category
        ),
        services (
          id,
          title,
          price
        ),
        reviews (
          id,
          rating,
          comment
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (requests && requests.length > 0) {
      requestsList = requests.map((req) => {
        const artisan = Array.isArray(req.artisan_profiles)
          ? req.artisan_profiles[0]
          : req.artisan_profiles;
        const service = Array.isArray(req.services) ? req.services[0] : req.services;
        const review = Array.isArray(req.reviews) ? req.reviews[0] : req.reviews;

        return {
          id: req.id,
          description: req.description,
          preferred_date: req.preferred_date,
          preferred_time: req.preferred_time,
          location: req.location,
          status: req.status as ServiceRequestStatus,
          decline_reason: req.decline_reason,
          created_at: req.created_at,
          artisan_id: req.artisan_id,
          artisan_name: artisan?.business_name || "Skilled Artisan",
          artisan_category: artisan?.category || "Plumbing",
          service_title: service?.title || "Custom Service Request",
          service_price: service?.price !== undefined ? Number(service.price) : null,
          review: review
            ? {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
              }
            : null,
        };
      });
    }
  } catch {
    // Handled gracefully if table is not yet migrated
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#0f2942]">My Service Requests</h1>
          <p className="text-xs text-slate-500">
            Monitor progress, communicate with artisans, and review completed projects.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <DashboardNav role="customer" />

      {/* Requests Directory List */}
      <CustomerRequestsList initialRequests={requestsList} />
    </div>
  );
}
