import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user, userRole, userStatus } = await updateSession(request);

  // Set x-pathname header so Server Components can inspect current URL path if needed
  supabaseResponse.headers.set("x-pathname", pathname);

  // 1. If any request hits legacy /admin paths, redirect to the standalone Admin frontend
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const adminBaseUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    return NextResponse.redirect(new URL(adminBaseUrl));
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  const isCustomerRoute = pathname === "/customer" || pathname.startsWith("/customer/");
  const isArtisanRoute =
    (pathname === "/artisan" || pathname.startsWith("/artisan/")) &&
    !pathname.startsWith("/artisans");

  const isProtectedRoute = isCustomerRoute || isArtisanRoute;

  // 2. Unauthenticated users trying to access protected routes -> Redirect to Login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Suspended users trying to access protected features -> Redirect to Suspended page
  if (user && isProtectedRoute && userStatus === "suspended" && pathname !== "/suspended") {
    return NextResponse.redirect(new URL("/suspended", request.url));
  }

  // 4. Authenticated users trying to access Auth routes (login/register) -> Redirect to their dedicated dashboard
  if (user && isAuthRoute) {
    let target = "/customer/dashboard";
    if (userRole === "artisan") target = "/artisan/dashboard";
    if (userRole === "admin") {
      const adminBaseUrl =
        process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
      return NextResponse.redirect(new URL("/dashboard", adminBaseUrl));
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 5. Role-based access control for protected sections
  if (user && isProtectedRoute) {
    if (isArtisanRoute && userRole !== "artisan" && userRole !== "admin") {
      // Customers cannot access artisan routes
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }

    if (isCustomerRoute && userRole !== "customer" && userRole !== "admin") {
      // Artisans cannot access customer routes
      return NextResponse.redirect(new URL("/artisan/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
