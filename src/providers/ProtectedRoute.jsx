"use client";

import { usePathname } from "next/navigation";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";

/**
 * ProtectedRoute now only handles layout rendering.
 * Authentication is handled by NextAuth middleware in src/middleware.js
 */
export default function ProtectedRoute({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");

  // If it's an auth route, render without LayoutWrapper (no sidebar)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // If protected route, wrap with LayoutWrapper (sidebar/navbar)
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
