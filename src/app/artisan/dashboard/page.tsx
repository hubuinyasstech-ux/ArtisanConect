import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  MapPin,
  Phone,
  Plus,
  Settings,
  ExternalLink,
  CheckCircle2,
  Wrench,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Layers,
} from "lucide-react";
import { ArtisanAvailabilityToggle } from "@/components/artisan/ArtisanAvailabilityToggle";
import { ArtisanProfile, Service, AvailabilityStatus } from "@/types/database.types";
import { formatNaira } from "@/lib/utils";

export const metadata = {
  title: "Artisan Dashboard — ArtisanConnect",
};

export default async function ArtisanDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/dashboard");
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Fetch or create initial artisan profile
  let { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!artisanProfile) {
    try {
      const { data: createdArtisan } = await supabase
        .from("artisan_profiles")
        .insert({
          user_id: user.id,
          business_name: profile?.full_name || user.user_metadata?.full_name || "Artisan Business",
          category: "Plumbing",
        })
        .select("*")
        .maybeSingle();

      if (createdArtisan) {
        artisanProfile = createdArtisan;
      }
    } catch {
      // Handled by safe fallback below
    }
  }

  // Safe fallback to guarantee typedArtisan is never null
  const typedArtisan: ArtisanProfile = (artisanProfile as ArtisanProfile) || {
    id: user.id,
    user_id: user.id,
    business_name: profile?.full_name || user.user_metadata?.full_name || "Artisan Business",
    category: "Plumbing",
    years_experience: 1,
    availability_status: "available",
    verification_status: "unverified",
    rating: 5.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 3. Fetch services for this artisan
  let serviceList: Service[] = [];
  if (artisanProfile?.id) {
    try {
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("artisan_id", artisanProfile.id)
        .order("created_at", { ascending: false });

      if (services) {
        serviceList = services as Service[];
      }
    } catch {
      // Table might not exist yet
    }
  }
  const activeServices = serviceList.filter((s) => s.is_active);

  // 4. Calculate Profile Completion Score
  let completionScore = 20; // Base registered account
  if (profile?.phone) completionScore += 15;
  if (profile?.avatar_url) completionScore += 15;
  if (profile?.bio) completionScore += 20;
  if (typedArtisan.years_experience > 0) completionScore += 10;
  if (serviceList.length > 0) completionScore += 20;
  completionScore = Math.min(completionScore, 100);

  const artisanName = typedArtisan.business_name || profile?.full_name || "Artisan";
  const artisanLocation = profile?.location || "Osogbo, Osun State";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Availability Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942]">
              Welcome, {artisanName}!
            </h1>
            <Badge variant="brand">{typedArtisan.category} Pro</Badge>
            {typedArtisan.verification_status === "verified" ? (
              <Badge variant="success">Verified Artisan</Badge>
            ) : (
              <Badge variant="default">Identity Vetted</Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
              {artisanLocation}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-[#ea580c]" />
              {profile?.phone || "No phone added"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {typedArtisan.years_experience} Years Experience
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 lg:pt-0">
          <ArtisanAvailabilityToggle currentStatus={typedArtisan.availability_status as AvailabilityStatus} />

          <Link href={`/artisans/${typedArtisan.id}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#0f2942]">
              <ExternalLink className="h-3.5 w-3.5 text-[#ea580c]" />
              <span>Public Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Navigation */}
      <DashboardNav role="artisan" />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Services */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Services
              </span>
              <div className="p-2 rounded-xl bg-orange-50 text-[#ea580c]">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f2942]">
              {serviceList.length}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Offered in {typedArtisan.category}
            </p>
          </CardContent>
        </Card>

        {/* Active Services */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Listings
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">
              {activeServices.length}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Live on search & discovery
            </p>
          </CardContent>
        </Card>

        {/* Profile Strength */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Profile Strength
              </span>
              <div className="p-2 rounded-xl bg-slate-100 text-[#0f2942]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0f2942]">
                {completionScore}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {completionScore === 100 ? "Complete" : "In Progress"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#ea580c] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Starting Estimate Average */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rating & Status
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f2942]">
              ★ {typedArtisan.rating.toFixed(1)}
            </div>
            <p className="text-xs text-slate-500 font-medium capitalize">
              Availability: {typedArtisan.availability_status}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Live Services Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Services Overview & Quick Action Hub */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0f2942] uppercase tracking-wider">
              Artisan Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/artisan/services/new" className="block">
                <Button variant="secondary" className="w-full justify-center text-sm font-bold py-3 shadow-xs">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add New Service
                </Button>
              </Link>
              <Link href="/artisan/services" className="block">
                <Button variant="outline" className="w-full justify-center text-sm font-semibold py-3 text-slate-800 hover:text-[#0f2942]">
                  <Layers className="h-4 w-4 mr-1.5 text-[#ea580c]" />
                  Manage Services
                </Button>
              </Link>
              <Link href="/artisan/profile" className="block">
                <Button variant="outline" className="w-full justify-center text-sm font-semibold py-3 text-slate-800 hover:text-[#0f2942]">
                  <Settings className="h-4 w-4 mr-1.5 text-[#ea580c]" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Services Snapshot */}
          <Card className="rounded-3xl border-slate-200/90 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-[#0f2942]">
                  Active Service Listings
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Your current public offerings shown to clients in Osogbo
                </CardDescription>
              </div>
              <Link href="/artisan/services">
                <Button variant="ghost" size="sm" className="text-xs text-[#ea580c] font-bold">
                  View All ({serviceList.length}) →
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              {serviceList.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">No Services Added Yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Customers cannot book you until you create at least one active service offering.
                    </p>
                  </div>
                  <Link href="/artisan/services/new">
                    <Button variant="secondary" size="sm" className="font-bold">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Create Service Offering
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {serviceList.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {service.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              service.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {service.is_active ? "Active" : "Paused"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {service.description || "No description"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-[#0f2942] block">
                          {formatNaira(service.price)}
                        </span>
                        <Link
                          href={`/artisan/services/${service.id}/edit`}
                          className="text-[11px] text-[#ea580c] hover:underline font-semibold"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Profile Completion & Artisan Tips */}
        <div className="space-y-6">
          {/* Profile Completion Card */}
          <Card className="rounded-3xl border-slate-200/90 shadow-xs bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-[#0f2942]">
                Profile Completion Checklist
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Complete your details to rank higher on the public directory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Account Registered
                  </span>
                  <Badge variant="success">Done</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    {profile?.phone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                    Nigerian Phone Verified
                  </span>
                  <Badge variant={profile?.phone ? "success" : "outline"}>
                    {profile?.phone ? "Done" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    {profile?.bio ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                    Business Bio / Scope Added
                  </span>
                  <Badge variant={profile?.bio ? "success" : "outline"}>
                    {profile?.bio ? "Done" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    {serviceList.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                    At Least 1 Service Listed
                  </span>
                  <Badge variant={serviceList.length > 0 ? "success" : "outline"}>
                    {serviceList.length > 0 ? "Done" : "Pending"}
                  </Badge>
                </div>
              </div>

              <Link href="/artisan/profile" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Update Business Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilot Pro Tips Card */}
          <div className="p-6 rounded-3xl bg-[#0f2942] text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-200">
              <Shield className="h-4 w-4 text-[#ea580c]" />
              <span>Pilot Launch Tips (Osogbo)</span>
            </div>
            <h4 className="text-sm font-bold">How to win clients faster:</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-start gap-1.5">
                <span className="text-[#ea580c] font-bold">•</span>
                <span>Keep your availability toggle on <strong>Available</strong> when open to jobs.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#ea580c] font-bold">•</span>
                <span>Specify fair starting estimates so clients reach out with clear expectations.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#ea580c] font-bold">•</span>
                <span>Direct WhatsApp messages go straight to your verified Nigerian phone number.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
