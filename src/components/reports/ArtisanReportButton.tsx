"use client";

import React, { useState } from "react";
import { ReportModal } from "@/components/reports/ReportModal";
import { Flag } from "lucide-react";

interface ArtisanReportButtonProps {
  artisanId: string;
  artisanUserId: string;
  businessName: string;
}

export function ArtisanReportButton({
  artisanId,
  artisanUserId,
  businessName,
}: ArtisanReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium py-1"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report this artisan profile</span>
      </button>

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetTitle={businessName}
        reportedUserId={artisanUserId}
      />
    </>
  );
}
