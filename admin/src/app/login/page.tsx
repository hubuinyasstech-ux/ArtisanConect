import React, { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export const metadata = {
  title: "Administrator Sign In — ArtisanConnect",
  description: "Secure login portal for ArtisanConnect administrators.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#070f1a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-slate-400">Loading console authentication...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
