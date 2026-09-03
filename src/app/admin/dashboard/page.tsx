import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Briefcase,
  Layers,
  Inbox,
  Star,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from "lucide-react";

export const metadata = {
  title: "Platform Overview — Admin Console",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { user, profile, error: adminErr } = await requireAdmin(supabase);

  if (adminErr || !user || !profile) {
    redirect("/customer/dashboard");
  }

  // 1. Fetch KPI Metrics via efficient count queries
  const [
    { count: totalUsers },
    { count: totalCustomers },
    { count: totalArtisans },
    { count: pendingVerifications },
    { count: verifiedArtisans },
    { count: totalActiveServices },
    { count: totalRequests },
    { count: pendingRequests },
    { count: completedRequests },
    { count: totalReviews },
    { count: openReports },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "artisan"),
    supabase.from("artisan_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("artisan_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("service_requests").select("*", { count: "exact", head: true }),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  // 2. Fetch Recent Activities
  const [{ data: recentUsers }, { data: recentRequests }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("service_requests")
      .select(`
        id,
        status,
        created_at,
        location,
        profiles!service_requests_customer_id_fkey (
          full_name
        ),
        artisan_profiles (
          business_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0f2942] tracking-tight">Platform Overview</h1>
            <Badge variant="danger" className="text-[10px] font-bold">
              Administrator
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Marketplace governance, artisan vetting, service moderation, and ecosystem health monitoring across
            Osogbo, Osun State.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 shadow-2xs shrink-0 self-start sm:self-center">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold">Osogbo Pilot Active</span>
        </div>
      </div>

      {/* Action Required Banner if Pending Verifications or Open Reports */}
      {((pendingVerifications || 0) > 0 || (openReports || 0) > 0) && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold">Action Items Awaiting Your Attention</h3>
              <p className="text-xs text-amber-800">
                {pendingVerifications || 0} pending artisan verifications and {openReports || 0} open safety
                reports.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(pendingVerifications || 0) > 0 && (
              <Link href="/admin/verification">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Review Verifications ({pendingVerifications})
                </button>
              </Link>
            )}
            {(openReports || 0) > 0 && (
              <Link href="/admin/reports">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  View Reports ({openReports})
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 10 Core Platform Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Accounts</span>
              <Users className="h-4 w-4 text-[#ea580c]" />
            </div>
            <p className="text-2xl font-black text-[#0f2942]">{totalUsers || 0}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{totalCustomers || 0} clients</span>
              <span>•</span>
              <span>{totalArtisans || 0} trades</span>
            </div>
          </div>
        </Card>

        {/* Artisans & Verification */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Artisans</span>
              <Briefcase className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#0f2942]">{totalArtisans || 0}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{verifiedArtisans || 0} verified</span>
            </div>
          </div>
        </Card>

        {/* Active Services */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Active Services</span>
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#0f2942]">{totalActiveServices || 0}</p>
            <p className="text-[11px] text-slate-400">Published offerings</p>
          </div>
        </Card>

        {/* Total Service Requests */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Bookings</span>
              <Inbox className="h-4 w-4 text-[#ea580c]" />
            </div>
            <p className="text-2xl font-black text-[#0f2942]">{totalRequests || 0}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="text-emerald-600 font-semibold">{completedRequests || 0} done</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{pendingRequests || 0} pending</span>
            </div>
          </div>
        </Card>

        {/* Reviews */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Verified Reviews</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl font-black text-[#0f2942]">{totalReviews || 0}</p>
            <p className="text-[11px] text-slate-400">Customer feedback</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Service Requests */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#ea580c]" />
              <span>Recent Service Bookings</span>
            </CardTitle>
            <Link
              href="/admin/requests"
              className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentRequests || recentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No service requests recorded yet.</p>
            ) : (
              recentRequests.map((req) => {
                const customer = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
                const artisan = Array.isArray(req.artisan_profiles)
                  ? req.artisan_profiles[0]
                  : req.artisan_profiles;

                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#0f2942]">
                        {customer?.full_name || "Customer"} → {artisan?.business_name || "Artisan"}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{req.location}</span>
                        <span>•</span>
                        <span>
                          {new Date(req.created_at).toLocaleDateString("en-NG", {
                            dateStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="default" className="capitalize text-[10px]">
                      {req.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="rounded-3xl border-slate-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-[#0f2942] flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>New Account Registrations</span>
            </CardTitle>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentUsers || recentUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No users found.</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0f2942] flex items-center gap-2">
                      <span>{u.full_name}</span>
                      {u.status === "suspended" && (
                        <span className="text-[9px] font-black uppercase text-red-700 bg-red-100 px-1.5 py-0.2 rounded-full">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </div>
                  <Badge variant={u.role === "artisan" ? "brand" : "default"} className="capitalize text-[10px]">
                    {u.role}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
