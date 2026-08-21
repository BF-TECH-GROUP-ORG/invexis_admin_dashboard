import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const { nextUrl } = req;
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // 🛡️ CRITICAL: Move logging to TOP to see what's happening
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware Request] Path: ${nextUrl.pathname}`);
  }

  // Improved asset check: anything with a dot, or in common asset folders
  const isAsset =
    nextUrl.pathname.includes(".") ||
    nextUrl.pathname.startsWith("/images/") ||
    nextUrl.pathname.startsWith("/fonts/") ||
    nextUrl.pathname.startsWith("/icons/") ||
    nextUrl.pathname.startsWith("/assets/") ||
    nextUrl.pathname.startsWith("/_next/");

  if (isAsset || isApiRoute) {
    if (process.env.NODE_ENV === "development" && isAsset) {
      console.log(`[Middleware Bypass] Asset: ${nextUrl.pathname}`);
    }
    return NextResponse.next();
  }

  // Check for session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isOnAuth = nextUrl.pathname.startsWith("/auth");

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Middleware Auth] Path: ${nextUrl.pathname} | LoggedIn: ${isLoggedIn} | Role: ${session?.user?.role}`
    );
  }

  // Allow access to auth pages if not logged in
  if (isOnAuth) {
    if (isLoggedIn) {
      // Redirect logged-in users away from auth pages
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // For all other routes, check authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // Check if user is super_admin
  const userRole = session?.user?.role;
  if (userRole !== "super_admin") {
    console.warn(
      `[Middleware] Unauthorized role: ${userRole} for path ${nextUrl.pathname}`
    );
    // Unauthorized - redirect to login or an unauthorized page
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // User is authenticated and is super_admin
  return NextResponse.next();
});

export const config = {
  // Broad matcher, logic inside middleware handles exclusions properly now
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
