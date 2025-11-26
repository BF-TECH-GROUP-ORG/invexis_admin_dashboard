"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { isAuthenticated } from "@/lib/authUtils";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";
import { useLoading } from "@/providers/LoadingProvider";

/**
 * Usage:
 * Wrap the entire app content in layout.jsx
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { showLoader, hideLoader } = useLoading();
  const [isVerified, setIsVerified] = useState(false);

  // Check Redux token first, then localStorage
  const reduxToken = useSelector((s) => s?.auth?.token);
  
  useEffect(() => {
    const checkAuth = () => {
      const isAuthRoute = pathname?.startsWith("/auth");
      const hasToken = !!reduxToken || isAuthenticated();

      if (isAuthRoute) {
        // If on auth route (login/register) and logged in, redirect to dashboard?
        // Optional: if (hasToken) router.replace("/");
        setIsVerified(true);
      } else {
        // Protected route
        if (!hasToken) {
          router.replace("/auth/login");
        } else {
          setIsVerified(true);
        }
      }
    };

    checkAuth();
  }, [pathname, reduxToken, router]);

  // Prevent flash of protected content
  if (!isVerified) {
    return null; // Or a loading spinner
  }

  const isAuthRoute = pathname?.startsWith("/auth");

  // If it's an auth route, render without LayoutWrapper (no sidebar)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // If protected route, wrap with LayoutWrapper (sidebar/navbar)
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
