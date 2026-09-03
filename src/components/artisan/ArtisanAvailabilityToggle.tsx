"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvailability } from "@/app/actions/artisan";
import { AvailabilityStatus } from "@/types/database.types";
import { Loader2 } from "lucide-react";

interface ArtisanAvailabilityToggleProps {
  currentStatus: AvailabilityStatus;
}

export function ArtisanAvailabilityToggle({
  currentStatus,
}: ArtisanAvailabilityToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AvailabilityStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (newStatus === status || loading) return;
    setLoading(true);
    setStatus(newStatus);

    try {
      await updateAvailability(newStatus);
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatus(currentStatus); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (status === "available") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (status === "busy") return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getDotColor = () => {
    if (status === "available") return "bg-emerald-500";
    if (status === "busy") return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
        )}
        <span className="capitalize">{status === "available" ? "Available for Work" : status}</span>
      </div>

      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => handleStatusChange("available")}
          disabled={loading}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            status === "available"
              ? "bg-white text-emerald-800 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Available
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("busy")}
          disabled={loading}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            status === "busy"
              ? "bg-white text-amber-800 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Busy
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("offline")}
          disabled={loading}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            status === "offline"
              ? "bg-white text-slate-800 shadow-2xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Offline
        </button>
      </div>
    </div>
  );
}
