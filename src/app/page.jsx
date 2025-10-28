"use client";
import Image from "next/image";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Home() {
  const { expanded } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 ${
        expanded ? "ml-64" : "ml-20"
      } font-sans min-h-screen bg-gray-50`}
    >
      <main className="flex flex-col gap-8">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-semibold text-[#081422]">Welcome Home</h1>
        <p className="text-gray-600">This page automatically responds to sidebar state ✨</p>
      </main>
    </div>
  );
}
