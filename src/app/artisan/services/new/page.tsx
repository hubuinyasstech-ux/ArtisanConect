import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ServiceForm } from "@/components/artisan/ServiceForm";

export const metadata = {
  title: "Add New Service — ArtisanConnect",
};

export default async function NewServicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/services/new");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DashboardNav role="artisan" />
      <ServiceForm />
    </div>
  );
}
