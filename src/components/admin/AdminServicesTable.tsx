"use client";

import React, { useState } from "react";
import Link from "next/link";
import { moderateService } from "@/app/actions/admin";
import { ModerationStatus } from "@/types/database.types";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

export interface AdminServiceItem {
  id: string;
  artisan_id: string;
  business_name: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  location: string;
  is_active: boolean;
  moderation_status: ModerationStatus;
  moderation_reason: string | null;
  moderated_at: string | null;
  created_at: string;
}

interface AdminServicesTableProps {
  initialServices: AdminServiceItem[];
}

export function AdminServicesTable({ initialServices }: AdminServicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [moderationFilter, setModerationFilter] = useState<string>("all");

  const [activeModal, setActiveModal] = useState<{
    service: AdminServiceItem;
    targetStatus: ModerationStatus;
  } | null>(null);

  const [moderationReason, setModerationReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(initialServices.map((s) => s.category)));

  const filteredServices = initialServices.filter((s) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    const matchesModeration = moderationFilter === "all" || s.moderation_status === moderationFilter;

    return matchesSearch && matchesCategory && matchesModeration;
  });

  const handleModerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    if (activeModal.targetStatus === "hidden" && !moderationReason.trim()) {
      setError("Please provide a reason for hiding this service.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res = await moderateService(
      activeModal.service.id,
      activeModal.targetStatus,
      moderationReason
    );

    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
    setModerationReason("");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title, artisan..."
            className="pl-10 text-xs h-10 rounded-2xl bg-white border-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Moderation Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
            {["all", "active", "hidden", "under_review"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModerationFilter(m)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-colors ${
                  moderationFilter === m
                    ? "bg-[#0f2942] text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {m === "all" ? "All Status" : m.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-2xl bg-white border border-slate-200 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Artisan</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Moderation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No services matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-bold text-[#0f2942] block">{service.title}</span>
                        {service.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/artisans/${service.artisan_id}`}
                        target="_blank"
                        className="font-bold text-[#ea580c] hover:underline flex items-center gap-1"
                      >
                        <span>{service.business_name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="default" className="text-[10px]">
                        {service.category}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 font-extrabold text-[#0f2942]">
                      {formatNaira(service.price)}
                    </td>

                    <td className="px-6 py-4">
                      {service.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Eye className="h-3 w-3 text-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <EyeOff className="h-3 w-3 text-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {service.moderation_status === "active" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {service.moderation_status === "hidden" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Hidden
                        </span>
                      )}
                      {service.moderation_status === "under_review" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Under Review
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {service.moderation_status === "hidden" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal({ service, targetStatus: "active" });
                              setModerationReason("");
                              setError(null);
                            }}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal({ service, targetStatus: "hidden" });
                              setModerationReason("");
                              setError(null);
                            }}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1"
                          >
                            <EyeOff className="h-3 w-3" />
                            <span>Hide</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  activeModal.targetStatus === "hidden"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {activeModal.targetStatus === "hidden" ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">
                  {activeModal.targetStatus === "hidden" ? "Hide Service from Catalog" : "Restore Service"}
                </h3>
                <p className="text-xs text-slate-500">{activeModal.service.title}</p>
              </div>
            </div>

            <form onSubmit={handleModerateSubmit} className="space-y-4">
              {activeModal.targetStatus === "hidden" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Reason for Hiding Service (Required):
                  </label>
                  <textarea
                    rows={3}
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="e.g. Misleading pricing or prohibited service description."
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Restoring this service will remove moderation restrictions and allow the artisan to publish and edit
                  it normally.
                </p>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={activeModal.targetStatus === "hidden" ? "danger" : "primary"}
                  size="sm"
                  disabled={isProcessing}
                  className="text-xs font-bold gap-1.5"
                >
                  {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {activeModal.targetStatus === "hidden" ? "Confirm Hide Service" : "Confirm Restore"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
