import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Star,
  CircleDot,
  Clock,
  CheckCircle2,
  ArrowLeft,
  CalendarPlus,
} from "lucide-react";
import { ArtisanServicesSection } from "@/components/artisan/ArtisanServicesSection";
import { ReviewList, ReviewItem } from "@/components/reviews/ReviewList";
import { ArtisanReportButton } from "@/components/reports/ArtisanReportButton";

interface ArtisanPublicProfilePageProps {
  params: Promise<{ id: string }>;
}

interface PublicArtisanDetail {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  years_experience: number;
  availability_status: "available" | "busy" | "offline";
  verification_status: "unverified" | "pending" | "verified";
  rating: number;
  location: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface PublicServiceDetail {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  description: string | null;
}

interface SupabaseProfileJoin {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export async function generateMetadata({ params }: ArtisanPublicProfilePageProps) {
  const { id } = await params;
  return {
    title: `Artisan Profile — ArtisanConnect`,
    description: `View verified artisan services and portfolio for ${id} on ArtisanConnect Nigeria.`,
  };
}

export default async function ArtisanPublicProfilePage({
  params,
}: ArtisanPublicProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch artisan profile if valid UUID format, otherwise check demo records
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let artisan = null;
  if (isUuid) {
    try {
      const { data } = await supabase
        .from("artisan_profiles")
        .select(`
          id,
          user_id,
          business_name,
          category,
          years_experience,
          availability_status,
          verification_status,
          rating,
          created_at
        `)
        .or(`id.eq.${id},user_id.eq.${id}`)
        .maybeSingle();
      artisan = data;
    } catch {
      // Handled gracefully
    }
  }

  // If not found in database, check if it's one of the demo artisans
  let profileData: PublicArtisanDetail | null = null;
  let servicesData: PublicServiceDetail[] = [];

  if (artisan) {
    let rawProfile: SupabaseProfileJoin | null = null;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, email, phone, location, avatar_url, bio")
        .eq("id", artisan.user_id)
        .maybeSingle();
      if (prof) rawProfile = prof as unknown as SupabaseProfileJoin;
    } catch {
      // Graceful fallback
    }

    profileData = {
      id: artisan.id,
      user_id: artisan.user_id,
      business_name: artisan.business_name || rawProfile?.full_name || "Skilled Artisan",
      category: artisan.category || "Plumbing",
      years_experience: artisan.years_experience ?? 1,
      availability_status: (artisan.availability_status as "available" | "busy" | "offline") || "available",
      verification_status: (artisan.verification_status as "unverified" | "pending" | "verified") || "unverified",
      rating: Number(artisan.rating) || 5.0,
      location: rawProfile?.location || "Osogbo, Osun State",
      phone: rawProfile?.phone || null,
      avatar_url: rawProfile?.avatar_url || null,
      bio: rawProfile?.bio || null,
    };

    // Fetch active services for this artisan
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("artisan_id", artisan.id)
      .eq("is_active", true)
      .order("price", { ascending: true });

    servicesData = (services as PublicServiceDetail[]) || [];
  } else if (id.startsWith("demo-")) {
    // Demo profile fallback
    const demos: Record<string, PublicArtisanDetail & { services?: PublicServiceDetail[] }> = {
      "demo-plumber-1": {
        id: "demo-plumber-1",
        user_id: "demo-user-1",
        business_name: "Adeleke Rapid Plumbing Works",
        category: "Plumbing",
        years_experience: 8,
        availability_status: "available",
        verification_status: "verified",
        rating: 4.9,
        location: "Osogbo (Alekuwodo / Oke-Fia)",
        phone: "+2348031234567",
        avatar_url: null,
        bio: "Specializing in high-pressure pipe repair, water heater installations, borehole systems, and modern bathroom fittings across Osogbo with over 8 years of dependable service.",
        services: [
          {
            id: "s1",
            title: "Emergency Pipe Leak Inspection & Repair",
            category: "Plumbing",
            price: 5000,
            location: "Osogbo & Surrounding Towns",
            description: "Rapid diagnostics of burst pipes, hidden wall leaks, and emergency valve replacements with quality PPR and PVC materials.",
          },
          {
            id: "s2",
            title: "Complete Bathroom Sanitaryware Installation",
            category: "Plumbing",
            price: 15000,
            location: "Osogbo",
            description: "Full fitting of water closets (WC), wash hand basins, shower mixers, and drainage traps with leak-free warranty.",
          },
          {
            id: "s3",
            title: "Overhead Tank & Borehole Pumping Connection",
            category: "Plumbing",
            price: 25000,
            location: "Osogbo",
            description: "Complete automated float switch configuration, surface pumping setup, and roof tank plumbing for steady water flow.",
          },
        ],
      },
      "demo-electrician-2": {
        id: "demo-electrician-2",
        user_id: "demo-user-2",
        business_name: "Ogunleye Electrical & Solar Systems",
        category: "Electrical",
        years_experience: 10,
        availability_status: "available",
        verification_status: "verified",
        rating: 5.0,
        location: "Osogbo (Gbongan Road / Ogo-Oluwa)",
        phone: "+2348029876543",
        avatar_url: null,
        bio: "Certified residential and commercial electrical wiring, changeover switch setup, inverter installations, and prompt fault detection in Osun State.",
        services: [
          {
            id: "s4",
            title: "Inverter & Solar Battery Configuration",
            category: "Electrical",
            price: 20000,
            location: "Osogbo",
            description: "Professional solar panel wiring, pure sine wave inverter coupling, and safe battery bank installations.",
          },
          {
            id: "s5",
            title: "House Wiring & Distribution Board Installation",
            category: "Electrical",
            price: 35000,
            location: "Osogbo",
            description: "Conduit and surface wiring for new builds, grounding/earthing, and surge protection breaker setup.",
          },
        ],
      },
      "demo-carpenter-3": {
        id: "demo-carpenter-3",
        user_id: "demo-user-3",
        business_name: "Heritage Woodwork & Roofing",
        category: "Carpentry",
        years_experience: 12,
        availability_status: "busy",
        verification_status: "verified",
        rating: 4.8,
        location: "Osogbo (Old Garage / Station Road)",
        phone: "+2348145550192",
        avatar_url: null,
        bio: "Custom modern kitchen cabinets, durable door frames, bespoke wardrobes, and complete roof framing craftsmanship.",
        services: [
          {
            id: "s6",
            title: "Custom Kitchen Cabinet Crafting & Fitting",
            category: "Carpentry",
            price: 50000,
            location: "Osogbo",
            description: "Moisture-resistant HDF/MDF modern kitchen cabinets with soft-close hinges and granite countertop framing.",
          },
        ],
      },
      "demo-painter-4": {
        id: "demo-painter-4",
        user_id: "demo-user-4",
        business_name: "BrightCoat Screeding & Painting",
        category: "Painting",
        years_experience: 6,
        availability_status: "available",
        verification_status: "verified",
        rating: 4.9,
        location: "Osogbo (Dada Estate / Ring Road)",
        phone: "+2348051239876",
        avatar_url: null,
        bio: "Premium POP screeding, interior satin finish, exterior weather-guard coatings, and decorative textured wall treatments.",
        services: [
          {
            id: "s7",
            title: "Interior Wall Screeding & Satin Paint Finish",
            category: "Painting",
            price: 8000,
            location: "Osogbo",
            description: "Flawless glass-smooth wall screeding and premium washable silk/satin emulsion coating per room.",
          },
        ],
      },
      "demo-cleaner-5": {
        id: "demo-cleaner-5",
        user_id: "demo-user-5",
        business_name: "SparkleClean Facility Care",
        category: "Cleaning",
        years_experience: 5,
        availability_status: "available",
        verification_status: "verified",
        rating: 5.0,
        location: "Osogbo (Biket / Agunbelewo)",
        phone: "+2348098761234",
        avatar_url: null,
        bio: "Deep post-construction cleaning, residential move-in disinfection, fumigation, and routine office janitorial services.",
        services: [
          {
            id: "s8",
            title: "Post-Construction Deep Cleanup",
            category: "Cleaning",
            price: 15000,
            location: "Osogbo",
            description: "Removal of cement stains, paint splatters, window scrubbing, and chemical floor polishing for newly built properties.",
          },
        ],
      },
    };

    const demo = demos[id];
    if (demo) {
      profileData = demo;
      servicesData = demo.services || [];
    } else {
      notFound();
    }
  } else {
    notFound();
  }

