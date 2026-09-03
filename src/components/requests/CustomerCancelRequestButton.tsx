"use client";

import React, { useState } from "react";
import { cancelServiceRequest } from "@/app/actions/requests";
import { Button } from "@/components/ui/Button";
import { Loader2, XCircle } from "lucide-react";

interface CustomerCancelRequestButtonProps {
  requestId: string;
}

export function CustomerCancelRequestButton({ requestId }: CustomerCancelRequestButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await cancelServiceRequest(requestId);
    setIsCancelling(false);
    setIsConfirming(false);
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Cancel request?</span>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={handleCancel}
          disabled={isCancelling}
          className="text-xs px-2.5 py-1 h-auto"
        >
          {isCancelling ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
          Yes, Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsConfirming(false)}
          disabled={isCancelling}
          className="text-xs px-2.5 py-1 h-auto"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => setIsConfirming(true)}
      className="text-xs text-slate-500 hover:text-red-600 hover:border-red-200"
    >
      <XCircle className="h-3.5 w-3.5 mr-1" />
      Cancel Request
    </Button>
  );
}
