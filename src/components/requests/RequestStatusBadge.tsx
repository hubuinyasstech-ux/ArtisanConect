import React from "react";
import { ServiceRequestStatus } from "@/types/database.types";
import { Clock, CheckCircle2, XCircle, AlertCircle, CheckCheck } from "lucide-react";

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className = "" }: RequestStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          <Clock className="h-3 w-3 text-amber-600" />
          <span>Pending</span>
        </span>
      );
    case "accepted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3 text-blue-600" />
          <span>Accepted</span>
        </span>
      );
    case "completed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case "declined":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 ${className}`}
        >
          <XCircle className="h-3 w-3 text-red-600" />
          <span>Declined</span>
        </span>
      );
    case "cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <AlertCircle className="h-3 w-3 text-slate-500" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${className}`}>
          {status}
        </span>
      );
  }
}
