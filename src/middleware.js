import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnAuth = nextUrl.pathname.startsWith("/auth");

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
  const userRole = req.auth?.user?.role;
  if (userRole !== "super_admin") {
    // Unauthorized - redirect to login or an unauthorized page
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // User is authenticated and is super_admin
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
