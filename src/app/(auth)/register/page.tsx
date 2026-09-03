import React, { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — ArtisanConnect",
  description: "Create an account to hire verified artisans or register your artisan business in Nigeria.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-8 text-neutral-500">Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
