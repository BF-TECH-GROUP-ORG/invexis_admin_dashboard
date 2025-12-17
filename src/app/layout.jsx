import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ThemeRegistry from "@/providers/ThemeRegistry";
import ClientProviders from "@/providers/ClientProviders";
import ProtectedRoute from "@/providers/ProtectedRoute";
import NotificationProvider from "@/providers/NotificationProvider";
import LoadingProvider from "@/providers/LoadingProvider";
import NextAuthProvider from "@/providers/NextAuthProvider";
import WebSocketProvider from "@/providers/WebSocketProvider";

export const metadata = {
  title: {
    default: "Dashboard | Invexis",
    template: "%s | Invexis",
  },
  description: "Invexis Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-metropolis antialiased`}>
        <NextAuthProvider>
          <ClientProviders>
            <WebSocketProvider>
              <ThemeRegistry>
                <LoadingProvider>
                  <NotificationProvider>
                    <ProtectedRoute>{children}</ProtectedRoute>
                  </NotificationProvider>
                </LoadingProvider>
              </ThemeRegistry>
            </WebSocketProvider>
          </ClientProviders>
        </NextAuthProvider>
      </body>
    </html>
  );
}
