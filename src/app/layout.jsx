import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ThemeRegistry from "@/providers/ThemeRegistry";
import ClientProviders from "@/providers/ClientProviders";
import ProtectedRoute from "@/providers/ProtectedRoute";
import NotificationProvider from "@/providers/NotificationProvider";
import LoadingProvider from "@/providers/LoadingProvider";

export const metadata = {
  title: {
    default: "Dashboard | Invexis",
    template: "%s | Invexis",
  },
  description: "Invexis Admin Dashboard",
};

import QueryProvider from "@/providers/QueryProvider";

import AuthProvider from "@/providers/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-metropolis antialiased`}>
        <ClientProviders>
          <QueryProvider>
            <ThemeRegistry>
              <LoadingProvider>
                <NotificationProvider>
                  <AuthProvider>
                    <ProtectedRoute>{children}</ProtectedRoute>
                  </AuthProvider>
                </NotificationProvider>
              </LoadingProvider>
            </ThemeRegistry>
          </QueryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
