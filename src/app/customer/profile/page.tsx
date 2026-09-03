import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Profile } from "@/types/database.types";

export const metadata = {
  title: "My Profile — ArtisanConnect",
};

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/customer/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Fallback profile object if trigger hasn't fired yet
    const fallbackProfile: Profile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || "",
      email: user.email || "",
      phone: user.user_metadata?.phone || null,
      role: "customer",
      avatar_url: null,
      location: user.user_metadata?.location || "Osogbo, Osun State",
      bio: null,
      status: "active",
      suspension_reason: null,
      suspended_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <DashboardNav role="customer" />
        <ProfileForm initialProfile={fallbackProfile} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DashboardNav role="customer" />
      <ProfileForm initialProfile={profile as Profile} />
    </div>
  );
}
