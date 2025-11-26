"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Edit2, Check } from "lucide-react";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import UserService from "@/services/UserService";

export default function ProfileSidebar({ open, onClose, user }) {
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "other",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      nationalId: user?.nationalId || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
      password: "",
    });
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async (field) => {
    try {
      showLoader();
      const updatePayload = {};
      if (field === "password" && formData.password)
        updatePayload.password = formData.password;
      else if (
        ["street", "city", "state", "postalCode", "country"].includes(field)
      ) {
        updatePayload.address = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        };
      } else updatePayload[field] = formData[field];

      await UserService.updateProfile(updatePayload);
      showNotification({ message: "Profile updated", severity: "success" });
      setEditingField(null);
      if (field === "password") setFormData((p) => ({ ...p, password: "" }));
    } catch (err) {
      console.error(err);
      showNotification({
        message: err?.response?.data?.message || "Failed to update",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const renderEditableField = (label, field, type = "text") => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-gray-500 mb-1 block">
        {label}
      </label>
      <div className="relative flex gap-2 items-center">
        {editingField !== field ? (
          <div className="flex-1 flex justify-between items-center py-2 px-3 rounded bg-gray-50 text-gray-900 font-medium border border-transparent hover:border-gray-200 transition-colors group">
            <span className="truncate">
              {field === "password" ? "••••••••" : formData[field] || "-"}
            </span>
            <button
              onClick={() => setEditingField(field)}
              className="text-gray-400 hover:text-[#ff782d] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 size={14} />
            </button>
          </div>
        ) : (
          <>
            <input
              type={type}
              className="flex-1 py-2 px-3 rounded bg-white text-gray-900 font-medium border border-[#ff782d] focus:outline-none focus:ring-1 focus:ring-[#ff782d]"
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={() => handleUpdateProfile(field)}
                className="p-2 bg-[#ff782d] text-white rounded"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="p-2 bg-gray-200 text-gray-600 rounded"
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 w-full sm:w-96 md:w-[400px] h-full z-50 overflow-y-auto border-l border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X />
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <Image
              src={
                user?.profilePicture ||
                user?.profileImage ||
                "/images/user3.jpg"
              }
              alt={user?.firstName || "User"}
              width={100}
              height={100}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            {(user?.firstName || "") + " " + (user?.lastName || "")}
          </h3>
          <p className="text-sm text-gray-500">
            {user?.role?.replace("_", " ") || "User"}
          </p>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
            Personal Information
          </h4>
          <div className="space-y-1">
            {renderEditableField("First Name", "firstName")}
            {renderEditableField("Last Name", "lastName")}
            {renderEditableField("Email", "email", "email")}
            {renderEditableField("Phone", "phone", "tel")}
            {renderEditableField("Date of Birth", "dateOfBirth", "date")}
            {renderEditableField("National ID", "nationalId")}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
            Address
          </h4>
          <div className="space-y-1">
            {renderEditableField("Street", "street")}
            {renderEditableField("City", "city")}
            {renderEditableField("State", "state")}
            {renderEditableField("Postal Code", "postalCode")}
            {renderEditableField("Country", "country")}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
            Security
          </h4>
          {renderEditableField("New Password", "password", "password")}
        </div>
      </div>
    </div>
  );
}
