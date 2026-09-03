"use client";

import React, { useState } from "react";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createReview } from "@/app/actions/reviews";

interface ReviewFormProps {
  requestId: string;
  artisanName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ requestId, artisanName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createReview({
        request_id: requestId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setIsDone(true);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    } catch {
      setError("Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
        <h4 className="text-sm font-bold text-emerald-900">Review Submitted!</h4>
        <p className="text-xs text-emerald-700">
          Thank you for sharing your feedback. Your review helps other customers find great artisans.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#0f2942]">Rate {artisanName}</h4>
        <p className="text-xs text-slate-500">
          How satisfied were you with the quality, punctuality, and professionalism of the work?
        </p>
      </div>

      {error && (
        <Alert variant="error" className="text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Interactive Star Picker */}
      <div className="flex items-center gap-1.5 py-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300 hover:text-amber-200"
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-600 ml-2">
          {hoverRating || rating} / 5 Stars
        </span>
      </div>

      {/* Review Comment Textarea */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">
          Write a Review (Optional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. Arrived right on time, replaced the pipes neatly, and tested everything before leaving. Highly recommended!"
          className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
        />
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto text-xs">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Submitting Review...
          </>
        ) : (
          "Post Review"
        )}
      </Button>
    </form>
  );
}
