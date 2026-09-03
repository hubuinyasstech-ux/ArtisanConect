"use client";

import React, { useState } from "react";
import { submitReport } from "@/app/actions/reports";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  reportedUserId?: string | null;
  serviceId?: string | null;
  requestId?: string | null;
}

const REPORT_REASONS = [
  "Unprofessional conduct or harassment",
  "No-show or abandoned service job",
  "Misleading pricing or unauthorized charges",
  "Fraudulent trade credentials or false identity",
  "Substandard, dangerous, or damaging work",
  "Other trust & safety violation",
];

export function ReportModal({
  isOpen,
  onClose,
  targetTitle,
  reportedUserId,
  serviceId,
  requestId,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await submitReport({
      reported_user_id: reportedUserId || null,
      service_id: serviceId || null,
      request_id: requestId || null,
      reason,
      description: description.trim(),
    });

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setSuccess(false);
      setDescription("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f2942]">Report a Trust & Safety Issue</h3>
              <p className="text-xs text-slate-500">Target: {targetTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-[#0f2942]">Report Submitted</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping ArtisanConnect safe. An administrator will review your report and take appropriate
              moderation action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select Reason for Report:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 bg-white focus:border-[#ea580c] focus:outline-hidden"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Detailed Explanation (What happened?):
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide specific dates, details, or context to help our administrators investigate..."
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400">
                Minimum 10 characters. Reports are reviewed privately by platform compliance staff.
              </p>
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
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={isSubmitting}
                className="text-xs font-bold gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Confidential Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
