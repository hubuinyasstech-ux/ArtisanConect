"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { Notification, NotificationType } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Bell,
  CheckCheck,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Star,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface NotificationsCenterProps {
  initialNotifications: Notification[];
  userRole: string;
}

export function NotificationsCenter({ initialNotifications, userRole }: NotificationsCenterProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const handleMarkAll = async () => {
    setIsLoading(true);
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setIsLoading(false);
  };

  const handleMarkSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleNavigate = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    if (notif.related_request_id) {
      const base = userRole === "artisan" ? "/artisan/requests" : "/customer/requests";
      router.push(`${base}/${notif.related_request_id}`);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "new_request":
        return <CalendarPlus className="h-5 w-5 text-[#ea580c]" />;
      case "request_accepted":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case "request_declined":
      case "request_cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "request_completed":
        return <CheckCheck className="h-5 w-5 text-blue-600" />;
      case "new_review":
        return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-[#0f2942] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "unread"
                ? "bg-[#0f2942] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAll}
            disabled={isLoading}
            className="text-xs font-semibold self-start sm:self-auto"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <CheckCheck className="h-3.5 w-3.5 mr-1.5" />}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-slate-200 bg-white shadow-xs">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
              <Bell className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-[#0f2942]">No notifications to display</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === "unread"
                ? "You're all caught up! There are no unread notifications."
                : "You have not received any notifications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleNavigate(notif)}
              className={`rounded-2xl border transition-all duration-150 cursor-pointer overflow-hidden ${
                notif.is_read
                  ? "bg-white border-slate-200/80 hover:border-slate-300 opacity-80"
                  : "bg-[#ea580c]/5 border-[#ea580c]/30 hover:border-[#ea580c]/60 shadow-xs"
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-2xs border border-slate-100 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-[#0f2942]">{notif.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notif.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {notif.related_request_id ? (
                      <span className="text-xs font-bold text-[#0f2942] hover:text-[#ea580c] inline-flex items-center gap-1">
                        View Service Request <ExternalLink className="h-3 w-3" />
                      </span>
                    ) : <span />}

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkSingle(notif.id, e)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
