"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toggleServiceStatus, deleteService } from "@/app/actions/services";
import { Edit, Trash2, Power } from "lucide-react";

interface ServiceItemActionsProps {
  serviceId: string;
  isActive: boolean;
}

export function ServiceItemActions({ serviceId, isActive }: ServiceItemActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleServiceStatus(serviceId, !isActive);
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle service:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteService(serviceId);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete service:", err);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        isLoading={isToggling}
        className={`text-xs px-2.5 h-8 gap-1 font-medium ${
          isActive
            ? "text-slate-600 hover:text-amber-600"
            : "text-emerald-700 hover:text-emerald-800"
        }`}
      >
        <Power className="h-3.5 w-3.5" />
        <span>{isActive ? "Pause" : "Activate"}</span>
      </Button>

      <div className="flex items-center gap-1">
        <Link href={`/artisan/services/${serviceId}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-2.5 h-8 text-slate-700 hover:text-[#ea580c]"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </Link>

        <Button
          variant={confirmDelete ? "danger" : "ghost"}
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
          className={`text-xs px-2.5 h-8 ${
            confirmDelete
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "text-slate-400 hover:text-rose-600"
          }`}
          title={confirmDelete ? "Click again to confirm deletion" : "Delete service"}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirmDelete && <span className="ml-1 text-[11px]">Confirm?</span>}
        </Button>
      </div>
    </div>
  );
}
