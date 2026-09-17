import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Access Restricted — ArtisanConnect Admin",
  description: "Administrative access restricted.",
};

export default async function AdminUnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const marketplaceUrl =
    process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";

  let dashboardHref = `${marketplaceUrl}/login`;
  let dashboardLabel = "Sign In";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "artisan") {
      dashboardHref = `${marketplaceUrl}/artisan/dashboard`;
      dashboardLabel = "Artisan Dashboard";
    } else {
      dashboardHref = `${marketplaceUrl}/customer/dashboard`;
      dashboardLabel = "Customer Dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-[#070f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a1523] border border-slate-800/90 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full">
            Admin Console Security
          </span>
          <h1 className="text-2xl font-black text-white">Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            You do not have permission to access the ArtisanConnect Administration Console. This area is strictly
            reserved for authorized platform administrators.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <a href={dashboardHref} className="block w-full">
            <Button
              variant="secondary"
              size="md"
              className="w-full font-bold gap-2 text-xs shadow-md shadow-[#ea580c]/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Return to {dashboardLabel}</span>
            </Button>
          </a>

          <a href={marketplaceUrl} className="block w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full text-xs font-semibold text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60 gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Marketplace Home</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
