"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error("Unable to authenticate. Please check your credentials.");
      }

      // Fetch user profile to know where to direct them
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role || data.user.user_metadata?.role || "customer";

      if (redirectParam) {
        router.push(redirectParam);
      } else if (role === "artisan") {
        router.push("/artisan/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/customer/dashboard");
      }

      router.refresh();
    } catch (err: unknown) {
      console.error("Login error:", err);
      let message = "Invalid email or password. Please verify and try again.";
      if (err instanceof Error && err.message && !err.message.toLowerCase().includes("failed to fetch")) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-slate-200/90 rounded-3xl">
      <CardHeader className="text-center space-y-2 pt-8">
        <div className="mx-auto flex justify-center pb-2">
          <Logo size="lg" showText={false} />
        </div>
        <CardTitle className="text-2xl font-extrabold text-[#0f2942]">Welcome Back</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Log in to your ArtisanConnect account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error" title="Login Failed">
              {error}
            </Alert>
          )}

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

          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[#ea580c] hover:text-[#c2410c] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2 font-semibold"
            size="lg"
            isLoading={loading}
          >
            <span>Log In</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-slate-600 pb-8">
        <span>Don&apos;t have an account?</span>
        <Link
          href="/register"
          className="ml-1 text-[#ea580c] font-bold hover:underline"
        >
          Register here
        </Link>
      </CardFooter>
    </Card>
  );
}
