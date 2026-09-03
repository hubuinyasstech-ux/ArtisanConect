import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Category } from "@/types/database.types";

export const metadata = {
  title: "Admin Portal — ArtisanConnect",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/dashboard");
  }

  // Verify that the user is actually an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // Non-admin redirect
    redirect("/customer/dashboard");
  }

  // Fetch summary counts
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalArtisans } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "artisan");

  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categoryList: Array<Pick<Category, "name" | "slug" | "description" | "is_active">> =
    categories && categories.length > 0
      ? categories
      : [
          { name: "Plumbing", slug: "plumbing", is_active: true, description: "Pipes and borehole plumbing" },
          { name: "Electrical", slug: "electrical", is_active: true, description: "Wiring and power setup" },
          { name: "Carpentry", slug: "carpentry", is_active: true, description: "Woodwork and roofing" },
          { name: "Painting", slug: "painting", is_active: true, description: "Screeding and painting" },
          { name: "Cleaning", slug: "cleaning", is_active: true, description: "Deep domestic cleaning" },
        ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <Badge variant="danger">Administrator</Badge>
          </div>
          <p className="text-xs text-neutral-400">
            Platform governance, user verification, categories, and marketplace health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-xs text-neutral-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pilot: Osogbo, Osun State</span>
          </div>
        </div>
      </div>

      {/* Role Navigation */}
      <DashboardNav role="admin" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Profiles
            </span>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{totalUsers ?? 0}</p>
          <p className="text-xs text-neutral-500 mt-1">Registered across Nigeria</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Registered Artisans
            </span>
            <Briefcase className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{totalArtisans ?? 0}</p>
          <p className="text-xs text-neutral-500 mt-1">Service providers</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Registered Customers
            </span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{totalCustomers ?? 0}</p>
          <p className="text-xs text-neutral-500 mt-1">Active client accounts</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Service Categories
            </span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{categories?.length ?? 5}</p>
          <p className="text-xs text-neutral-500 mt-1">Foundation categories active</p>
        </Card>
      </div>

      {/* Main Admin Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Manager Overview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Platform Categories</CardTitle>
                <CardDescription>
                  Configured categories for artisan onboarding and customer search
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-neutral-200">
                {categoryList.map((cat) => (
                  <div key={cat.slug} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{cat.name}</p>
                      <p className="text-xs text-neutral-500">{cat.description || "Active trade"}</p>
                    </div>
                    <Badge variant={cat.is_active ? "success" : "default"}>
                      {cat.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Operational Checklist */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pilot Readiness Status</CardTitle>
              <CardDescription>Phase 1 Foundation Verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-neutral-600">
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Role Isolation:</strong> Middleware strictly blocks unauthenticated or
                  unauthorized role crossings.
                </p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Public Registration Safeguard:</strong> Only `customer` or `artisan` can
                  be chosen at public signup.
                </p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>RLS Protection:</strong> Users cannot update other profiles or modify
                  protected records.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
