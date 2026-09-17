"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { updateArtisanPhoto } from "@/app/actions/artisan";
import {
  ShieldCheck,
  Printer,
  Camera,
  QrCode,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";

export interface ArtisanIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  artisan: {
    id: string;
    business_name: string;
    category: string;
    verification_status: string;
    created_at: string;
    years_experience?: number;
  };
  profile: {
    full_name: string;
    email?: string;
    phone?: string | null;
    avatar_url?: string | null;
    location?: string;
  };
}

export function ArtisanIdCardModal({
  isOpen,
  onClose,
  artisan,
  profile,
}: ArtisanIdCardModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.avatar_url || null);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Derive standardized Nigerian Artisan ID
  const artisanIdCode = `AC-OSG-${artisan.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const isVerified = artisan.verification_status === "verified";
  const createdDate = new Date(artisan.created_at || "2026-01-01T00:00:00Z");
  const memberSinceYear = createdDate.getFullYear();
  const issueDate = createdDate.toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });

  const handleSavePhoto = async (newUrl: string) => {
    try {
      setStatusMessage(null);
      const res = await updateArtisanPhoto(newUrl);
      if (res.success) {
        setPhotoUrl(newUrl);
        setIsUpdatingPhoto(false);
        setStatusMessage("Profile photo updated successfully!");
      } else {
        setStatusMessage(res.error || "Failed to update profile photo.");
      }
    } catch {
      setStatusMessage("An unexpected error occurred while saving photo.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0f2942]">Official Artisan Identification Card</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified digital trade credential for platform operations across Osogbo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* If no photo or user clicked update photo */}
          {(!photoUrl || isUpdatingPhoto) && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    {photoUrl ? "Update ID Card Photograph" : "Photograph Required to Generate ID Card"}
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Upload a clear portrait or headshot. It will be stamped onto your official ArtisanConnect ID card.
                  </p>
                </div>
              </div>

              <ImageUpload
                label="Select or Capture Photo"
                value={photoUrl || ""}
                onChange={(val: string) => {
                  if (val) {
                    handleSavePhoto(val);
                  }
                }}
                helperText="JPEG or PNG under 5MB. Photo will be compressed automatically."
              />

              {photoUrl && isUpdatingPhoto && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUpdatingPhoto(false)}
                  className="text-xs font-semibold"
                >
                  Cancel Photo Update
                </Button>
              )}
            </div>
          )}

          {/* DIGITAL ID CARD PREVIEW (PRINTABLE CONTAINER) */}
          {photoUrl && !isUpdatingPhoto && (
            <div className="flex flex-col items-center justify-center pt-2">
              {/* Printable ID Card Container */}
              <div
                id="artisan-id-card-print-target"
                className="w-full max-w-sm bg-linear-to-b from-[#0a1829] via-[#0f2942] to-[#071320] text-white rounded-3xl p-6 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden select-none"
                style={{
                  boxShadow: "0 20px 40px -15px rgba(15, 41, 66, 0.4)",
                }}
              >
                {/* Security Background Guilloche Accents */}
                <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-linear-to-br from-[#ea580c]/20 to-transparent blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-linear-to-tr from-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

                {/* Holographic Security Strip on Top */}
                <div className="h-1.5 w-full bg-linear-to-r from-[#ea580c] via-amber-400 to-[#ea580c] rounded-full mb-4 shadow-xs" />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-[#ea580c] flex items-center justify-center text-white shadow-md shadow-[#ea580c]/30 font-black text-xs">
                      AC
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold tracking-tight block text-white">
                        ArtisanConnect
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#ea580c] block">
                        Trade Registry ID
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      <MapPin className="h-2.5 w-2.5 text-emerald-400" />
                      Osogbo Pilot
                    </span>
                  </div>
                </div>

                {/* Card Body: Photo & Key Information */}
                <div className="pt-4 pb-3 flex gap-4 items-center">
                  {/* Portrait Photo Frame */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-slate-800 shadow-md relative">
                      <Image
                        src={photoUrl}
                        alt={profile.full_name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                    </div>
                    {isVerified && (
                      <div
                        className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full border-2 border-[#0a1829] shadow-xs"
                        title="Verified Identity"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Artisan Identity Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Artisan Name
                      </span>
                      <h3 className="text-sm font-extrabold text-white truncate leading-tight">
                        {profile.full_name}
                      </h3>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Enterprise / Trade
                      </span>
                      <p className="text-xs font-bold text-[#ea580c] truncate">
                        {artisan.business_name}
                      </p>
                    </div>

                    <div className="pt-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Trade Category
                      </span>
                      <span className="inline-block text-[10px] font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                        {artisan.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ID Number & Security Barcode Segment */}
                <div className="mt-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">
                      Official Artisan ID
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400 tracking-wider">
                      {artisanIdCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-right">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">
                        Status
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                          isVerified
                            ? "text-emerald-300 bg-emerald-950/70 border border-emerald-800/60"
                            : "text-amber-300 bg-amber-950/70 border border-amber-800/60"
                        }`}
                      >
                        {isVerified ? "Verified" : "Registered"}
                      </span>
                    </div>
                    <QrCode className="h-6 w-6 text-slate-400 shrink-0" />
                  </div>
                </div>

                {/* Card Footer: Metadata & Security Watermark */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Issued: {issueDate}
                  </span>
                  <span className="font-mono text-[8px] text-slate-400">
                    MEMBER SINCE {memberSinceYear}
                  </span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handlePrint}
                  className="flex-1 font-bold text-xs gap-2 shadow-md shadow-[#ea580c]/20"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save ID Card</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsUpdatingPhoto(true)}
                  className="font-semibold text-xs gap-1.5"
                >
                  <Camera className="h-4 w-4" />
                  <span>Change Photo</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-specific style tags so printing only outputs the card cleanly */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #artisan-id-card-print-target,
          #artisan-id-card-print-target * {
            visibility: visible !important;
          }
          #artisan-id-card-print-target {
            position: fixed !important;
            left: 50% !important;
            top: 20% !important;
            transform: translate(-50%, -20%) !important;
            width: 320px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
