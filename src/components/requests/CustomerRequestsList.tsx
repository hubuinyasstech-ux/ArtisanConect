"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { ServiceRequestStatus } from "@/types/database.types";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { CustomerCancelRequestButton } from "@/components/requests/CustomerCancelRequestButton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
  Star,
  Search,
  User,
} from "lucide-react";

export interface CustomerRequestCardData {
  id: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  location: string;
  status: ServiceRequestStatus;
  decline_reason: string | null;
  created_at: string;
  artisan_id: string;
  artisan_name: string;
  artisan_category: string;
  service_title: string;
  service_price: number | null;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

interface CustomerRequestsListProps {
  initialRequests: CustomerRequestCardData[];
}

export function CustomerRequestsList({ initialRequests }: CustomerRequestsListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);

  const tabs: { label: string; value: string; count: number }[] = [
    { label: "All Requests", value: "all", count: initialRequests.length },
    {
      label: "Pending",
      value: "pending",
      count: initialRequests.filter((r) => r.status === "pending").length,
    },
    {
      label: "Accepted",
      value: "accepted",
      count: initialRequests.filter((r) => r.status === "accepted").length,
    },
    {
      label: "Completed",
      value: "completed",
      count: initialRequests.filter((r) => r.status === "completed").length,
    },
    {
      label: "Declined",
      value: "declined",
      count: initialRequests.filter((r) => r.status === "declined").length,
    },
    {
      label: "Cancelled",
      value: "cancelled",
      count: initialRequests.filter((r) => r.status === "cancelled").length,
    },
  ];

  const filteredRequests = initialRequests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === tab.value
                ? "bg-[#0f2942] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-slate-200 bg-white shadow-xs">
          <CardContent className="space-y-4 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
              <FileText className="h-7 w-7 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0f2942]">No requests found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filter === "all"
                  ? "You haven't requested any services yet. Discover verified artisans in Osogbo to get started!"
                  : `You have no ${filter} requests at the moment.`}
              </p>
            </div>
            {filter === "all" && (
              <Link href="/find-artisans">
                <Button variant="primary" size="sm" className="mt-2 text-xs">
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  Find an Artisan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card
              key={req.id}
              className="rounded-3xl border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200 bg-white overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header: Service, Artisan, and Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                        {req.artisan_category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <Link
                        href={`/artisans/${req.artisan_id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-[#0f2942] underline underline-offset-2 flex items-center gap-1"
                      >
                        {req.artisan_name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942]">{req.service_title}</h3>
                  </div>

                  <div className="flex sm:flex-col sm:items-end gap-2 shrink-0">
                    <RequestStatusBadge status={req.status} />
                    {req.service_price !== null && (
                      <span className="text-xs text-slate-500 font-medium">
                        Starts: <strong className="text-slate-800">{formatNaira(req.service_price)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Scope of work:</strong>
                  {req.description}
                </div>

                {/* Date, Time & Location Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#ea580c] shrink-0" />
                    <span>
                      {req.preferred_date
                        ? new Date(req.preferred_date).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Flexible Date"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#ea580c] shrink-0" />
                    <span>{req.preferred_time || "Any Time"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#ea580c] shrink-0" />
                    <span className="truncate">{req.location}</span>
                  </div>
                </div>

                {/* Decline Reason (if declined) */}
                {req.status === "declined" && req.decline_reason && (
                  <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <strong>Decline Reason:</strong> {req.decline_reason}
                    </div>
                  </div>
                )}

                {/* Completed Review Banner or Form */}
                {req.status === "completed" && (
                  <div className="pt-2">
                    {req.review ? (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span>Your Review ({req.review.rating} / 5 Stars)</span>
                          </div>
                          {req.review.comment && <p className="italic">&ldquo;{req.review.comment}&rdquo;</p>}
                        </div>
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold shrink-0">
                          Reviewed
                        </span>
                      </div>
                    ) : reviewingRequestId === req.id ? (
                      <div className="pt-2">
                        <ReviewForm
                          requestId={req.id}
                          artisanName={req.artisan_name}
                          onSuccess={() => setReviewingRequestId(null)}
                        />
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-emerald-900">Job Completed!</h4>
                          <p className="text-[11px] text-emerald-700">
                            How did {req.artisan_name} perform? Leave a review to help others.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => setReviewingRequestId(req.id)}
                          className="text-xs shrink-0"
                        >
                          <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                          Leave Review
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Requested on{" "}
                    {new Date(req.created_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Customer can cancel if pending or accepted */}
                    {(req.status === "pending" || req.status === "accepted") && (
                      <CustomerCancelRequestButton requestId={req.id} />
                    )}

                    <Link
                      href={`/artisans/${req.artisan_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#ea580c] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#ea580c] transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>View Profile</span>
                    </Link>

                    <Link href={`/customer/requests/${req.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
