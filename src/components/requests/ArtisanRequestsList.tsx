"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { ServiceRequestStatus } from "@/types/database.types";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { ArtisanRequestActions } from "@/components/requests/ArtisanRequestActions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle,
  Inbox,
} from "lucide-react";

export interface ArtisanRequestCardData {
  id: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  location: string;
  status: ServiceRequestStatus;
  decline_reason: string | null;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  service_title: string;
  service_price: number | null;
}

interface ArtisanRequestsListProps {
  initialRequests: ArtisanRequestCardData[];
}

export function ArtisanRequestsList({ initialRequests }: ArtisanRequestsListProps) {
  const [filter, setFilter] = useState<string>("all");

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
                filter === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Listing */}
      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-slate-200 bg-white shadow-xs">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
              <Inbox className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-[#0f2942]">No requests in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === "all"
                ? "You haven't received any service requests yet. Make sure your profile is set to 'Available'!"
                : `You currently have zero ${filter} requests.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const whatsappHref = req.customer_phone
              ? `https://wa.me/${req.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello ${req.customer_name}, I'm following up on your service request for "${req.service_title}" on ArtisanConnect.`
                )}`
              : null;

            return (
              <Card
                key={req.id}
                className="rounded-3xl border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200 bg-white overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header: Customer, Service & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f2942] text-white text-[10px] font-bold">
                          {req.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-[#0f2942]">{req.customer_name}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#0f2942] pt-0.5">
                        {req.service_title}
                      </h3>
                    </div>

                    <div className="flex sm:flex-col sm:items-end gap-2 shrink-0">
                      <RequestStatusBadge status={req.status} />
                      {req.service_price !== null && (
                        <span className="text-xs text-slate-500 font-medium">
                          Estimated Rate:{" "}
                          <strong className="text-slate-800">{formatNaira(req.service_price)}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Customer Problem Description:</strong>
                    {req.description}
                  </div>

                  {/* Metadata Row */}
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

                  {/* Decline Reason Banner if Declined */}
                  {req.status === "declined" && req.decline_reason && (
                    <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 text-xs text-red-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                      <span>
                        <strong>Decline Reason Provided:</strong> {req.decline_reason}
                      </span>
                    </div>
                  )}

                  {/* Direct Contact for Accepted/Completed Requests */}
                  {(req.status === "accepted" || req.status === "completed") &&
                    req.customer_phone && (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                          <Phone className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Customer Phone: {req.customer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${req.customer_phone}`}>
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                              Call Now
                            </Button>
                          </a>
                          {whatsappHref && (
                            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Status transition buttons */}
                    <ArtisanRequestActions requestId={req.id} currentStatus={req.status} />

                    <Link href={`/artisan/requests/${req.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Full Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
