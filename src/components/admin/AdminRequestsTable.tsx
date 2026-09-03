"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ServiceRequestStatus } from "@/types/database.types";
import { RequestStatusBadge } from "@/components/requests/RequestStatusBadge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  MapPin,
  ExternalLink,
} from "lucide-react";

export interface AdminRequestItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  artisan_id: string;
  artisan_name: string;
  service_title: string;
  status: ServiceRequestStatus;
  location: string;
  preferred_date: string | null;
  created_at: string;
}

interface AdminRequestsTableProps {
  initialRequests: AdminRequestItem[];
}

export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = initialRequests.filter((req) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      req.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.artisan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.service_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID, customer, artisan..."
            className="pl-10 text-xs h-10 rounded-2xl bg-white border-slate-200"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs overflow-x-auto">
          {["all", "pending", "accepted", "completed", "declined", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-[#0f2942] text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {st === "all" ? "All Bookings" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Artisan</th>
                <th className="px-6 py-4">Service Scope</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No service requests matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#ea580c]">
                      #{req.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#0f2942] block">{req.customer_name}</span>
                        <span className="text-[11px] text-slate-400">{req.customer_email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/artisans/${req.artisan_id}`}
                        target="_blank"
                        className="font-bold text-slate-800 hover:text-[#ea580c] flex items-center gap-1"
                      >
                        <span>{req.artisan_name}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {req.service_title}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#ea580c]" />
                        <span>{req.location}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <RequestStatusBadge status={req.status} />
                    </td>

                    <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                      {new Date(req.created_at).toLocaleDateString("en-NG", {
                        dateStyle: "medium",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
