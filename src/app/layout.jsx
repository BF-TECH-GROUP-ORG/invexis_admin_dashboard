import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ThemeRegistry from "@/providers/ThemeRegistry";
import ClientProviders from "@/providers/ClientProviders";
import ProtectedRoute from "@/providers/ProtectedRoute";
import NotificationProvider from "@/providers/NotificationProvider";
import LoadingProvider from "@/providers/LoadingProvider";
import NextAuthProvider from "@/providers/NextAuthProvider";
import WebSocketProvider from "@/providers/WebSocketProvider";
import { PushProvider } from "@/providers/PushProvider";

export const metadata = {
  title: {
    default: "Dashboard | Invexis",
    template: "%s | Invexis",
  },
  description: "Invexis Admin Dashboard",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-metropolis antialiased`} suppressHydrationWarning>
        <NextAuthProvider>
          <ClientProviders>
            <WebSocketProvider>
              <ThemeRegistry>
                <LoadingProvider>
                  <NotificationProvider>
                    <PushProvider>
                      <ProtectedRoute>{children}</ProtectedRoute>
                    </PushProvider>
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
