import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatNaira } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Users,
  Layers,
  Inbox,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Platform Analytics — Admin Console",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // 1. User & Account Metrics
  const [
    { count: totalUsers },
    { count: totalCustomers },
    { count: totalArtisans },
    { count: totalSuspended },
    { count: verifiedArtisans },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "artisan"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("artisan_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
  ]);

  // 2. Request Fulfillment Metrics
  const [
    { count: totalRequests },
    { count: pendingRequests },
    { count: acceptedRequests },
    { count: completedRequests },
    { count: declinedRequests },
    { count: cancelledRequests },
  ] = await Promise.all([
    supabase.from("service_requests").select("*", { count: "exact", head: true }),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "declined"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
  ]);

  // 3. Service Category & Pricing Distribution
  const { data: services } = await supabase
    .from("services")
    .select("category, price, is_active, moderation_status");

  const categoryCounts: Record<string, number> = {};
  let totalServiceValue = 0;
  let activeServicesCount = 0;
  let hiddenServicesCount = 0;

  (services || []).forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    totalServiceValue += Number(s.price);
    if (s.is_active) activeServicesCount++;
    if (s.moderation_status === "hidden") hiddenServicesCount++;
  });

  const avgServicePrice =
    services && services.length > 0 ? Math.round(totalServiceValue / services.length) : 0;

  // 4. Review Ratings Distribution
  const { data: reviews } = await supabase.from("reviews").select("rating");

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRatingSum = 0;

  (reviews || []).forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    totalRatingSum += r.rating;
  });

  const totalReviewsCount = reviews?.length || 0;
  const avgRating =
    totalReviewsCount > 0 ? (totalRatingSum / totalReviewsCount).toFixed(1) : "5.0";

  // Calculation of rates
  const reqTotal = totalRequests || 1; // avoid divide-by-zero
  const completionRate = totalRequests ? Math.round(((completedRequests || 0) / reqTotal) * 100) : 0;
  const declineRate = totalRequests ? Math.round(((declinedRequests || 0) / reqTotal) * 100) : 0;
  const cancellationRate = totalRequests ? Math.round(((cancelledRequests || 0) / reqTotal) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
            Marketplace Intelligence
          </span>
          <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">Platform Metrics & Health Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregate data covering supply (artisans & services), demand (client requests & bookings),
            and trust (verification & ratings) across Osogbo.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold">Real-Time Engine Active</span>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-slate-200/90 p-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Job Completion Rate</span>
            <p className="text-2xl font-black text-emerald-600">{completionRate}%</p>
            <p className="text-[11px] text-slate-400">
              {completedRequests || 0} of {totalRequests || 0} requests fulfilled
            </p>
          </div>
        </Card>

        <Card className="rounded-3xl border-slate-200/90 p-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Customer Satisfaction</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-black text-[#0f2942]">{avgRating} / 5.0</span>
            </div>
            <p className="text-[11px] text-slate-400">Based on {totalReviewsCount} verified reviews</p>
          </div>
        </Card>

        <Card className="rounded-3xl border-slate-200/90 p-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Verified Artisan Ratio</span>
            <p className="text-2xl font-black text-blue-600">
              {totalArtisans ? Math.round(((verifiedArtisans || 0) / totalArtisans) * 100) : 0}%
            </p>
            <p className="text-[11px] text-slate-400">
              {verifiedArtisans || 0} of {totalArtisans || 0} vetted
            </p>
          </div>
        </Card>

        <Card className="rounded-3xl border-slate-200/90 p-5 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Avg Service Starting Rate</span>
            <p className="text-2xl font-black text-[#ea580c]">{formatNaira(avgServicePrice)}</p>
            <p className="text-[11px] text-slate-400">Across {services?.length || 0} catalog services</p>
          </div>
        </Card>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Fulfillment Funnel */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#ea580c]" />
              <span>Service Request Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed Jobs
                  </span>
                  <span>{completedRequests || 0} ({completionRate}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-amber-700 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Pending Artisan Response
                  </span>
                  <span>{pendingRequests || 0} ({totalRequests ? Math.round(((pendingRequests || 0) / reqTotal) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${totalRequests ? Math.round(((pendingRequests || 0) / reqTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-blue-700 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Accepted / In Progress
                  </span>
                  <span>{acceptedRequests || 0} ({totalRequests ? Math.round(((acceptedRequests || 0) / reqTotal) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${totalRequests ? Math.round(((acceptedRequests || 0) / reqTotal) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-red-700 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Declined or Cancelled
                  </span>
                  <span>{(declinedRequests || 0) + (cancelledRequests || 0)} ({declineRate + cancellationRate}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${Math.min(100, declineRate + cancellationRate)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Category Breakdown */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Service Category Supply</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No categories recorded.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = services?.length ? Math.round((count / services.length) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700">{cat}</span>
                        <span className="text-slate-500">{count} services ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#0f2942] h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Customer Rating Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-14 font-bold text-slate-700">
                    <span>{star}</span>
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 w-12 text-right">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* User Ecosystem Health */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>User Ecosystem Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Total Registered</span>
                <span className="text-lg font-bold text-[#0f2942]">{totalUsers || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Customer Accounts</span>
                <span className="text-lg font-bold text-[#0f2942]">{totalCustomers || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Artisan Accounts</span>
                <span className="text-lg font-bold text-[#0f2942]">{totalArtisans || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Active Catalog</span>
                <span className="text-lg font-bold text-emerald-600">{activeServicesCount}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Suspended Accounts</span>
                <span className="text-lg font-bold text-red-600">{totalSuspended || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Hidden Services</span>
                <span className="text-lg font-bold text-red-600">{hiddenServicesCount}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Suspended accounts cannot submit or accept requests. Hidden services are excluded from customer searches
              in Osogbo until reviewed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
