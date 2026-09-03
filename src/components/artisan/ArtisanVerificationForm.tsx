"use client";

import React, { useState } from "react";
import { submitVerificationRequest } from "@/app/actions/verification";
import { VerificationStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface ArtisanVerificationFormProps {
  status: VerificationStatus;
  notes: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
  businessName: string;
  category: string;
  location: string;
}

export function ArtisanVerificationForm({
  status,
  notes,
  requestedAt,
  reviewedAt,
  businessName,
  category,
  location,
}: ArtisanVerificationFormProps) {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await submitVerificationRequest(submissionNotes);

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
    setIsReapplying(false);
  };

  // 1. VERIFIED STATE
  if (status === "verified") {
    return (
      <Card className="rounded-3xl border-emerald-200 bg-emerald-50/40 shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Artisan
              </div>
              <h2 className="text-xl font-extrabold text-[#0f2942]">Identity & Trade Verified</h2>
              <p className="text-xs text-slate-500">
                Your profile proudly displays the official ArtisanConnect Verified badge across Osogbo.
              </p>
            </div>
          </div>

          {notes && (
            <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-emerald-900 block">Reviewer Notes:</span>
              <p className="text-slate-600">{notes}</p>
            </div>
          )}

          {reviewedAt && (
            <p className="text-[11px] text-slate-400">
              Verified on {new Date(reviewedAt).toLocaleDateString("en-NG", { dateStyle: "long" })}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // 2. PENDING REVIEW STATE
  if (status === "pending" || success) {
    return (
      <Card className="rounded-3xl border-amber-200 bg-amber-50/40 shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-1">
                <Clock className="h-3.5 w-3.5" />
                Under Review
              </div>
              <h2 className="text-xl font-extrabold text-[#0f2942]">Verification In Progress</h2>
              <p className="text-xs text-slate-500">
                Your verification request has been submitted and is currently being reviewed by platform administrators.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <FileText className="h-4 w-4" />
              <span>What happens next?</span>
            </div>
            <p className="leading-relaxed">
              Our vetting team verifies trade experience and local base in Osogbo. You will receive an in-app notification
              once the review is concluded.
            </p>
            {requestedAt && (
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                Submitted on {new Date(requestedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. REJECTED OR UNVERIFIED STATE
  return (
    <div className="space-y-6">
      {status === "rejected" && !isReapplying && (
        <Card className="rounded-3xl border-red-200 bg-red-50/50 shadow-xs overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-900">
              <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold">Verification Request Not Approved</h3>
                <p className="text-xs text-red-700">
                  Your previous verification request was reviewed with the following feedback:
                </p>
              </div>
            </div>

            {notes && (
              <div className="p-4 rounded-2xl bg-white border border-red-200 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-red-900 block">Feedback from Compliance Reviewer:</span>
                <p>{notes}</p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReapplying(true)}
              className="text-xs font-bold gap-1.5 border-red-300 text-red-800 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Submit Updated Verification Details
            </Button>
          </CardContent>
        </Card>
      )}

      {(status === "unverified" || isReapplying) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-3xl border-slate-200/90 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#0f2942] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#ea580c]" />
                <span>Trade & Operating Base Details</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Confirm your business details to request official verification on ArtisanConnect.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Business Name</span>
                  <span className="font-bold text-[#0f2942]">{businessName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Specialization</span>
                  <span className="font-bold text-[#0f2942]">{category}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Primary Area</span>
                  <span className="font-bold text-[#0f2942]">{location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Additional Verification Notes / Operating Workshop Details (Optional)
                </label>
                <textarea
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Located along Station Road, Osogbo. 8 years trade apprenticeship completed with Osun Artisan Association. Workshop open Monday through Saturday."
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-hidden focus:ring-1 focus:ring-[#ea580c]"
                />
                <p className="text-[11px] text-slate-400">
                  Include details such as your workshop landmark, apprenticeship guild affiliation, or references.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                {isReapplying && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReapplying(false)}
                    className="text-xs text-slate-500"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="ml-auto font-bold gap-2 text-xs shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Submit Verification Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
