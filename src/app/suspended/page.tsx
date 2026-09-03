import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertOctagon, ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Account Suspended — ArtisanConnect",
};

export default async function SuspendedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let suspensionReason = "Violation of platform terms or community guidelines.";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspension_reason, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.suspension_reason) {
      suspensionReason = profile.suspension_reason;
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-red-200/80 shadow-sm">
        <div className="h-16 w-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#0f2942]">Account Suspended</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your ArtisanConnect account has been temporarily suspended by platform administration.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 text-left text-xs space-y-1 text-red-950">
          <div className="flex items-center gap-1.5 font-bold text-red-900">
            <AlertOctagon className="h-4 w-4 shrink-0 text-red-600" />
            <span>Reason for Suspension:</span>
          </div>
          <p className="text-[11px] leading-relaxed pl-5">{suspensionReason}</p>
        </div>

        <p className="text-xs text-slate-500">
          If you believe this suspension is in error or wish to appeal, please contact the ArtisanConnect
          compliance team in Osogbo.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link href="/auth/signout" className="w-full">
            <Button variant="outline" className="w-full text-xs font-bold gap-1.5">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-xs text-slate-600">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
