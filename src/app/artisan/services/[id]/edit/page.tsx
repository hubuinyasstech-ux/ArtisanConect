import React from "react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ServiceForm } from "@/components/artisan/ServiceForm";
import { Service } from "@/types/database.types";

export const metadata = {
  title: "Edit Service — ArtisanConnect",
};

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/artisan/services/${id}/edit`);
  }

  // 1. Get artisan profile
  const { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!artisanProfile) {
    redirect("/artisan/profile");
  }

  // 2. Fetch service and verify ownership
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("artisan_id", artisanProfile.id)
    .single();

  if (!service) {
    notFound();
  }

  // 3. Fetch artisan user profile for photo
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DashboardNav role="artisan" />
      <ServiceForm
        initialService={service as Service}
        initialArtisanPhoto={profile?.avatar_url || null}
        isEditing={true}
      />
    </div>
  );
}