  const phoneHref = profileData.phone
    ? `tel:${profileData.phone.replace(/[^0-9+]/g, "")}`
    : null;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const currentUser = authUser
    ? {
        id: authUser.id,
        role: authUser.user_metadata?.role || "customer",
      }
    : null;

  // Fetch reviews for this artisan
  let reviewsList: ReviewItem[] = [];
  if (artisan?.id) {
    try {
      const { data: reviews } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name
          )
        `)
        .eq("artisan_id", artisan.id)
        .order("created_at", { ascending: false });

      if (reviews) {
        reviewsList = reviews.map((r) => {
          const profileJoin = r.profiles as unknown as { full_name?: string } | null;
          return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            customer_name: profileJoin?.full_name || "Verified Customer",
          };
        });
      }
    } catch {
      // Graceful fallback
    }
  } else if (id.startsWith("demo-")) {
    reviewsList = [
      {
        id: "demo-rev-1",
        rating: 5,
        comment:
          "Arrived right on time in Alekuwodo, had all the plumbing replacement parts ready in his vehicle, and finished the pipe fix in under 45 minutes. Super clean job!",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        customer_name: "Bolanle O.",
      },
      {
        id: "demo-rev-2",
        rating: 5,
        comment:
          "Very professional communication and honest pricing. Provided a clear estimate before touching anything and gave advice on how to prevent future leaks.",
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        customer_name: "Engr. Taiwo A.",
      },
    ];
  }

  const whatsappHref = profileData.phone
    ? `https://wa.me/${profileData.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello ${profileData.business_name}, I found your profile on ArtisanConnect and would like to inquire about your services in Osogbo.`
      )}`
    : null;

  const isAvailable = profileData.availability_status === "available";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/find-artisans"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#ea580c] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Artisan Directory
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {profileData.avatar_url ? (
                <Image
                  src={profileData.avatar_url}
                  alt={profileData.business_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-[#0f2942] font-black text-2xl">
                  {profileData.business_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand" className="text-xs font-bold">
                  {profileData.category}
                </Badge>
                {profileData.verification_status === "verified" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Identity
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isAvailable
                      ? "text-emerald-800 bg-emerald-50 border border-emerald-200"
                      : "text-slate-600 bg-slate-100 border border-slate-200"
                  }`}
                >
                  <CircleDot
                    className={`h-2.5 w-2.5 ${
                      isAvailable ? "text-emerald-600 fill-emerald-600" : "text-slate-400"
                    }`}
                  />
                  {isAvailable ? "Available for Work" : "Currently Busy"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942]">
                {profileData.business_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#ea580c]" />
                  {profileData.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {profileData.years_experience} Years Trade Experience
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {profileData.rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact CTA Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 pt-2 lg:pt-0">
            <a href="#services-section" className="w-full">
              <Button className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold gap-2 shadow-xs">
                <CalendarPlus className="h-4 w-4" />
                <span>Request Service</span>
              </Button>
            </a>

            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold gap-2 shadow-xs">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </Button>
              </a>
            ) : (
              <Button disabled variant="outline" className="text-xs">
                No WhatsApp Linked
              </Button>
            )}

            {phoneHref ? (
              <a href={phoneHref}>
                <Button variant="outline" className="w-full font-bold gap-2 text-slate-800 hover:text-[#0f2942]">
                  <Phone className="h-4 w-4 text-[#ea580c]" />
                  <span>Call Artisan</span>
                </Button>
              </a>
            ) : (
              <Button disabled variant="outline" className="text-xs">
                No Phone Linked
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left About & Services, Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Services */}
        <div className="lg:col-span-2 space-y-8">
          {/* About / Bio Section */}
          <Card className="rounded-3xl border-slate-200/90 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#0f2942]">
                About {profileData.business_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {profileData.bio ||
                  `Dedicated and skilled professional offering reliable ${profileData.category.toLowerCase()} services in Osogbo, Osun State. Committed to quality craftsmanship, honest communication, and customer satisfaction.`}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Specialization</span>
                  <span className="font-bold text-[#0f2942]">{profileData.category}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Service Coverage</span>
                  <span className="font-bold text-[#0f2942]">{profileData.location}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Direct Response</span>
                  <span className="font-bold text-emerald-700">Phone & WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Services List with Interactive Request Modal */}
          <ArtisanServicesSection
            services={servicesData}
            artisanId={profileData.id}
            artisanName={profileData.business_name}
            currentUser={currentUser}
          />

          {/* Customer Reviews Section */}
          <div className="pt-4 space-y-4">
            <h2 className="text-xl font-extrabold text-[#0f2942]">
              Verified Client Reviews ({reviewsList.length})
            </h2>
            <ReviewList reviews={reviewsList} averageRating={profileData.rating} />
          </div>
        </div>

        {/* Right Column: Trust & Booking Card */}
        <div className="space-y-6">
          {/* Trust Guarantee Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0f2942]">
              Why Hire on ArtisanConnect?
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Free Communication:</strong> Connect directly with the artisan
                  with zero middleman commission on project quotes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Local to Osogbo:</strong> Artisans are based right here in Osun State,
                  ensuring faster arrival times and local accountability.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Verified Craftsmanship:</strong> Years of experience and profile details
                  vetted for customer safety.
                </span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-100">
              <div className="rounded-2xl bg-orange-50/70 p-3.5 border border-orange-200/70 text-xs text-orange-950 space-y-1">
                <p className="font-bold">Hiring Tip:</p>
                <p className="text-[11px] leading-relaxed">
                  Always describe your repair or project clearly when calling or sending a WhatsApp message to get an accurate quote.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Safety Reminder */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">Safety & Quality Guidelines</h4>
            <p className="leading-relaxed text-[11px]">
              Inspect completed work before releasing final payment. For large projects, agree upon milestone installments in writing.
            </p>
          </div>

          <div className="text-center pt-2">
            <ArtisanReportButton
              artisanUserId={profileData.user_id}
              businessName={profileData.business_name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
