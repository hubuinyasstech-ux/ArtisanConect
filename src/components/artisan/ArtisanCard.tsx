import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatNaira } from "@/lib/utils";
import {
  MapPin,
  Star,
  Shield,
  CircleDot,
  ArrowRight,
} from "lucide-react";

export interface ArtisanCardData {
  id: string; // artisan_profile id
  business_name: string;
  category: string;
  years_experience: number;
  availability_status: "available" | "busy" | "offline";
  verification_status: "unverified" | "pending" | "verified";
  rating: number;
  location: string;
  avatar_url: string | null;
  bio: string | null;
  min_price?: number | null;
  active_services_count?: number;
}

interface ArtisanCardProps {
  artisan: ArtisanCardData;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  const isAvailable = artisan.availability_status === "available";

  return (
    <Card className="h-full flex flex-col rounded-3xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#ea580c]">
      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Header: Avatar, Business Name, Verification, Availability */}
          <div className="flex items-start gap-3.5">
            <Link
              href={`/artisans/${artisan.id}`}
              className="relative h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            >
              {artisan.avatar_url ? (
                <Image
                  src={artisan.avatar_url}
                  alt={artisan.business_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-[#0f2942] font-extrabold text-lg">
                  {artisan.business_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="brand" className="text-[10px] px-2 py-0.5">
                  {artisan.category}
                </Badge>
                {artisan.verification_status === "verified" && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <Link href={`/artisans/${artisan.id}`} className="block">
                <h3 className="text-base font-extrabold text-[#0f2942] truncate mt-1 hover:text-[#ea580c] transition-colors">
                  {artisan.business_name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-[#ea580c] shrink-0" />
                  <span className="truncate">{artisan.location}</span>
                </span>
                <span>•</span>
                <span className="shrink-0">{artisan.years_experience} yrs exp</span>
              </div>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {artisan.bio ||
              `Experienced ${artisan.category.toLowerCase()} professional available for residential and commercial projects in Osogbo.`}
          </p>
        </div>

        {/* Footer info: Availability, Rating, Starting Price, CTA */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                isAvailable
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-slate-600 bg-slate-100"
              }`}
            >
              <CircleDot
                className={`h-2.5 w-2.5 ${
                  isAvailable ? "text-emerald-600 fill-emerald-600" : "text-slate-400"
                }`}
              />
              {isAvailable ? "Available Now" : "Currently Busy"}
            </span>

            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{artisan.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {artisan.min_price ? (
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Starts from</span>
                <span className="text-sm font-extrabold text-[#0f2942]">
                  {formatNaira(artisan.min_price)}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Custom Quote</span>
            )}

            <Link
              href={`/artisans/${artisan.id}`}
              className="inline-flex items-center justify-center font-bold text-xs px-3.5 py-1.5 h-8 gap-1.5 rounded-xl bg-[#ea580c] text-white hover:bg-[#c2410c] shadow-2xs transition-all duration-150 cursor-pointer shrink-0"
            >
              <span>View Profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
