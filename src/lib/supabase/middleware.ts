import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Skip supabase auth if placeholder URL is still configured
  if (supabaseUrl.includes("placeholder")) {
    return { supabaseResponse, user: null, userRole: null, userStatus: "active" };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
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
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) {
        console.warn("Middleware profile lookup warning:", profileErr.message);
      }

      userRole =
        profile?.role ||
        (user.app_metadata?.role as string) ||
        (user.user_metadata?.role as string) ||
        "customer";
      userStatus = profile?.status || "active";
    } catch (err) {
      console.warn("Middleware profile exception:", err);
      userRole =
        (user.app_metadata?.role as string) ||
        (user.user_metadata?.role as string) ||
        "customer";
      userStatus = "active";
    }
  }

  return { supabaseResponse, user, userRole, userStatus };
}
