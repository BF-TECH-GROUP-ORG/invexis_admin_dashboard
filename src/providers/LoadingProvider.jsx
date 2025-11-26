"use client";

import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext(null);

export function useLoading() {
  return useContext(LoadingContext);
}

export default function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(2,6,23,0.45)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="p-6 rounded-lg bg-white flex flex-col items-center gap-4 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <div className="text-sm font-semibold text-[#081422]">Loading…</div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
