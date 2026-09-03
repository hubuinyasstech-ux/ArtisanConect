import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ArtisanVerificationForm } from "@/components/artisan/ArtisanVerificationForm";
import { VerificationStatus } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/Card";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Users,
  Building,
} from "lucide-react";

export const metadata = {
  title: "Identity Verification — ArtisanConnect",
  description: "Verify your trade credentials and local presence in Osogbo to earn customer trust.",
};

export default async function ArtisanVerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/verification");
  }

  // Get artisan profile
  const { data: artisan } = await supabase
    .from("artisan_profiles")
    .select(`
      id,
      business_name,
      category,
      verification_status,
      verification_notes,
      verification_requested_at,
      verification_reviewed_at,
      profiles (
        location,
        status
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!artisan) {
    redirect("/artisan/profile");
  }

  const profileLocation =
    Array.isArray(artisan.profiles)
      ? artisan.profiles[0]?.location
      : (artisan.profiles as { location?: string })?.location || "Osogbo, Osun State";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0f2942] text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
              Trust & Safety
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Trade Verification Program</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verified artisans receive priority listing in Osogbo customer searches, an official verified identity badge,
            and up to 3x higher booking rates.
          </p>
        </div>
        <ShieldCheck className="absolute -right-6 -bottom-6 h-48 w-48 text-white/5 pointer-events-none" />
      </div>

      {/* Navigation */}
      <DashboardNav role="artisan" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form / Status */}
        <div className="lg:col-span-2 space-y-6">
          <ArtisanVerificationForm
            status={artisan.verification_status as VerificationStatus}
            notes={artisan.verification_notes}
            requestedAt={artisan.verification_requested_at}
            reviewedAt={artisan.verification_reviewed_at}
            businessName={artisan.business_name}
            category={artisan.category}
            location={profileLocation}
          />
        </div>

        {/* Right Col: Guidelines & Requirements */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200/90 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#ea580c]" />
                <span>Verification Standards</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                To protect Osogbo homeowners and businesses, ArtisanConnect checks:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Operating Location:</strong> Clear workshop, garage, or operating base in Osun State.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Trade Proficiency:</strong> Documented years of hands-on experience or trade affiliation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Contact:</strong> Accessible Nigerian telephone and WhatsApp number for customers.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-slate-50 border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-[#0f2942] flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Need Support?</span>
              </h4>
              <p className="leading-relaxed text-[11px]">
                Have questions about submitting apprenticeship certificates or guild registration? Contact our platform team
                directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
