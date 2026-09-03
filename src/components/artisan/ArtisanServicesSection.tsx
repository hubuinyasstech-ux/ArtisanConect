"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MapPin, CalendarPlus, Briefcase } from "lucide-react";
import { RequestServiceModal, RequestModalService } from "@/components/requests/RequestServiceModal";

export interface PublicServiceDetail {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  description: string | null;
}

interface ArtisanServicesSectionProps {
  services: PublicServiceDetail[];
  artisanId: string;
  artisanName: string;
  currentUser: {
    id: string;
    role: string;
  } | null;
}

export function ArtisanServicesSection({
  services,
  artisanId,
  artisanName,
  currentUser,
}: ArtisanServicesSectionProps) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<RequestModalService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestClick = (service: PublicServiceDetail) => {
    if (!currentUser) {
      router.push(`/login?redirect=/artisans/${artisanId}`);
      return;
    }

    setSelectedService({
      id: service.id,
      title: service.title,
      price: service.price,
      category: service.category,
      artisan_id: artisanId,
      artisan_name: artisanName,
    });
    setIsModalOpen(true);
  };

  const handleCustomRequest = () => {
    if (!currentUser) {
      router.push(`/login?redirect=/artisans/${artisanId}`);
      return;
    }

    setSelectedService({
      id: "custom",
      title: "Custom Service Request",
      price: 0,
      category: services[0]?.category || "General",
      artisan_id: artisanId,
      artisan_name: artisanName,
    });
    setIsModalOpen(true);
  };

  return (
    <div id="services-section" className="space-y-4 scroll-mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#0f2942]">
          Services & Starting Estimates ({services.length})
        </h2>
        <span className="text-xs text-slate-500 font-medium">
          Transparent starting rates
        </span>
      </div>

      {services.length === 0 ? (
        <Card className="p-8 text-center rounded-3xl border-slate-200 bg-slate-50/50">
          <CardContent className="space-y-4 p-0">
            <Briefcase className="h-10 w-10 text-[#ea580c] mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0f2942]">Custom Service & Consultation</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This artisan has not published preset packages yet, but is actively available for job bookings in Osogbo.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCustomRequest}
              className="font-bold gap-2 shadow-xs bg-[#ea580c] hover:bg-[#c2410c] text-white"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Request Service from {artisanName}</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className="rounded-3xl border-slate-200/90 shadow-xs hover:border-[#ea580c] transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">
                        {service.category}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#ea580c]" />
                        {service.location}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0f2942]">
                      {service.title}
                    </h3>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Starts from
                    </span>
                    <span className="text-xl font-extrabold text-[#0f2942]">
                      {formatNaira(service.price)}
                    </span>
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    No upfront booking fee
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleRequestClick(service)}
                    className="text-xs font-semibold shadow-xs"
                  >
                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                    Request This Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Custom Quote Inquiry Box */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-[#0f2942]">Need custom work or a different service?</span>
              <p className="text-slate-500">You can submit a custom job inquiry directly to {artisanName}.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCustomRequest}
              className="text-xs font-bold shrink-0 border-[#ea580c] text-[#ea580c] hover:bg-orange-50"
            >
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
              Request Custom Quote
            </Button>
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      <RequestServiceModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
