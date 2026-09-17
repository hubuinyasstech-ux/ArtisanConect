import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user, userRole, userStatus } = await updateSession(request);

  const isLoginRoute = pathname === "/login";
  const isUnauthorizedRoute = pathname === "/unauthorized";
  const isPublicRoute = isLoginRoute || isUnauthorizedRoute;

  // 1. Root route: Redirect to /dashboard if admin, else /login
  if (pathname === "/") {
    if (user && userRole === "admin" && userStatus !== "suspended") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Unauthenticated access to protected admin routes -> Redirect to Login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Suspended account attempting access -> Redirect to unauthorized with reason
  if (user && userStatus === "suspended" && !isUnauthorizedRoute) {
    return NextResponse.redirect(new URL("/unauthorized?reason=suspended", request.url));
  }

  // 4. Authenticated admin visiting /login -> Redirect to /dashboard
  if (user && userRole === "admin" && isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. Authenticated non-admin (customer or artisan) attempting to access admin routes -> Block immediately
  if (user && userRole !== "admin" && !isUnauthorizedRoute) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
