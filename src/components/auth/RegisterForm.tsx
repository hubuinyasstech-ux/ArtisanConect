"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { formatNigerianPhone } from "@/lib/utils";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Osogbo, Osun State");
  const [accountType, setAccountType] = useState<"customer" | "artisan">("customer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Form validations
    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g., user@example.com).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (accountType !== "customer" && accountType !== "artisan") {
      setError("Invalid account type selected.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedPhone = formatNigerianPhone(phone.trim());

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: normalizedPhone,
            role: accountType,
            location: location.trim() || "Osogbo, Osun State",
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.session) {
        // Logged in immediately (email confirmation disabled or auto-confirmed)
        const target = accountType === "artisan" ? "/artisan/dashboard" : "/customer/dashboard";
        router.push(target);
        router.refresh();
      } else {
        // Confirmation email was sent
        setSuccessMessage(
          "Registration successful! Please check your email inbox to verify your account before logging in."
        );
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      let message = "An error occurred during registration. Please try again.";
      if (err instanceof Error && err.message) {
        const lower = err.message.toLowerCase();
        if (lower.includes("rate limit")) {
          message =
            "Supabase email rate limit reached (test mailer limit). In your Supabase Dashboard, go to Authentication -> Providers -> Email and turn off 'Confirm email' to enable instant signups without rate limits.";
        } else if (lower.includes("invalid")) {
          message =
            "This email was flagged as invalid by the auth provider. Please use a standard email or disable 'Confirm email' in Supabase Dashboard (Authentication -> Providers -> Email) for local testing.";
        } else {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-slate-200/90 rounded-3xl">
      <CardHeader className="text-center space-y-2 pt-8">
        <div className="mx-auto flex justify-center pb-2">
          <Logo size="lg" showText={false} />
        </div>
        <CardTitle className="text-2xl font-extrabold text-[#0f2942]">Create Your Account</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Join ArtisanConnect to find or offer reliable artisan services in Nigeria
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8">
        {successMessage ? (
          <div className="space-y-4 py-4 text-center">
            <Alert variant="success" title="Check your email">
              {successMessage}
            </Alert>
            <Link href="/login">
              <Button variant="primary" className="w-full mt-4">
                Proceed to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="error" title="Registration Error">
                {error}
              </Alert>
            )}

            {/* Account Type Selector Tabs */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                I want to: <span className="text-[#ea580c]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-medium transition-all ${
                    accountType === "customer"
                      ? "border-[#0f2942] bg-slate-100/80 text-[#0f2942] ring-2 ring-[#0f2942]/15 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <User className="h-5 w-5 mb-1 text-[#0f2942]" />
                  <span className="font-bold">Hire Artisans</span>
                  <span className="text-[11px] text-slate-500">Customer Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("artisan")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-medium transition-all ${
                    accountType === "artisan"
                      ? "border-[#ea580c] bg-orange-50/80 text-[#9a3412] ring-2 ring-[#ea580c]/20 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase className="h-5 w-5 mb-1 text-[#ea580c]" />
                  <span className="font-bold">Offer Services</span>
                  <span className="text-[11px] text-slate-500">Artisan Account</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Babatunde Adeleke"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Input
                label="Phone Number"
                type="tel"
                required
                placeholder="e.g. 0803 123 4567"
                helperText="Used for customer contact"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
              />
            </div>

            <Input
              label="Location"
              type="text"
              required
              placeholder="e.g. Osogbo, Osun State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="h-4 w-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                helperText="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            <Button
              type="submit"
              variant={accountType === "artisan" ? "secondary" : "primary"}
              className="w-full mt-2 font-semibold"
              size="lg"
              isLoading={loading}
            >
              <span>
                Register as {accountType === "artisan" ? "an Artisan" : "a Customer"}
              </span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center text-sm text-slate-600 pb-8">
        <span>Already have an account?</span>
        <Link href="/login" className="ml-1 text-[#ea580c] font-bold hover:underline">
          Log in here
        </Link>
      </CardFooter>
    </Card>
  );
}
