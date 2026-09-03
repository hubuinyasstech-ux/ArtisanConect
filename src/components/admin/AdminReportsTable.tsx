"use client";

import React, { useState } from "react";
import { resolveReport, dismissReport } from "@/app/actions/admin";
import { ReportStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Layers,
  Inbox,
  Clock,
} from "lucide-react";

export interface AdminReportItem {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reported_user_id: string | null;
  reported_user_name?: string | null;
  service_id: string | null;
  service_title?: string | null;
  request_id: string | null;
  reason: string;
  description: string;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
}

interface AdminReportsTableProps {
  initialReports: AdminReportItem[];
}

export function AdminReportsTable({ initialReports }: AdminReportsTableProps) {
  const [filter, setFilter] = useState<string>("open");
  const [activeModal, setActiveModal] = useState<{
    report: AdminReportItem;
    type: "resolve" | "dismiss";
  } | null>(null);

  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCount = initialReports.filter((r) => r.status === "open").length;

  const filteredReports = initialReports.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    if (!adminNotes.trim()) {
      setError("Please add internal administrative resolution notes.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res =
      activeModal.type === "resolve"
        ? await resolveReport(activeModal.report.id, adminNotes)
        : await dismissReport(activeModal.report.id, adminNotes);

    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
    setAdminNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilter("open")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            filter === "open"
              ? "bg-[#ea580c] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>Open Reports</span>
          {openCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filter === "open" ? "bg-white text-[#ea580c]" : "bg-red-500 text-white"
              }`}
            >
              {openCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter("resolved")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === "resolved"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Resolved
        </button>

        <button
          type="button"
          onClick={() => setFilter("dismissed")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
            filter === "dismissed"
              ? "bg-slate-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Dismissed
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
          All Reports ({initialReports.length})
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="rounded-3xl border-slate-200 p-12 text-center">
          <CardContent className="space-y-2 p-0">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-[#0f2942]">No reports found</h3>
            <p className="text-xs text-slate-500">
              There are no trust & safety flags matching the current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="rounded-3xl border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[#0f2942]">{report.reason}</span>
                      {report.status === "open" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="h-3 w-3 text-amber-600" />
                          Open
                        </span>
                      )}
                      {report.status === "resolved" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Resolved
                        </span>
                      )}
                      {report.status === "dismissed" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Dismissed
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Reported by: <strong>{report.reporter_name}</strong></span>
                      {report.reported_user_name && (
                        <>
                          <span>•</span>
                          <span>Target User: <strong>{report.reported_user_name}</strong></span>
                        </>
                      )}
                      {report.service_title && (
                        <>
                          <span>•</span>
                          <span>Service: <strong>{report.service_title}</strong></span>
                        </>
                      )}
                      {report.request_id && (
                        <>
                          <span>•</span>
                          <span>Booking Ref: <strong>#{report.request_id.slice(0, 8)}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === "open" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setActiveModal({ report, type: "resolve" });
                            setAdminNotes("Investigated and resolved in accordance with community standards.");
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveModal({ report, type: "dismiss" });
                            setAdminNotes("Reviewed and dismissed as unsubstantiated or duplicate.");
                          }}
                          className="text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">Report Description:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{report.description}</p>
                </div>

                {report.admin_notes && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold text-emerald-900 block">Admin Investigation Notes:</span>
                    <p className="text-emerald-800">{report.admin_notes}</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400">
                  Filed on {new Date(report.created_at).toLocaleDateString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  activeModal.type === "resolve"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {activeModal.type === "resolve" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">
                  {activeModal.type === "resolve" ? "Resolve Safety Report" : "Dismiss Report"}
                </h3>
                <p className="text-xs text-slate-500">Issue: {activeModal.report.reason}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Administrative Action & Investigation Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Summarize the action taken, warning issued, or reason for dismissal..."
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
                  onClick={() => setActiveModal(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={activeModal.type === "resolve" ? "primary" : "outline"}
                  size="sm"
                  disabled={isProcessing}
                  className="text-xs font-bold gap-1.5"
                >
                  {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {activeModal.type === "resolve" ? "Confirm Resolution" : "Confirm Dismissal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
