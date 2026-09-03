"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset link. Please check the email entered.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900">Reset Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your email address and we&apos;ll send you a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <Alert variant="success" title="Check your email">
                We have sent a password reset link to <strong>{email}</strong> if an account exists.
              </Alert>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              )}

              <Input
                label="Registered Email Address"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                isLoading={loading}
              >
                <span>Send Reset Link</span>
                <Send className="h-4 w-4 ml-1" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center text-sm text-neutral-600">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
