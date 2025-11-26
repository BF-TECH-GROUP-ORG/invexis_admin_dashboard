"use client";

import React, { use } from "react";
import EditUserForm from "@/components/forms/EditUserForm";
import UsersPageHeader from "@/components/layouts/UsersPageHeader";

export default function EditUserPage({ params }) {
  const { id } = use(params);

  return (
    <div className="p-6">
      <UsersPageHeader
        title="Edit User"
        breadcrumb={[
          { label: "Dashboard", href: "/" },
          { label: "Users", href: "/users/list" },
          { label: "Edit User" },
        ]}
      />
      <EditUserForm userId={id} />
    </div>
  );
}
