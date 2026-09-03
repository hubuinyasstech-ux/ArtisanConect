import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/layout/AdminNav";
import { AdminRequestsTable, AdminRequestItem } from "@/components/admin/AdminRequestsTable";
import { ServiceRequestStatus } from "@/types/database.types";
import { Inbox, MapPin } from "lucide-react";

export const metadata = {
  title: "Request Monitoring — Admin Console",
};

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // Fetch all service requests across the marketplace
  const { data: requests } = await supabase
    .from("service_requests")
    .select(`
      id,
      customer_id,
      artisan_id,
      description,
      location,
      preferred_date,
      status,
      created_at,
      profiles!service_requests_customer_id_fkey (
        full_name,
        email
      ),
      artisan_profiles (
        business_name
      ),
      services (
        title
      )
    `)
    .order("created_at", { ascending: false });

  // Counts for nav badges
  const { count: pendingVerifications } = await supabase
    .from("artisan_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending");

  const { count: openReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const formattedRequests: AdminRequestItem[] = (requests || []).map((req) => {
    const customer = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
    const artisan = Array.isArray(req.artisan_profiles)
      ? req.artisan_profiles[0]
      : req.artisan_profiles;
    const service = Array.isArray(req.services) ? req.services[0] : req.services;

    return {
      id: req.id,
      customer_id: req.customer_id,
      customer_name: customer?.full_name || "Customer",
      customer_email: customer?.email || "",
      artisan_id: req.artisan_id,
      artisan_name: artisan?.business_name || "Artisan",
      service_title: service?.title || "Custom Service Inquiry",
      status: req.status as ServiceRequestStatus,
      location: req.location,
      preferred_date: req.preferred_date,
      created_at: req.created_at,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Fulfillment Oversight
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Marketplace Request Monitor</h1>
          <p className="text-xs text-neutral-400 max-w-2xl">
            Track service requests submitted by homeowners to artisans in Osogbo. Monitor fulfillment statuses,
            response times, and job completions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-800 text-xs text-neutral-300 shrink-0">
          <Inbox className="h-4 w-4 text-[#ea580c]" />
          <span>{formattedRequests.length} Total Bookings Logged</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav
        pendingVerifications={pendingVerifications || 0}
        openReports={openReports || 0}
      />

      {/* Requests Table */}
      <AdminRequestsTable initialRequests={formattedRequests} />
    </div>
  );
}
