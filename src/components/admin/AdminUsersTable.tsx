"use client";

import React, { useState } from "react";
import Link from "next/link";
import { suspendUser, reactivateUser } from "@/app/actions/admin";
import { UserRole, AccountStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Ban,
  RotateCcw,
  Loader2,
  MapPin,
  Mail,
  ExternalLink,
} from "lucide-react";

export interface AdminUserItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  location: string;
  status: AccountStatus;
  suspension_reason: string | null;
  created_at: string;
  artisan_profile_id?: string | null;
}

interface AdminUsersTableProps {
  initialUsers: AdminUserItem[];
  currentAdminId: string;
}

export function AdminUsersTable({ initialUsers, currentAdminId }: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [activeModal, setActiveModal] = useState<{
    type: "suspend" | "reactivate" | "view";
    user: AdminUserItem;
  } | null>(null);

  const [suspensionReason, setSuspensionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = initialUsers.filter((u) => {
    // Search query filter
    const matchesSearch =
      searchQuery.trim() === "" ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    if (!suspensionReason.trim()) {
      setError("Please provide a reason for suspending this account.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const res = await suspendUser(activeModal.user.id, suspensionReason);
    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
    setSuspensionReason("");
  };

  const handleReactivateSubmit = async () => {
    if (!activeModal) return;

    setIsProcessing(true);
    setError(null);

    const res = await reactivateUser(activeModal.user.id);
    if (res.error) {
      setError(res.error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or area..."
            className="pl-10 text-xs h-10 rounded-2xl bg-white border-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Role Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
            {["all", "customer", "artisan", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-colors ${
                  roleFilter === r ? "bg-white text-[#0f2942] shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
            {["all", "active", "suspended"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-colors ${
                  statusFilter === s ? "bg-[#0f2942] text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No users matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#0f2942] flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {isSelf && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-300" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={u.role === "admin" ? "danger" : u.role === "artisan" ? "brand" : "default"}
                          className="text-[10px] capitalize font-bold"
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#ea580c]" />
                          <span>{u.location}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <Ban className="h-3 w-3 text-red-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {u.artisan_profile_id && (
                            <Link
                              href={`/artisans/${u.artisan_profile_id}`}
                              target="_blank"
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#ea580c] hover:bg-slate-50 transition-colors"
                              title="View Public Profile"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}

                          {!isSelf && u.role !== "admin" && (
                            <>
                              {u.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveModal({ type: "suspend", user: u });
                                    setSuspensionReason("");
                                    setError(null);
                                  }}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1"
                                >
                                  <Ban className="h-3 w-3" />
                                  <span>Suspend</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveModal({ type: "reactivate", user: u });
                                    setError(null);
                                  }}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Reactivate</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Account Modal */}
      {activeModal && activeModal.type === "suspend" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">Suspend User Account</h3>
                <p className="text-xs text-slate-500">{activeModal.user.full_name} ({activeModal.user.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Suspending this account will restrict the user from creating or accepting bookings, managing services,
              and interacting on the platform.
            </p>

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Suspension Reason (Will be shown to the user):
                </label>
                <textarea
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Failure to fulfill booked customer service without notification, violating platform safety rules."
                  className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isProcessing}
                  className="text-xs font-bold gap-1.5"
                >
                  {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Suspension
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reactivate Account Modal */}
      {activeModal && activeModal.type === "reactivate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2942]">Reactivate Account</h3>
                <p className="text-xs text-slate-500">{activeModal.user.full_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to restore full platform privileges to this account?
            </p>

            {activeModal.user.suspension_reason && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Previous Suspension Reason:</span>
                <p>{activeModal.user.suspension_reason}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveModal(null)}
                disabled={isProcessing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleReactivateSubmit}
                disabled={isProcessing}
                className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Reactivation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
