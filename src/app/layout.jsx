import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";
import { ThemeRegistry } from "@/providers/ThemeRegistry";
import ClientProviders from "@/providers/ClientProviders";
import ProtectedRoute from "@/providers/ProtectedRoute";
import { SidebarProvider } from "@/contexts/SidebarContext";

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
        <ClientProviders>
          <SidebarProvider>
            <ProtectedRoute>
              <ThemeRegistry>{children}</ThemeRegistry>
            </ProtectedRoute>
          </SidebarProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
