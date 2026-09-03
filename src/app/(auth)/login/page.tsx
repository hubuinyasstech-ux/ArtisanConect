import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In — ArtisanConnect",
  description: "Log in to your ArtisanConnect account to connect with artisans or manage your requests.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-8 text-neutral-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
