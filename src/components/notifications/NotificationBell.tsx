"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { Notification, NotificationType } from "@/types/database.types";
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

interface NotificationBellProps {
  userRole?: string;
}

export function NotificationBell({ userRole = "customer" }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) {
        setNotifications(data as Notification[]);
      }
    } catch {
      // Handled gracefully
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || isCancelled) return;

        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!isCancelled && data) {
          setNotifications(data as Notification[]);
        }
      } catch {
        // Handled gracefully
      }
    }

    loadNotifications();

    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      isCancelled = true;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setIsLoading(false);
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    setIsOpen(false);

    if (notif.related_request_id) {
      const baseRoute = userRole === "artisan" ? "/artisan/requests" : "/customer/requests";
      router.push(`${baseRoute}/${notif.related_request_id}`);
    } else {
      router.push("/notifications");
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "new_request":
        return <CalendarPlus className="h-4 w-4 text-[#ea580c]" />;
      case "request_accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "request_declined":
      case "request_cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "request_completed":
        return <CheckCheck className="h-4 w-4 text-blue-600" />;
      case "new_review":
        return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-[#0f2942] hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ea580c] text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#0f2942]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-[#ea580c]/10 text-[#ea580c] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#0f2942] transition-colors"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark all as read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.is_read ? "hover:bg-slate-50 opacity-80" : "bg-[#ea580c]/5 hover:bg-[#ea580c]/10"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#0f2942] truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-tight">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#0f2942] hover:text-[#ea580c] transition-colors inline-flex items-center gap-1"
            >
              <span>View All Notifications</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
