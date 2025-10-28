"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { isAuthenticated } from "@/lib/authUtils";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";

/**
 * Usage:
 * Wrap protected UI:
 * <ProtectedRoute>
 *   <DashboardLayout>...</DashboardLayout>
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  redirectPath = "/auth/login",
}) {
  const router = useRouter();
  const pathname = usePathname();
  // if you maintain token in redux (features/AuthSlice.js) check it too
  const reduxToken = useSelector((s) => s?.auth?.token);
  const loggedIn = !!reduxToken || isAuthenticated();

  useEffect(() => {
    const isAuthRoute = pathname?.startsWith("/auth");
    if (!loggedIn && !isAuthRoute) {
      // use replace navigation so user can't go back to protected page
      router.replace(redirectPath);
    }
  }, [loggedIn, pathname, router, redirectPath]);

  if (loggedIn) {
    return <LayoutWrapper>{children}</LayoutWrapper>;
  }
  // while checking, simply render children — redirect happens client-side
  return children;
}
