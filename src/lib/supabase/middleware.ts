import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Skip supabase auth if placeholder URL is still configured
  if (supabaseUrl.includes("placeholder")) {
    return { supabaseResponse, user: null, userRole: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Securely retrieve the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;

  if (user) {
    // Fast path: use user_metadata directly from the authenticated session (avoids extra network hop)
    userRole = user.user_metadata?.role || null;

    // Fallback: only query database if role was not in metadata
    if (!userRole) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        userRole = profile?.role || "customer";
      } catch {
        userRole = "customer";
      }
    }
  }

  return { supabaseResponse, user, userRole };
}
