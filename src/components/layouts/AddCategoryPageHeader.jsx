"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const AddCategoryPageHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-3 ml-1">
        <Link
          href="/"
          className="hover:text-[#081422] transition-colors font-medium"
        >
          Dashboard
        </Link>
        <ChevronRight size={16} className="text-[#6b7280]" />
        <Link
          href="/categories"
          className="hover:text-[#081422] transition-colors font-medium"
        >
          Categories
        </Link>
        <ChevronRight size={16} className="text-[#6b7280]" />
        <span className="text-[#081422] font-semibold">Add New Category</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#081422] font-metropolis ml-1">
          Add New Category
        </h1>

        <Link
          href="/categories"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#081422] text-white hover:bg-[#0b2036] transition-colors"
        >
          <ChevronRight size={20} />
          View Categories
        </Link>
      </div>
    </div>
  );
};

export default AddCategoryPageHeader;
