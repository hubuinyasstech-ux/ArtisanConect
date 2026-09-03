"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Service } from "@/types/database.types";
import { createService, updateService } from "@/app/actions/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Wrench,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Flame,
  Tv,
  Home,
  Car,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface ServiceFormProps {
  initialService?: Service;
  initialArtisanPhoto?: string | null;
  isEditing?: boolean;
}

export function ServiceForm({
  initialService,
  initialArtisanPhoto,
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialService?.title || "");
  const [description, setDescription] = useState(initialService?.description || "");
  const [category, setCategory] = useState(initialService?.category || "Plumbing");
  const [price, setPrice] = useState(initialService?.price?.toString() || "");
  const [location, setLocation] = useState(
    initialService?.location || "Osogbo, Osun State"
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialService ? initialService.is_active : true
  );
  const [artisanPhoto, setArtisanPhoto] = useState<string>(initialArtisanPhoto || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: "Plumbing", label: "Plumbing", icon: <Wrench className="h-3.5 w-3.5" /> },
    { value: "Electrical", label: "Electrical", icon: <Zap className="h-3.5 w-3.5" /> },
    { value: "Carpentry", label: "Carpentry", icon: <Hammer className="h-3.5 w-3.5" /> },
    { value: "Painting", label: "Painting", icon: <Paintbrush className="h-3.5 w-3.5" /> },
    { value: "Cleaning", label: "Cleaning", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { value: "Masonry & Tiling", label: "Masonry & Tiling", icon: <Briefcase className="h-3.5 w-3.5" /> },
    { value: "Welding & Metalwork", label: "Welding & Metalwork", icon: <Flame className="h-3.5 w-3.5" /> },
    { value: "Appliance & AC Repair", label: "Appliance & AC Repair", icon: <Tv className="h-3.5 w-3.5" /> },
    { value: "Roofing & Waterproofing", label: "Roofing & Waterproofing", icon: <Home className="h-3.5 w-3.5" /> },
    { value: "Automobile Mechanics", label: "Automobile Mechanics", icon: <Car className="h-3.5 w-3.5" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a service title.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid starting price in Naira (₦).");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("price", priceNum.toString());
    formData.append("location", location.trim());
    formData.append("is_active", isActive ? "true" : "false");
    if (artisanPhoto) {
      formData.append("photo_url", artisanPhoto);
    }

    try {
      const result =
        isEditing && initialService
          ? await updateService(initialService.id, formData)
          : await createService(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/artisan/services");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Service submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md border-slate-200/90 rounded-3xl">
      <CardHeader className="pt-8 px-6 sm:px-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/artisan/services"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#ea580c] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Services
          </Link>
        </div>
        <CardTitle className="text-2xl font-extrabold text-[#0f2942]">
          {isEditing ? "Edit Service Offering" : "Add New Service Offering"}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Define clear service packages with your trade specialization, transparent pricing, and artisan photo for customers in Osogbo
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="error" title="Submission Error">
              {error}
            </Alert>
          )}

          {/* 1. Artisan Photo Upload */}
          <div className="space-y-1">
            <ImageUpload
              label="Artisan Photo / Headshot"
              helperText="Upload your clear professional photo or business image. This photo will appear on your public profile and alongside your services."
              value={artisanPhoto}
              onChange={setArtisanPhoto}
              shape="rounded"
            />
          </div>

          {/* 2. Service Title */}
          <Input
            label="Service Title"
            type="text"
            required
            placeholder="e.g. Bathroom Pipe Leak Inspection & Repair"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helperText="Clear, specific title explaining the work you do"
            leftIcon={<Wrench className="h-4 w-4" />}
          />

          {/* 3. Type of Service Offered (Trade Classification) */}
          <div className="space-y-2.5 text-left">
            <label className="block text-sm font-semibold text-slate-800">
              Type of Service Offered (Select Trade)
            </label>
            
            {/* Quick-select Trade Pills */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categories.map((c) => {
                const isSelected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#0f2942] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            <Select
              label="Or choose from full list"
              required
              options={categories.map((c) => ({ value: c.value, label: c.label }))}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              helperText="Primary trade category for customer search filtering"
            />
          </div>

          {/* 4. Pricing & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Starting Estimate (₦ NGN)"
              type="number"
              min="0"
              step="500"
              required
              placeholder="e.g. 5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              helperText="Starting labor price before materials"
              leftIcon={<span className="text-sm font-bold text-slate-500">₦</span>}
            />

            <Input
              label="Service Area / Location"
              type="text"
              required
              placeholder="e.g. Osogbo, Osun State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              helperText="Specific neighborhood or coverage area"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* 5. Service Description & Scope */}
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-slate-800">
              Service Description & Scope
            </label>
            <div className="relative rounded-xl shadow-xs">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is included in this service, typical response time, warranty on labor, and any client preparation needed..."
                className="block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 text-sm placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-3 focus:ring-[#ea580c]/10 transition-all duration-150"
              />
            </div>
            <p className="text-xs text-slate-500">
              Clear job descriptions minimize misunderstandings and boost client bookings.
            </p>
          </div>

          {/* 6. Active Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-900">Service Status</p>
              <p className="text-xs text-slate-500">
                Active services are publicly visible on your profile and in search results
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ea580c]"></div>
            </label>
          </div>

          {/* 7. Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/artisan/services">
              <Button variant="ghost" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="secondary"
              className="font-bold px-7"
              size="md"
              isLoading={loading}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isEditing ? "Save Changes" : "Create Service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
