"use client";

import DashboardLayout from "./DashboardLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function LayoutWrapper({ children }) {
  return (
    <SidebarProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SidebarProvider>
  );
}
