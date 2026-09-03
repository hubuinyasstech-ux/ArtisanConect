import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ArtisanRequestsList, ArtisanRequestCardData } from "@/components/requests/ArtisanRequestsList";
import { ServiceRequestStatus } from "@/types/database.types";

export const metadata = {
  title: "Incoming Service Requests — ArtisanConnect",
  description: "Review, accept, and manage incoming client service bookings in Osogbo.",
};

export default async function ArtisanRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/requests");
  }

  // 1. Get artisan profile
  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  let requestsList: ArtisanRequestCardData[] = [];

  if (artisanProfile) {
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
          profiles (
            full_name,
            phone
          ),
          services (
            id,
            title,
            price
          )
        `)
        .eq("artisan_id", artisanProfile.id)
        .order("created_at", { ascending: false });

      if (requests && requests.length > 0) {
        requestsList = requests.map((req) => {
          const customer = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
          const service = Array.isArray(req.services) ? req.services[0] : req.services;

          return {
            id: req.id,
            description: req.description,
            preferred_date: req.preferred_date,
            preferred_time: req.preferred_time,
            location: req.location,
            status: req.status as ServiceRequestStatus,
            decline_reason: req.decline_reason,
            created_at: req.created_at,
            customer_name: customer?.full_name || "Prospective Client",
            customer_phone: customer?.phone || null,
            service_title: service?.title || "Custom Service Request",
            service_price: service?.price !== undefined ? Number(service.price) : null,
          };
        });
      }
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#0f2942]">Incoming Service Requests</h1>
          <p className="text-xs text-slate-500">
            Accept new jobs, contact customers directly, and complete verified services.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <DashboardNav role="artisan" />

      {/* Requests Directory List */}
      <ArtisanRequestsList initialRequests={requestsList} />
    </div>
  );
}
