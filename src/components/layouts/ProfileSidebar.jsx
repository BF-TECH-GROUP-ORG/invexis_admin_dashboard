"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  User,
  Shield,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import UserService from "@/services/UserService";

// --- Edit Profile Modal Component ---
const EditProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "other",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        nationalId: user.nationalId || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "",
        password: "", // Password reset optional
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      showLoader();
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationalId: formData.nationalId,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      // We need to pass the updated data back or reload user
      // For now, assuming parent handles re-fetch or session update if needed,
      // but typically we'd call the service here.
      await UserService.updateProfile(payload);

      showNotification({
        message: "Profile updated successfully!",
        severity: "success",
      });
      onUpdate(); // Trigger parent refresh
      onClose();
    } catch (err) {
      console.error(err);
      showNotification({
        message: err?.response?.data?.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Personal Info */}
            <section>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                <InputField
                  label="Gender"
                  name="gender"
                  component="select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </InputField>
                <InputField
                  label="National ID"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Address */}
            <section>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                <InputField
                  label="State / Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
                <InputField
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
                <InputField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </section>

            {/* Security */}
            <section>
              <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                Security
              </h3>
              <InputField
                label="New Password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={handleChange}
              />
            </section>
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 transition-all transform hover:scale-[1.02] flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  component = "input",
  children,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase">
      {label}
    </label>
    {component === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm font-medium text-gray-800"
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-sm font-medium text-gray-800 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      />
    )}
  </div>
);

// --- Main Sidebar Component ---
export default function ProfileSidebar({ open, onClose, user }) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  // We can add a function to refresh user data if needed here,
  // but usually session updates happen at the top level or via context.
  // For now we just rely on parent 'user' prop updates.
  const handleProfileUpdated = () => {
    // You might want to trigger a session refresh here using NextAuth's update()
    // but strict separation of concerns means waiting for props to update is safer visually.
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full sm:w-[400px] h-full z-50 bg-white shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Header with Gradient */}
              <div className="relative h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex justify-end p-4">
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Info Overlaying Header */}
              <div className="px-8 -mt-16 flex flex-col items-center relative z-10 mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl">
                    <img
                      src={
                        user?.profilePicture ||
                        user?.profileImage ||
                        "/images/user3.jpg"
                      }
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full hover:bg-orange-500 transition-colors shadow-lg border-2 border-white"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {(user?.firstName || "") + " " + (user?.lastName || "")}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide">
                      {user?.role?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-8 mb-6">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                >
                  <Edit2 size={18} />
                  Edit Profile Details
                </button>
              </div>

              {/* Details Scroll Area */}
              <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
                {/* Contact Info */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    <User size={16} /> Personal Information
                  </h4>
                  <div className="space-y-4">
                    <InfoItem
                      icon={<Mail size={16} />}
                      label="Email"
                      value={user?.email}
                    />
                    <InfoItem
                      icon={<Phone size={16} />}
                      label="Phone"
                      value={user?.phone}
                    />
                    <InfoItem
                      icon={<Calendar size={16} />}
                      label="Date of Birth"
                      value={
                        user?.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString()
                          : "-"
                      }
                    />
                    <InfoItem
                      icon={<CreditCard size={16} />}
                      label="National ID"
                      value={user?.nationalId}
                    />
                  </div>
                </section>

                <div className="h-px bg-gray-100" />

                {/* Address */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    <MapPin size={16} /> Address
                  </h4>
                  {user?.address ? (
                    <div className="space-y-4">
                      <InfoItem label="Street" value={user.address.street} />
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="City" value={user.address.city} />
                        <InfoItem label="State" value={user.address.state} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoItem
                          label="Zip Code"
                          value={user.address.postalCode}
                        />
                        <InfoItem
                          label="Country"
                          value={user.address.country}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No address information added.
                    </p>
                  )}
                </section>

                <div className="h-px bg-gray-100" />

                <section className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">
                        Account Security
                      </h5>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Your account is secured. If you notice any suspicious
                        activity, please change your password immediately.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModalOpen && (
          <EditProfileModal
            user={user}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onUpdate={handleProfileUpdated}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
      {icon} {label}
    </span>
    <span className="text-sm font-semibold text-gray-800 break-words">
      {value || "Not set"}
    </span>
  </div>
);
