"use client";

import React, { useState } from "react";
import { acceptServiceRequest, declineServiceRequest, completeServiceRequest } from "@/app/actions/requests";
import { ServiceRequestStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, XCircle, CheckCheck, Loader2, AlertCircle } from "lucide-react";

interface ArtisanRequestActionsProps {
  requestId: string;
  currentStatus: ServiceRequestStatus;
}

export function ArtisanRequestActions({ requestId, currentStatus }: ArtisanRequestActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);
    const res = await acceptServiceRequest(requestId);
    if (res.error) {
      setError(res.error);
    }
    setIsLoading(false);
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const res = await declineServiceRequest(requestId, declineReason);
    if (res.error) {
      setError(res.error);
    }
    setIsLoading(false);
    setIsDeclining(false);
  };

  const handleComplete = async () => {
    if (!confirm("Are you sure this service has been fully completed?")) return;
    setIsLoading(true);
    setError(null);
    const res = await completeServiceRequest(requestId);
    if (res.error) {
      setError(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentStatus === "pending" && !isDeclining && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleAccept}
            disabled={isLoading}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
            Accept Request
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsDeclining(true)}
            disabled={isLoading}
            className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Decline
          </Button>
        </div>
      )}

      {/* Decline Reason Input Form */}
      {isDeclining && (
        <form onSubmit={handleDecline} className="p-3 rounded-xl bg-red-50/80 border border-red-200 space-y-2 max-w-sm">
          <label className="text-[11px] font-bold text-red-900 block">
            Reason for declining (Optional):
          </label>
          <Input
            type="text"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. Fully booked this week"
            className="text-xs h-8 bg-white"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              variant="danger"
              disabled={isLoading}
              className="text-xs h-7 px-2.5"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Confirm Decline
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsDeclining(false)}
              disabled={isLoading}
              className="text-xs h-7 px-2.5"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {currentStatus === "accepted" && (
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleComplete}
          disabled={isLoading}
          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCheck className="h-3.5 w-3.5 mr-1" />}
          Mark as Completed
        </Button>
      )}
    </div>
  );
}
