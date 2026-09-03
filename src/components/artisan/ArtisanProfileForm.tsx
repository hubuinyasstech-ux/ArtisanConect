"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile, ArtisanProfile, AvailabilityStatus } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatNigerianPhone } from "@/lib/utils";
import {
  Briefcase,
  Phone,
  MapPin,
  Mail,
  Shield,
  Save,
  Clock,
  CircleDot,
  Star,
  Image as ImageIcon,
  User,
} from "lucide-react";

interface ArtisanProfileFormProps {
  initialProfile: Profile;
  initialArtisanProfile: ArtisanProfile | null;
}

export function ArtisanProfileForm({
  initialProfile,
  initialArtisanProfile,
}: ArtisanProfileFormProps) {
  const router = useRouter();

  // Profile fields
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [location, setLocation] = useState(initialProfile.location || "Osogbo, Osun State");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");

  // Artisan Profile fields
  const [businessName, setBusinessName] = useState(
    initialArtisanProfile?.business_name || initialProfile.full_name || ""
  );
  const [category, setCategory] = useState(
    initialArtisanProfile?.category || "Plumbing"
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialArtisanProfile?.years_experience?.toString() || "3"
  );
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    initialArtisanProfile?.availability_status || "available"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: "Plumbing", label: "Plumbing Services" },
    { value: "Electrical", label: "Electrical & Wiring" },
    { value: "Carpentry", label: "Carpentry & Woodwork" },
    { value: "Painting", label: "Painting & Screeding" },
    { value: "Cleaning", label: "Cleaning & Sanitation" },
  ];

  const availabilityOptions = [
    { value: "available", label: "Available for Work Now" },
    { value: "busy", label: "Currently Busy (Accepting Advance Bookings)" },
    { value: "offline", label: "Offline / On Break" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!businessName.trim()) {
      setError("Business or Artisan Name is required.");
      return;
    }

    const expNum = parseInt(yearsExperience, 10);
    if (isNaN(expNum) || expNum < 0) {
      setError("Years of experience must be a non-negative number.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedPhone = formatNigerianPhone(phone.trim());

      // 1. Update basic profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: normalizedPhone,
          location: location.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialProfile.id);

      if (profileError) throw profileError;

      // 2. Upsert artisan_profiles record
      const { error: artisanError } = await supabase
        .from("artisan_profiles")
        .upsert(
          {
            user_id: initialProfile.id,
            business_name: businessName.trim(),
            category: category.trim(),
            years_experience: expNum,
            availability_status: availabilityStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (artisanError) throw artisanError;

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      console.error("Artisan profile update error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update artisan profile. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const verificationStatus = initialArtisanProfile?.verification_status || "unverified";
  const rating = initialArtisanProfile?.rating || 5.0;

  return (
    <Card className="max-w-3xl mx-auto shadow-md border-slate-200/90 rounded-3xl">
      <CardHeader className="pt-8 px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-extrabold text-[#0f2942]">
              Artisan Business Profile
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Showcase your trade, years of experience, and availability to local customers
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                verificationStatus === "verified"
                  ? "success"
                  : verificationStatus === "pending"
                  ? "warning"
                  : "default"
              }
            >
              <Shield className="h-3 w-3 mr-1" />
              {verificationStatus === "verified"
                ? "Identity Verified"
                : verificationStatus === "pending"
                ? "Verification Pending"
                : "Unverified"}
            </Badge>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error" title="Save Failed">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" title="Profile Saved">
              Your business profile and availability have been successfully updated.
            </Alert>
          )}

          {/* Account Credentials Badge */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Artisan Account Info
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-[#ea580c]" />
                <span className="font-mono text-xs">{initialProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CircleDot className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold capitalize">
                  Status: {availabilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Photo / Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Artisan Photo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-10 w-10 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <Input
                label="Profile / Business Photo URL"
                type="url"
                placeholder="https://example.com/artisan-photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                helperText="Link to your professional work photo or business logo"
                leftIcon={<ImageIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Business & Personal Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Trade Name"
              type="text"
              required
              placeholder="e.g. Babatunde Plumbing Works"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              helperText="Displayed prominently on your public profile"
              leftIcon={<Briefcase className="h-4 w-4" />}
            />

            <Input
              label="Artisan Contact Name"
              type="text"
              required
              placeholder="e.g. Babatunde Adeleke"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              helperText="Your personal full name"
              leftIcon={<User className="h-4 w-4" />}
            />
          </div>

          {/* Trade Category & Years of Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Trade / Specialization"
              required
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              helperText="Main category where your services appear"
            />

            <Input
              label="Years of Experience"
              type="number"
              min="0"
              required
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              helperText="Number of years working in this trade"
              leftIcon={<Clock className="h-4 w-4" />}
            />
          </div>

          {/* Availability Status Selector */}
          <Select
            label="Work Availability Status"
            required
            options={availabilityOptions}
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
            helperText="Lets customers know if you can take immediate requests"
          />

          {/* Contact Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Phone Number"
              type="tel"
              required
              placeholder="e.g. 0803 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Customers will call or WhatsApp this number"
              leftIcon={<Phone className="h-4 w-4" />}
            />

            <Input
              label="Base Service Location"
              type="text"
              required
              placeholder="e.g. Osogbo, Osun State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              helperText="Primary city or neighborhood you operate in"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Bio / About Section */}
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-slate-800">
              About Your Craft & Services (Bio)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your expertise, past projects, warranties offered, and why customers in Osogbo should choose you..."
                className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-3 focus:ring-[#ea580c]/10 transition-all duration-150"
              />
            </div>
            <p className="text-xs text-slate-500">
              A comprehensive bio helps you rank higher and win customer trust.
            </p>
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto font-bold px-8"
            size="md"
            isLoading={loading}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Business Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
