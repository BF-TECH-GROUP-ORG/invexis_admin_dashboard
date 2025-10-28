"use client";

import React from "react";
import { cn } from "@/lib/utils"; // optional helper for merging classes (I'll show alt below if you don’t have it)

/**
 * Base Card component
 */
export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardContent: interior wrapper for padding and layout
 */
export function CardContent({ className = "", children, ...props }) {
  return (
    <div
      className={cn("p-4 md:p-6 flex flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}
