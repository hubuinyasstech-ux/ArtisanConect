import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ArtisanProfileForm } from "@/components/artisan/ArtisanProfileForm";
import { Profile, ArtisanProfile } from "@/types/database.types";

export const metadata = {
  title: "Artisan Profile — ArtisanConnect",
};

export default async function ArtisanProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/profile");
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile: Profile = (profile as Profile) || {
    id: user.id,
    full_name: user.user_metadata?.full_name || "",
    email: user.email || "",
    phone: user.user_metadata?.phone || null,
    role: "artisan",
    avatar_url: null,
    location: user.user_metadata?.location || "Osogbo, Osun State",
    bio: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. Fetch artisan profile details
  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DashboardNav role="artisan" />
      <ArtisanProfileForm
        initialProfile={userProfile}
        initialArtisanProfile={(artisanProfile as ArtisanProfile) || null}
      />
    </div>
  );
}
