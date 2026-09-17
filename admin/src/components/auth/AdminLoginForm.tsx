"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Shield, Lock, Mail, Eye, EyeOff, ExternalLink } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const marketplaceUrl =
    process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error("Unable to authenticate administrator. Please verify your credentials.");
      }

      // Query database directly to confirm role and active status
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role, status, suspension_reason")
        .eq("id", data.user.id)
        .single();

      if (profileErr || !profile) {
        await supabase.auth.signOut();
        throw new Error("Administrator profile not found in database.");
      }

      if (profile.status === "suspended") {
        await supabase.auth.signOut();
        throw new Error(
          profile.suspension_reason ||
            "Access Denied: This administrator account has been suspended by governance."
        );
      }

      if (profile.role !== "admin") {
        // Immediate sign out and explicit rejection of customer or artisan accounts
        await supabase.auth.signOut();
        throw new Error(
          `Access Denied: Account role is "${profile.role}". The Admin Console is strictly reserved for platform administrators. Please use the public marketplace.`
        );
      }

      router.push(redirectParam.startsWith("/login") ? "/dashboard" : redirectParam);
      router.refresh();
    } catch (err: unknown) {
      console.error("Admin login error:", err);
      let message = "Invalid email or password. Please verify your administrator credentials.";
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-slate-800/90 bg-[#0a1523] text-white rounded-3xl">
      <CardHeader className="text-center space-y-3 pt-8 pb-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-[#ea580c]/30">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <div className="inline-block text-[10px] font-black uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full mb-1">
            ArtisanConnect Platform
          </div>
          <CardTitle className="text-2xl font-black text-white tracking-tight">
            Administrator Console
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Authorized personnel only. Direct multi-factor credential check enforced.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error" title="Access Denied">
              {error}
            </Alert>
          )}

          <Input
            label="Administrator Email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@artisanconnect.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500"
          />

          <div className="space-y-1">
            <div className="relative">
              <Input
                label="Master Password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full font-bold shadow-md shadow-[#ea580c]/30 text-sm mt-2"
            isLoading={loading}
          >
            Authenticate & Access Console
          </Button>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Forgot administrator password? Contact the lead infrastructure engineer.
            </p>

            <a
              href={marketplaceUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <span>Return to Public Marketplace</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
