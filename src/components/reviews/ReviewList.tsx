import React from "react";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string;
}

interface ReviewListProps {
  reviews: ReviewItem[];
  averageRating: number;
}

export function ReviewList({ reviews, averageRating }: ReviewListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <Star className="h-7 w-7 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-[#0f2942]">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400 font-medium">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500">
              Based on {reviews.length} {reviews.length === 1 ? "verified review" : "verified reviews"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified Client Reviews Only</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center rounded-3xl border-slate-200">
          <CardContent className="space-y-2 p-0">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#0f2942]">No Reviews Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Reviews can only be submitted by verified customers after a service has been completed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="rounded-2xl border-slate-200/90 shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f2942] text-white text-xs font-bold">
                      {rev.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0f2942]">{rev.customer_name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
