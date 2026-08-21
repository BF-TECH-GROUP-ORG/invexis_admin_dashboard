"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import SideBar from "@/components/layouts/SideBar";
import TopNavBar from "@/components/layouts/NavBar";

export default function DashboardLayout({ children }) {
  const { expanded, setExpanded } = useSidebar();

  return (
    <div className="flex">
      <SideBar expanded={expanded} setExpanded={setExpanded} />
      <div
        className={`flex-1 transition-all duration-300 min-h-screen ${expanded ? "md:ml-[280px]" : "md:ml-[72px]"
          }`}
      >
        <TopNavBar expanded={expanded} />
        <main className="min-h-screen pt-20 px-4 md:px-8 pb-8">{children}</main>
      </div>
    </div>
  );
}
