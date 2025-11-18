"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Upload } from "lucide-react";

export default function BulkImportPageHeader() {
  return (
    <div className="mb-8">
      {/* === Breadcrumbs Navigation === */}
      <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-3 ml-1">
        <Link
          href="/"
          className="hover:text-[#081422] transition-colors font-medium"
        >
          Dashboard
        </Link>
        <ChevronRight size={16} className="text-[#6b7280]" />
        <Link
          href="/clients/list"
          className="hover:text-[#081422] transition-colors font-medium"
        >
          Companies
        </Link>
        <ChevronRight size={16} className="text-[#6b7280]" />
        <span className="text-[#081422] font-semibold">Bulk Import</span>
      </div>

      {/* === Title + Button Row === */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#081422] font-metropolis ml-1">
          Bulk Import Companies
        </h1>

        <Link
          href="/clients/list"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#081422] text-white hover:bg-[#0b2036] transition-colors"
        >
          <ChevronRight size={20} />
          View Companies
        </Link>
      </div>
    </div>
  );
}
