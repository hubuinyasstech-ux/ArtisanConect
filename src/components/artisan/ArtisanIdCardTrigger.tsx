"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { IdCard, ShieldCheck, Camera } from "lucide-react";
import { ArtisanIdCardModal } from "@/components/artisan/ArtisanIdCardModal";

export interface ArtisanIdCardTriggerProps {
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

export function ArtisanIdCardTrigger({
  artisan,
  profile,
}: ArtisanIdCardTriggerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const artisanIdCode = `AC-OSG-${artisan.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const hasPhoto = Boolean(profile.avatar_url);

  return (
    <>
      <Card className="rounded-3xl border-slate-200/90 shadow-xs bg-linear-to-r from-slate-900 via-[#0f2942] to-slate-900 text-white overflow-hidden relative">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ea580c]/10 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-5 sm:p-6 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left info */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#ea580c]/30">
              <IdCard className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/20 px-2 py-0.5 rounded-full">
                  Official Trade Credential
                </span>
                <span className="text-xs font-mono font-extrabold text-amber-300">
                  ID: {artisanIdCode}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">
                ArtisanConnect Digital ID Card
              </h3>

              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Generate and print your official verification credential with your verified name (
                <span className="font-semibold text-white">{profile.full_name}</span>), trade category,
                and photograph for client trust across Osogbo.
              </p>

              <div className="pt-1 flex items-center gap-2">
                {hasPhoto ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Portrait photograph active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                    <Camera className="h-3.5 w-3.5 text-amber-400" />
                    Upload your photo to complete ID card
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right action button */}
          <div className="shrink-0 w-full md:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalOpen(true)}
              className="w-full md:w-auto font-bold text-xs gap-2 shadow-md shadow-[#ea580c]/20"
            >
              <IdCard className="h-4 w-4" />
              <span>{hasPhoto ? "View & Generate ID Card" : "Upload Photo & Generate ID"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ID Card Modal */}
      <ArtisanIdCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        artisan={artisan}
        profile={profile}
      />
    </>
  );
}
