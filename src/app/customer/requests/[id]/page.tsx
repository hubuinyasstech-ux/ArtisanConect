import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { CustomerCancelRequestButton } from "@/components/requests/CustomerCancelRequestButton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
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
  Star,
  AlertCircle,
  User,
} from "lucide-react";

interface CustomerRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CustomerRequestDetailPageProps) {
  const { id } = await params;
  return {
    title: `Request Details (${id.slice(0, 8)}) — ArtisanConnect`,
  };
}

export default async function CustomerRequestDetailPage({ params }: CustomerRequestDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/customer/requests/${id}`);
  }

  // Fetch request strictly verifying ownership
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
      artisan_profiles (
        id,
        user_id,
        business_name,
        category,
        rating,
        profiles (
          phone,
          avatar_url,
          location
        )
      ),
      services (
        id,
        title,
        price,
        description
      ),
      reviews (
        id,
        rating,
        comment,
        created_at
      )
    `)
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error || !request) {
    notFound();
  }

  const artisan = Array.isArray(request.artisan_profiles)
    ? request.artisan_profiles[0]
    : request.artisan_profiles;

  const artisanUser = artisan
    ? Array.isArray(artisan.profiles)
      ? artisan.profiles[0]
      : artisan.profiles
    : null;

  const service = Array.isArray(request.services) ? request.services[0] : request.services;
  const review = Array.isArray(request.reviews) ? request.reviews[0] : request.reviews;

  const artisanPhone = artisanUser?.phone;
  const whatsappHref = artisanPhone
    ? `https://wa.me/${artisanPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello ${artisan?.business_name}, I'm reaching out regarding Service Request #${id.slice(0, 8)} on ArtisanConnect.`
      )}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/customer/requests"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#ea580c] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to My Requests
        </Link>
      </div>

      {/* Main Request Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                Request #{id.slice(0, 8)}
              </span>
              <RequestStatusBadge status={request.status as ServiceRequestStatus} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0f2942]">
              {service?.title || "Custom Service Request"}
            </h1>
          </div>

          {(request.status === "pending" || request.status === "accepted") && (
            <div>
              <CustomerCancelRequestButton requestId={request.id} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Artisan Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f2942] text-white font-bold text-base">
                {artisan?.business_name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <Link href={`/artisans/${request.artisan_id}`} className="block">
                  <h3 className="text-base font-bold text-[#0f2942] hover:text-[#ea580c] transition-colors">
                    {artisan?.business_name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500">
                  {artisan?.category} • Rating: ★ {Number(artisan?.rating || 5.0).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/artisans/${request.artisan_id}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  <User className="h-3.5 w-3.5 mr-1 text-slate-500" />
                  View Profile
                </Button>
              </Link>

              {artisanPhone && (
                <a href={`tel:${artisanPhone}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Phone className="h-3.5 w-3.5 mr-1 text-[#ea580c]" />
                    Call
                  </Button>
                </a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="primary" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Decline Reason Banner */}
          {request.status === "declined" && request.decline_reason && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="h-4 w-4" />
                <span>Request Declined by Artisan</span>
              </div>
              <p>{request.decline_reason}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#ea580c]" />
                  <span>Job Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <p className="leading-relaxed whitespace-pre-line">{request.description}</p>
                {request.notes && (
                  <div className="pt-2 border-t border-slate-100 text-slate-500">
                    <strong>Special Instructions:</strong> {request.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#ea580c]" />
                  <span>Schedule & Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Date:</strong>{" "}
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
                    <strong>Time:</strong> {request.preferred_time || "Flexible"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Address:</strong> {request.location}
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

          {/* Review Section if Completed */}
          {request.status === "completed" && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-base font-bold text-[#0f2942]">Customer Review</h3>
              {review ? (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-900 ml-1.5">
                        {review.rating} / 5 Stars
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700">
                      Submitted on{" "}
                      {new Date(review.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-slate-800 leading-relaxed italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <ReviewForm requestId={request.id} artisanName={artisan?.business_name || "Artisan"} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
