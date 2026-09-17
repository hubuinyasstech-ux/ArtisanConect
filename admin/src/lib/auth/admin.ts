import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Profile, Database } from "@/types/database.types";

export interface AdminAuthContext {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  error: string | null;
}

/**
 * Reusable server-side helper to ensure the user is authenticated, has an active account,
 * and possesses the "admin" role.
 * Always queries PostgreSQL directly to avoid stale JWT metadata or client tampering.
 */
export async function requireAdmin(
  client?: SupabaseClient<Database>
): Promise<AdminAuthContext> {
  const supabase = client || (await createClient());

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return {
      user: null,
      profile: null,
      error: "Authentication required to access the Admin Console.",
    };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    return {
      user: null,
      profile: null,
      error: "User profile record not found.",
    };
  }

  if (profile.status === "suspended") {
    return {
      user: null,
      profile: null,
      error:
        profile.suspension_reason ||
        "Your account has been suspended by platform administration. Access restricted.",
    };
  }

  if (profile.role !== "admin") {
    return {
      user: null,
      profile: null,
      error: "Access denied. Strict Administrator privileges required.",
    };
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
    error: null,
  };
}
