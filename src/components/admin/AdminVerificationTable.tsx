"use client";

import React, { useState } from "react";
import Link from "next/link";
import { approveArtisanVerification, rejectArtisanVerification } from "@/app/actions/admin";
import { VerificationStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";

export interface AdminArtisanVerificationItem {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  years_experience: number;
  location: string;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  verification_requested_at: string | null;
  verification_reviewed_at: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
}

interface AdminVerificationTableProps {
  initialArtisans: AdminArtisanVerificationItem[];
}

export function AdminVerificationTable({ initialArtisans }: AdminVerificationTableProps) {
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [activeModal, setActiveModal] = useState<{
    type: "approve" | "reject";
    artisan: AdminArtisanVerificationItem;
  } | null>(null);

  const [reviewNote, setReviewNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredArtisans = initialArtisans.filter((a) => {
    if (filter === "all") return true;
    return a.verification_status === filter;
  });

  const pendingCount = initialArtisans.filter((a) => a.verification_status === "pending").length;

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    setIsProcessing(true);
    setError(null);

    const res = await approveArtisanVerification(activeModal.artisan.id, reviewNote);
    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
    setReviewNote("");
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    if (!reviewNote.trim()) {
      setError("Please provide a reason explaining why the verification was rejected.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res = await rejectArtisanVerification(activeModal.artisan.id, reviewNote);
    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
    setReviewNote("");
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            filter === "pending"
              ? "bg-[#ea580c] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>Pending Review</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filter === "pending" ? "bg-white text-[#ea580c]" : "bg-red-500 text-white"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter("verified")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === "verified"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Verified
        </button>

        <button
          type="button"
          onClick={() => setFilter("rejected")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === "rejected"
              ? "bg-red-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Rejected
        </button>

        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === "all"
              ? "bg-[#0f2942] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Artisans ({initialArtisans.length})
        </button>
      </div>

      {/* Artisans List */}
      {filteredArtisans.length === 0 ? (
        <Card className="rounded-3xl border-slate-200 p-12 text-center">
          <CardContent className="space-y-2 p-0">
            <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#0f2942]">No verification requests</h3>
            <p className="text-xs text-slate-500">
              There are no artisan profiles currently matching the selected filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredArtisans.map((artisan) => (
            <Card
              key={artisan.id}
              className="rounded-3xl border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[#0f2942]">
                        {artisan.business_name}
                      </span>
                      <Badge variant="default" className="text-[10px]">
                        {artisan.category}
                      </Badge>
                      {artisan.verification_status === "verified" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                      {artisan.verification_status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="h-3 w-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {artisan.verification_status === "rejected" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <XCircle className="h-3 w-3 text-red-600" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
                        {artisan.location}
                      </span>
                      <span>•</span>
                      <span>Owner: {artisan.owner_name} ({artisan.owner_email})</span>
                      <span>•</span>
                      <span>{artisan.years_experience} Years Experience</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/artisans/${artisan.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#ea580c] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Profile</span>
                    </Link>

                    {artisan.verification_status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setActiveModal({ type: "approve", artisan });
                            setReviewNote("Verified based on trade credential and local operating base in Osogbo.");
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveModal({ type: "reject", artisan });
                            setReviewNote("");
                          }}
                          className="text-xs text-red-600 hover:bg-red-50 border-red-200 font-bold"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {artisan.verification_status === "rejected" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setActiveModal({ type: "approve", artisan });
                          setReviewNote("Re-approved upon review of updated trade details.");
                        }}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Re-Approve
                      </Button>
                    )}
                  </div>
                </div>

                {artisan.verification_notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      {artisan.verification_status === "rejected"
                        ? "Rejection Feedback Reason:"
                        : "Artisan Verification Notes:"}
                    </span>
                    <p className="text-slate-600 leading-relaxed">{artisan.verification_notes}</p>
                  </div>
                )}

                {artisan.verification_requested_at && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Requested:{" "}
                      {new Date(artisan.verification_requested_at).toLocaleDateString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  activeModal.type === "approve"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {activeModal.type === "approve" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">
                  {activeModal.type === "approve"
                    ? "Approve Artisan Verification"
                    : "Reject Verification Request"}
                </h3>
                <p className="text-xs text-slate-500">{activeModal.artisan.business_name}</p>
              </div>
            </div>

            <form
              onSubmit={activeModal.type === "approve" ? handleApproveSubmit : handleRejectSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {activeModal.type === "approve"
                    ? "Approval Review Note (Optional):"
                    : "Rejection Reason (Required):"}
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    activeModal.type === "approve"
                      ? "e.g. Operating location and trade background confirmed."
                      : "e.g. Incomplete workshop address provided. Please specify exact location in Osogbo."
                  }
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-hidden"
                />
              </div>

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
                  onClick={() => {
                    setActiveModal(null);
                    setError(null);
                  }}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={activeModal.type === "approve" ? "primary" : "danger"}
                  size="sm"
                  disabled={isProcessing}
                  className="text-xs font-bold gap-1.5"
                >
                  {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {activeModal.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
