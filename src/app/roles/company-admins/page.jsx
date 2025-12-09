import React from "react";
import CompanyAdminsTable from "@/components/layouts/CompanyAdminsTable";

export const metadata = { title: "Company Admins" };

export default function CompanyAdminsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <CompanyAdminsTable />
      </div>
    </div>
  );
}
