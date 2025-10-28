"use client";
import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    if (saved !== null) setExpanded(saved === "true");
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", String(expanded));
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
