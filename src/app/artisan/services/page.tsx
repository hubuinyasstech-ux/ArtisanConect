import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatNaira } from "@/lib/utils";
import { Plus, Wrench, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { ServiceItemActions } from "@/components/artisan/ServiceItemActions";
import { Service } from "@/types/database.types";

export const metadata = {
  title: "My Services — ArtisanConnect",
};

export default async function ArtisanServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/artisan/services");
  }

  // 1. Get or provision artisan profile
  let { data: artisanProfile } = await supabase
    .from("artisan_profiles")
    .select("id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!artisanProfile) {
    try {
      const { data: created } = await supabase
        .from("artisan_profiles")
        .insert({
          user_id: user.id,
          business_name: user.user_metadata?.full_name || "Artisan Business",
          category: "Plumbing",
        })
        .select("id, business_name")
        .maybeSingle();

      if (created) artisanProfile = created;
    } catch {
      // Table might not exist yet
    }
  }

  // 2. Fetch services for this artisan
  let serviceList: Service[] = [];
  if (artisanProfile?.id) {
    try {
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("artisan_id", artisanProfile.id)
        .order("created_at", { ascending: false });

      if (services) serviceList = services as Service[];
    } catch {
      // Table might not exist yet
    }
  }

  const activeCount = serviceList.filter((s) => s.is_active).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0f2942]">Service Offerings</h1>
            <Badge variant="brand">{serviceList.length} Listed</Badge>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {activeCount} Active
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Define and manage the specific trade services you provide to customers in Osogbo
          </p>
        </div>

        <Link href="/artisan/services/new">
          <Button variant="secondary" size="md" className="font-bold shadow-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Service
          </Button>
        </Link>
      </div>

      {/* Role Navigation */}
      <DashboardNav role="artisan" />

      {/* Services List or Empty State */}
      {serviceList.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-300 rounded-3xl bg-slate-50/50">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-[#ea580c]">
              <Wrench className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Services Listed Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your first service offering with starting labor estimates so customers in Osogbo
                can discover your craft and reach out directly.
              </p>
            </div>
            <Link href="/artisan/services/new">
              <Button variant="secondary" size="md" className="font-bold px-6">
                <Plus className="h-4 w-4 mr-1.5" />
                Add First Service
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceList.map((service) => (
            <Card
              key={service.id}
              className={`rounded-3xl border transition-all duration-200 hover:shadow-md ${
                service.is_active
                  ? "border-slate-200/90 bg-white"
                  : "border-slate-200/50 bg-slate-50/70 opacity-80"
              }`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="default" className="text-[11px] font-semibold">
                    {service.category}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      service.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {service.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-slate-400" />
                        Paused
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#0f2942] line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {service.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                    <span className="text-base font-extrabold text-[#0f2942]">
                      {formatNaira(service.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <MapPin className="h-3 w-3 text-[#ea580c]" />
                    <span className="line-clamp-1 max-w-[120px]">{service.location}</span>
                  </div>
                </div>

                {/* Client-side actions: Toggle status, Edit, Delete */}
                <ServiceItemActions
                  serviceId={service.id}
                  isActive={service.is_active}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
