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
  let userStatus: string = "active";

  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .maybeSingle();

      userRole = profile?.role || user.user_metadata?.role || "customer";
      userStatus = profile?.status || "active";
    } catch {
      userRole = user.user_metadata?.role || "customer";
      userStatus = "active";
    }
  }

  return { supabaseResponse, user, userRole, userStatus };
}
