import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";
import { Notification } from "@/types/database.types";
import { Bell } from "lucide-react";

export const metadata = {
  title: "Notifications — ArtisanConnect",
  description: "Stay updated on service requests, artisan acceptances, and reviews.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/notifications");
  }

  const userRole = user.user_metadata?.role || "customer";

  let notifications: Notification[] = [];
  try {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      notifications = data as Notification[];
    }
  } catch {
    // Handled gracefully
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f2942] text-white">
          <Bell className="h-6 w-6 text-[#ea580c]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f2942]">Notifications</h1>
          <p className="text-xs text-slate-500">
            Real-time activity updates for your service bookings and reviews.
          </p>
        </div>
      </div>

      {/* Notifications Hub */}
      <NotificationsCenter initialNotifications={notifications} userRole={userRole} />
    </div>
  );
}
