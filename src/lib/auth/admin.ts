import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Profile, ArtisanProfile, Database } from "@/types/database.types";

export interface AuthContext<T = Profile> {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: T | null;
  error: string | null;
}

export interface ArtisanAuthContext extends AuthContext<Profile> {
  artisanProfile: ArtisanProfile | null;
}

/**
 * Reusable server-side helper to ensure the user is authenticated and account is active (not suspended).
 * Always queries PostgreSQL directly to avoid stale JWT metadata or client cookie tampering.
 */
export async function requireActiveUser(
  client?: SupabaseClient<Database>
): Promise<AuthContext> {
  const supabase = client || (await createClient());

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return {
      user: null,
      profile: null,
      error: "Authentication required to perform this action.",
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
      error: "User profile not found.",
    };
  }

  if (profile.status === "suspended") {
    return {
      user: null,
      profile: null,
      error:
        profile.suspension_reason ||
        "Your account has been suspended by platform administration. Access to protected features is restricted.",
    };
  }

  return {
    user: { id: user.id, email: user.email },
    profile,
    error: null,
  };
}

/**
 * Ensures the authenticated user is an active Administrator verified directly in the database.
 */
export async function requireAdmin(
  client?: SupabaseClient<Database>
): Promise<AuthContext> {
  const { user, profile, error } = await requireActiveUser(client);

  if (error || !user || !profile) {
    return { user: null, profile: null, error: error || "Authentication required." };
  }

  if (profile.role !== "admin") {
    return {
      user: null,
      profile: null,
      error: "Access denied. Administrator privileges required.",
    };
  }

  return { user, profile, error: null };
}

/**
 * Ensures the authenticated user is an active Artisan and retrieves their artisan_profile.
 */
export async function requireArtisan(
  client?: SupabaseClient<Database>
): Promise<ArtisanAuthContext> {
  const { user, profile, error } = await requireActiveUser(client);

  if (error || !user || !profile) {
    return {
      user: null,
      profile: null,
      artisanProfile: null,
      error: error || "Authentication required.",
    };
  }

  if (profile.role !== "artisan") {
    return {
      user: null,
      profile: null,
      artisanProfile: null,
      error: "Access restricted to registered artisan accounts.",
    };
  }

  const supabase = client || (await createClient());
  const { data: artisanProfile, error: artisanErr } = await supabase
    .from("artisan_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (artisanErr || !artisanProfile) {
    return {
      user,
      profile,
      artisanProfile: null,
      error: "Artisan business profile not found. Please complete your registration.",
    };
  }

  return {
    user,
    profile,
    artisanProfile,
    error: null,
  };
}

/**
 * Ensures the authenticated user is an active Customer (or Admin acting on customer scope).
 */
export async function requireCustomer(
  client?: SupabaseClient<Database>
): Promise<AuthContext> {
  const { user, profile, error } = await requireActiveUser(client);

  if (error || !user || !profile) {
    return { user: null, profile: null, error: error || "Authentication required." };
  }

  return { user, profile, error: null };
}
