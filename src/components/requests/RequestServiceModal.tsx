"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { createServiceRequest } from "@/app/actions/requests";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export interface RequestModalService {
  id: string;
  title: string;
  price: number;
  category: string;
  artisan_id: string;
  artisan_name: string;
}

interface RequestServiceModalProps {
  service: RequestModalService | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    role: string;
  } | null;
}

export function RequestServiceModal({
  service,
  isOpen,
  onClose,
  currentUser,
}: RequestServiceModalProps) {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("Morning (8am - 12pm)");
  const [location, setLocation] = useState("Osogbo, Osun State");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !service) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      router.push(`/login?redirect=/artisans/${service.artisan_id}`);
      return;
    }

    if (currentUser.id === service.artisan_id) {
      setError("You cannot submit a service request to your own business profile.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the issue or work required.");
      return;
    }

    if (!location.trim()) {
      setError("Please specify the service address or location.");
      return;
    }

    setIsSubmitting(true);

    try {
      const isServiceUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service.id);
      const res = await createServiceRequest({
        service_id: isServiceUuid ? service.id : null,
        artisan_id: service.artisan_id,
        description: description.trim(),
        preferred_date: preferredDate || null,
        preferred_time: preferredTime,
        location: location.trim(),
        notes: notes.trim() || null,
      });

      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setIsSubmitting(false);

      // Auto redirect to customer requests after 2 seconds
      setTimeout(() => {
        router.push("/customer/requests");
      }, 2000);
    } catch {
      setError("Failed to send request. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f2942] text-white">
              <Briefcase className="h-4 w-4 text-[#ea580c]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f2942]">Request Service</h2>
              <p className="text-xs text-slate-500">Connect with {service.artisan_name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#0f2942]">Request Sent Successfully!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {service.artisan_name} has been notified and will review your request shortly.
                </p>
              </div>
              <p className="text-xs text-slate-400">Redirecting to your requests hub...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service Summary Read-only Card */}
              <div className="p-4 rounded-2xl bg-[#0f2942]/5 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#ea580c] uppercase tracking-wider">
                    {service.category}
                  </span>
                  <span className="text-base font-extrabold text-[#0f2942]">
                    {formatNaira(service.price)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0f2942]">{service.title}</h4>
                <p className="text-xs text-slate-500">Artisan: {service.artisan_name}</p>
              </div>

              {error && (
                <Alert variant="error" className="text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </Alert>
              )}

              {/* Guest Warning */}
              {!currentUser && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    You will be asked to log in or register before your request is submitted.
                  </span>
                </div>
              )}

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#ea580c]" />
                  <span>Describe the Job or Problem *</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. The kitchen sink drain is blocked and leaking under the cabinet. Needs new piping."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
                  required
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#ea580c]" />
                    <span>Preferred Date</span>
                  </label>
                  <Input
                    type="date"
                    min={today}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#ea580c]" />
                    <span>Preferred Time Slot</span>
                  </label>
                  <Select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    options={[
                      { label: "Morning (8am - 12pm)", value: "Morning (8am - 12pm)" },
                      { label: "Afternoon (12pm - 4pm)", value: "Afternoon (12pm - 4pm)" },
                      { label: "Evening (4pm - 7pm)", value: "Evening (4pm - 7pm)" },
                      { label: "Flexible / Any Time", value: "Flexible" },
                    ]}
                  />
                </div>
              </div>

              {/* Location Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
                  <span>Service Location / Address *</span>
                </label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. No 14, Alekuwodo Road, Osogbo"
                  required
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Special Notes or Access Instructions (Optional)
                </label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call my phone when you arrive at the gate."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    "Send Service Request"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
