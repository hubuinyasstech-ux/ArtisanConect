import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminRequestsTable, AdminRequestItem } from "@/components/admin/AdminRequestsTable";
import { ServiceRequestStatus } from "@/types/database.types";
import { Inbox } from "lucide-react";

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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Fulfillment Oversight
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">Marketplace Request Monitor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track service requests submitted by homeowners to artisans in Osogbo. Monitor fulfillment statuses,
            response times, and job completions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <Inbox className="h-4 w-4 text-[#ea580c]" />
          <span className="font-semibold">{formattedRequests.length} Total Bookings Logged</span>
        </div>
      </div>

      {/* Requests Table */}
      <AdminRequestsTable initialRequests={formattedRequests} />
    </div>
  );
}
