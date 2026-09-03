"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { formatNigerianPhone } from "@/lib/utils";
import { User, Phone, MapPin, Mail, Shield, Save } from "lucide-react";

interface ProfileFormProps {
  initialProfile: Profile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [location, setLocation] = useState(initialProfile.location || "Osogbo, Osun State");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedPhone = formatNigerianPhone(phone.trim());

      const { error: updateError } = await supabase
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

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      const message = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md border-slate-200/90 rounded-3xl">
      <CardHeader className="pt-8 px-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-extrabold text-[#0f2942]">Customer Profile</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Manage your personal information and contact details
            </CardDescription>
          </div>
          <Badge variant="navy" className="capitalize">
            {initialProfile.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="error" title="Update Failed">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" title="Profile Updated">
              Your profile changes have been successfully saved.
            </Alert>
          )}

          {/* Account Credentials Badge */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Account Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-[#ea580c]" />
                <span className="font-mono text-xs">{initialProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium">Role: {initialProfile.role}</span>
              </div>
            </div>
          </div>

          {/* Avatar / Profile Picture */}
          <ImageUpload
            label="Profile Photo"
            helperText="Upload a profile photo from your phone or computer, or provide an image URL."
            value={avatarUrl}
            onChange={setAvatarUrl}
            shape="circle"
          />

          <Input
            label="Full Name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Used for SMS and WhatsApp contact"
              leftIcon={<Phone className="h-4 w-4" />}
            />

            <Input
              label="Location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              helperText="e.g. Osogbo, Osun State"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-slate-800">
              About You (Bio)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell artisans a bit about yourself or your home/business service needs..."
                className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-3 focus:ring-[#ea580c]/10 transition-all duration-150"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto font-bold px-7"
            size="md"
            isLoading={loading}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
