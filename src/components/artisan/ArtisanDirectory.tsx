"use client";

import React, { useState } from "react";
import { ArtisanCard, ArtisanCardData } from "@/components/artisan/ArtisanCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, X, Wrench } from "lucide-react";

interface ArtisanDirectoryProps {
  initialArtisans: ArtisanCardData[];
  initialCategory?: string;
  initialLocation?: string;
  initialQuery?: string;
}

export function ArtisanDirectory({
  initialArtisans,
  initialCategory = "",
  initialLocation = "",
  initialQuery = "",
}: ArtisanDirectoryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categories = [
    { label: "All Trades", value: "" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Electrical", value: "Electrical" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Painting", value: "Painting" },
    { label: "Cleaning", value: "Cleaning" },
  ];

  const filteredArtisans = initialArtisans.filter((artisan) => {
    // 1. Category check
    if (
      selectedCategory &&
      artisan.category.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      return false;
    }

    // 2. Availability check
    if (onlyAvailable && artisan.availability_status !== "available") {
      return false;
    }

    // 3. Location check
    if (locationFilter.trim()) {
      const locLower = locationFilter.toLowerCase().trim();
      if (!artisan.location.toLowerCase().includes(locLower)) {
        return false;
      }
    }

    // 4. Search query check
    if (query.trim()) {
      const qLower = query.toLowerCase().trim();
      const matchName = artisan.business_name.toLowerCase().includes(qLower);
      const matchCategory = artisan.category.toLowerCase().includes(qLower);
      const matchBio = artisan.bio?.toLowerCase().includes(qLower) || false;
      const matchLoc = artisan.location.toLowerCase().includes(qLower);

      if (!matchName && !matchCategory && !matchBio && !matchLoc) {
        return false;
      }
    }

    return true;
  });

  const handleClearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setLocationFilter("");
    setOnlyAvailable(false);
  };

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    Boolean(locationFilter) ||
    onlyAvailable;

  return (
    <div className="space-y-8">
      {/* Interactive Search & Filter Card */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6">
            <Input
              type="text"
              placeholder="Search by trade or artisan name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Location Filter */}
          <div className="md:col-span-4">
            <Input
              type="text"
              placeholder="Filter location (e.g. Osogbo)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              leftIcon={<MapPin className="h-4 w-4 text-[#ea580c]" />}
            />
          </div>

          {/* Quick Clear Button */}
          <div className="md:col-span-2 flex items-center">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleClearFilters}
                className="w-full text-xs font-semibold text-slate-600 hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            ) : (
              <div className="w-full text-center text-xs font-semibold text-slate-400 py-2">
                All Filters Clean
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Pills & Availability Checkbox */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const isSelected =
                (!selectedCategory && !cat.value) ||
                selectedCategory.toLowerCase() === cat.value.toLowerCase();
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#0f2942] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Available Now Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-[#ea580c] focus:ring-[#ea580c] h-4 w-4"
            />
            <span>Available for work right now</span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900">{filteredArtisans.length}</strong> of{" "}
          <strong className="text-slate-900">{initialArtisans.length}</strong> registered artisans
        </span>

        {selectedCategory && (
          <Badge variant="brand" className="capitalize">
            Filtered: {selectedCategory}
          </Badge>
        )}
      </div>

      {/* Directory Grid */}
      {filteredArtisans.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center">
            <Wrench className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Artisans Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No registered professionals currently match your search criteria. Try clearing some
              filters or searching for a different trade.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="font-bold px-6"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtisans.map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  );
}
