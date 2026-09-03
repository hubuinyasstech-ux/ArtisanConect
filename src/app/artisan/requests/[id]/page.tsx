import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { ArtisanRequestActions } from "@/components/requests/ArtisanRequestActions";
import { ServiceRequestStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface ArtisanRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArtisanRequestDetailPageProps) {
  const { id } = await params;
  return {
    title: `Incoming Request (${id.slice(0, 8)}) — ArtisanConnect`,
  };
}

export default async function ArtisanRequestDetailPage({ params }: ArtisanRequestDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/artisan/requests/${id}`);
  }

  // 1. Get artisan profile
  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!artisanProfile) {
    notFound();
  }

  // 2. Fetch request strictly verifying artisan ownership
  const { data: request, error } = await supabase
    .from("service_requests")
    .select(`
      id,
      customer_id,
      artisan_id,
      service_id,
      description,
      preferred_date,
      preferred_time,
      location,
      notes,
      status,
      decline_reason,
      created_at,
      updated_at,
      profiles (
        full_name,
        phone,
        location,
        avatar_url
      ),
      services (
        id,
        title,
        price,
        description
      )
    `)
    .eq("id", id)
    .eq("artisan_id", artisanProfile.id)
    .maybeSingle();

  if (error || !request) {
    notFound();
  }

  const customer = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;
  const service = Array.isArray(request.services) ? request.services[0] : request.services;

  const customerPhone = customer?.phone;
  const whatsappHref = customerPhone
    ? `https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello ${customer?.full_name || "Customer"}, I'm following up on your service request #${id.slice(
          0,
          8
        )} for "${service?.title || "service"}" on ArtisanConnect.`
      )}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/artisan/requests"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#ea580c] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Incoming Requests
        </Link>
      </div>

      {/* Main Request Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                Booking #{id.slice(0, 8)}
              </span>
              <RequestStatusBadge status={request.status as ServiceRequestStatus} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0f2942]">
              {service?.title || "Custom Job Request"}
            </h1>
          </div>

          <ArtisanRequestActions requestId={request.id} currentStatus={request.status as ServiceRequestStatus} />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Customer Overview Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f2942] text-white font-bold text-base">
                {customer?.full_name?.charAt(0).toUpperCase() || "C"}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">{customer?.full_name || "Prospective Client"}</h3>
                <p className="text-xs text-slate-500">
                  {customer?.location || request.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {customerPhone ? (
                <>
                  <a href={`tel:${customerPhone}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Phone className="h-3.5 w-3.5 mr-1 text-[#ea580c]" />
                      Call Customer
                    </Button>
                  </a>
                  {whatsappHref && (
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="primary" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">Phone number not provided</span>
              )}
            </div>
          </div>

          {/* Decline Reason if Declined */}
          {request.status === "declined" && request.decline_reason && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="h-4 w-4" />
                <span>You Declined this Request</span>
              </div>
              <p>Reason: {request.decline_reason}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#ea580c]" />
                  <span>Scope of Work</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <p className="leading-relaxed whitespace-pre-line">{request.description}</p>
                {request.notes && (
                  <div className="pt-2 border-t border-slate-100 text-slate-500">
                    <strong>Customer Special Instructions:</strong> {request.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#ea580c]" />
                  <span>Service Schedule & Site</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Requested Date:</strong>{" "}
                    {request.preferred_date
                      ? new Date(request.preferred_date).toLocaleDateString("en-NG", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Flexible"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Preferred Time:</strong> {request.preferred_time || "Flexible"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Location:</strong> {request.location}
                  </span>
                </div>
                {service?.price !== undefined && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">Starting Labor Estimate:</span>
                    <strong className="text-sm text-[#0f2942]">{formatNaira(service.price)}</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
