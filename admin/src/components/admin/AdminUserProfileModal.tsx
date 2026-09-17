"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdminUserItem } from "@/components/admin/AdminUsersTable";
import { suspendUser, reactivateUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Ban,
  RotateCcw,
  ExternalLink,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface AdminUserProfileModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentAdminId: string;
}

export function AdminUserProfileModal({
  user,
  isOpen,
  onClose,
  currentAdminId,
}: AdminUserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "artisan" | "actions">("overview");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [currentUserStatus, setCurrentUserStatus] = useState<string>(user?.status || "active");
  const [currentSuspensionReason, setCurrentSuspensionReason] = useState<string | null>(
    user?.suspension_reason || null
  );

  if (!isOpen || !user) return null;

  const isSelf = user.id === currentAdminId;
  const isArtisan = user.role === "artisan" && user.artisan_profile;
  const artisanIdCode = user.artisan_profile
    ? `AC-OSG-${user.artisan_profile.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`
    : null;

  const marketplaceUrl = process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) {
      setActionError("Please provide a reason for suspension.");
      return;
    }

    try {
      setIsProcessing(true);
      setActionError(null);
      const res = await suspendUser(user.id, suspensionReason.trim());
      if (res.success) {
        setCurrentUserStatus("suspended");
        setCurrentSuspensionReason(suspensionReason.trim());
        setActionSuccess("User account suspended successfully.");
        setSuspensionReason("");
      } else {
        setActionError(res.error || "Failed to suspend user.");
      }
    } catch {
      setActionError("An unexpected error occurred while suspending user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      const res = await reactivateUser(user.id);
      if (res.success) {
        setCurrentUserStatus("active");
        setCurrentSuspensionReason(null);
        setActionSuccess("User account reactivated successfully.");
      } else {
        setActionError(res.error || "Failed to reactivate user.");
      }
    } catch {
      setActionError("An unexpected error occurred while reactivating user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0a1523] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ea580c]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              {user.avatar_url ? (
                <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 relative shadow-md shrink-0">
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-[#0f2942] border-2 border-slate-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {getInitials(user.full_name)}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "danger"
                        : user.role === "artisan"
                        ? "brand"
                        : "default"
                    }
                    className="capitalize text-[10px] font-bold"
                  >
                    {user.role}
                  </Badge>

                  {currentUserStatus === "suspended" ? (
                    <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Suspended
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active Account
                    </span>
                  )}

                  {artisanIdCode && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-full">
                      ID: {artisanIdCode}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-black text-white tracking-tight">{user.full_name}</h2>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-3 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                activeTab === "overview"
                  ? "bg-[#ea580c] text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Account Overview
            </button>

            {isArtisan && (
              <button
                type="button"
                onClick={() => setActiveTab("artisan")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  activeTab === "artisan"
                    ? "bg-[#ea580c] text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Artisan Trade Profile
              </button>
            )}

            {!isSelf && user.role !== "admin" && (
              <button
                type="button"
                onClick={() => setActiveTab("actions")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  activeTab === "actions"
                    ? "bg-[#ea580c] text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Governance Actions
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {actionSuccess && (
            <Alert variant="success" title="Success">
              {actionSuccess}
            </Alert>
          )}

          {actionError && (
            <Alert variant="error" title="Action Error">
              {actionError}
            </Alert>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Full Name
                  </span>
                  <p className="text-sm font-bold text-[#0f2942] flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    {user.full_name}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Email Address
                  </span>
                  <p className="text-sm font-bold text-[#0f2942] flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {user.email}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Phone Number
                  </span>
                  <p className="text-sm font-bold text-[#0f2942] flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {user.phone || "Not provided"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Operating City
                  </span>
                  <p className="text-sm font-bold text-[#0f2942] flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {user.location || "Osogbo, Osun State"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Registration Date
                  </span>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(user.created_at).toLocaleDateString("en-NG", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Platform User UUID
                  </span>
                  <p className="text-xs font-mono text-slate-600 truncate">{user.id}</p>
                </div>
              </div>

              {user.bio && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Personal Bio
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {currentUserStatus === "suspended" && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Account Suspended by Governance</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Reason: {currentSuspensionReason || "No explicit reason specified."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARTISAN PROFILE */}
          {activeTab === "artisan" && user.artisan_profile && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-[#ea580c] tracking-widest block">
                    Official Artisan Registry Code
                  </span>
                  <h3 className="text-base font-mono font-black text-[#0f2942] mt-0.5">
                    {artisanIdCode}
                  </h3>
                </div>

                <a
                  href={`${marketplaceUrl}/artisans/${user.artisan_profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0f2942] hover:text-[#ea580c] shadow-2xs transition-colors"
                >
                  <span>Public Showcase</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Enterprise Name
                  </span>
                  <p className="text-sm font-bold text-[#0f2942]">
                    {user.artisan_profile.business_name}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Trade Category
                  </span>
                  <p className="text-sm font-bold text-[#ea580c] flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {user.artisan_profile.category}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Experience
                  </span>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {user.artisan_profile.years_experience} Years in Trade
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Verification Status
                  </span>
                  <div className="pt-0.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.artisan_profile.verification_status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : user.artisan_profile.verification_status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.artisan_profile.verification_status}
                    </span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Trade Description / Services Overview
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              {user.artisan_profile.verification_notes && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Verification Review Notes
                  </span>
                  <p className="text-xs text-slate-700 italic">
                    &ldquo;{user.artisan_profile.verification_notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GOVERNANCE ACTIONS */}
          {activeTab === "actions" && !isSelf && user.role !== "admin" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                      currentUserStatus === "active" ? "bg-red-600" : "bg-emerald-600"
                    }`}
                  >
                    {currentUserStatus === "active" ? <Ban className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0f2942]">
                      {currentUserStatus === "active" ? "Suspend User Account" : "Reactivate User Account"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {currentUserStatus === "active"
                        ? "Prevent this account from booking or accepting jobs in Osogbo."
                        : "Restore full account privileges and allow active participation."}
                    </p>
                  </div>
                </div>

                {currentUserStatus === "active" ? (
                  <div className="space-y-3">
                    <Input
                      label="Suspension Reason"
                      placeholder="e.g. Repeated unfulfilled bookings, safety policy breach..."
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      required
                    />

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSuspend}
                      isLoading={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Confirm Account Suspension
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleReactivate}
                      isLoading={isProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Reactivate Account Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Close Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
