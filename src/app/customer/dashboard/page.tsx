import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  User,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Customer Dashboard — ArtisanConnect",
};

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/customer/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || user.user_metadata?.full_name || "Customer";
  const userLocation = profile?.location || "Osogbo, Osun State";

  const categories = [
    { name: "Plumbing", icon: <Wrench className="h-4 w-4" />, slug: "plumbing" },
    { name: "Electrical", icon: <Zap className="h-4 w-4" />, slug: "electrical" },
    { name: "Carpentry", icon: <Hammer className="h-4 w-4" />, slug: "carpentry" },
    { name: "Painting", icon: <Paintbrush className="h-4 w-4" />, slug: "painting" },
    { name: "Cleaning", icon: <Sparkles className="h-4 w-4" />, slug: "cleaning" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {userName}!
            </h1>
            <Badge variant="navy">Customer</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {userLocation}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {profile?.phone || "No phone added"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/find-artisans">
            <Button variant="secondary" size="md" className="font-semibold shadow-xs">
              <Search className="h-4 w-4 mr-2" />
              Find Artisans
            </Button>
          </Link>
          <Link href="/customer/profile">
            <Button variant="outline" size="md" className="text-slate-800">
              <User className="h-4 w-4 mr-2 text-slate-500" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Navigation */}
      <DashboardNav role="customer" />

      {/* Quick Category Discovery */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#0f2942]">Need a Quick Service?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/find-artisans?category=${cat.slug}`}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#ea580c] hover:bg-orange-50/30 transition-all text-sm font-medium text-slate-700 shadow-2xs"
            >
              <span className="p-1.5 rounded-xl bg-slate-100 text-[#0f2942]">
                {cat.icon}
              </span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Service Requests Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Service Requests</CardTitle>
                <CardDescription>Track status of artisans you have contacted</CardDescription>
              </div>
              <Link href="/find-artisans">
                <Button variant="ghost" size="sm" className="text-[#ea580c] hover:text-[#c2410c] text-xs font-semibold">
                  New Request
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {/* Empty state */}
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-neutral-900">No Service Requests Yet</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When you hire an artisan or submit a request, their response and project progress
                    will be tracked right here.
                  </p>
                </div>
                <Link href="/find-artisans">
                  <Button variant="outline" size="sm" className="mt-2">
                    Browse Nearby Artisans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety & Tips for Customers</CardTitle>
              <CardDescription>How to get the best experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-neutral-600">
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Inspect portfolios:</strong> Always review previous project photos on an
                  artisan&apos;s profile before confirming work.
                </p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Agree on pricing first:</strong> Clearly define the scope of work and
                  materials required before work begins.
                </p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Osogbo Local Support:</strong> Support is available for any disputes or
                  unverified artisan concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
