"use client";

import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Building,
  Shield,
  Key,
} from "lucide-react";
import { Switch, FormControlLabel } from "@mui/material";
import { updateUserSettings } from "@/store/authActions";
import {
  AccessAlarmOutlined,
  AutoAwesomeOutlined,
  InfoOutlineRounded,
  MarkEmailReadOutlined,
  MonetizationOnOutlined,
  PasswordOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import IOSSwitch from "@/components/shared/IosSwitch";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("info");
  const [settings, setSettings] = useState({
    two_fa_enabled: user?.two_fa_enabled || false,
    ai_voice_login_enabled: user?.ai_voice_login_enabled || false,
    email_verified: user?.email_verified || false,
  });

  const handleToggle = (field) => {
    const newValue = !settings[field];
    setSettings((prev) => ({ ...prev, [field]: newValue }));

    dispatch(updateUserSettings({ [field]: newValue }));
  };

  const tabs = [
    { id: "info", label: "User Info" },
    { id: "social", label: "Social Info" },
    { id: "account", label: "Account Info" },
    { id: "security", label: "Security Info" },
  ];

  return (
    <div className="no-scrollbar flex-1">
      {/* Cover Background */}
      <div className="relative rounded-3xl h-72 w-full bg-gradient-to-r from-[#081422] to-purple-600">
        <Image
          src="/images/background.jpeg"
          alt="Profile Background"
          fill
          className="object-cover opacity-70 w-full rounded-3xl"
        />
      </div>

      {/* Profile Avatar */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative flex justify-center">
          <div className="absolute -top-16">
            <Image
              src={user?.profileImage || "/images/user3.jpg"}
              alt={user?.username || "User Avatar"}
              width={200}
              height={200}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.username || "Guest User"}
          </h1>
          <p className="text-gray-500">{user?.email || "No email available"}</p>
          <p className="text-xs text-gray-400 mt-1">
            Role: <span className="capitalize">{user?.role || "user"}</span>
          </p>

          <div className="mt-4 flex justify-center gap-4">
            <Link href="/account/edit-profile">
              <button className="px-4 py-2 bg-[#081422] text-white rounded-lg hover:bg-[#0f2239]">
                Edit Profile
              </button>
            </Link>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Settings
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8">
          <div className="flex justify-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 -mb-px font-semibold text-gray-600 border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#081422] text-[#081422]"
                    : "border-transparent hover:text-[#081422]"
                } transition`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 bg-gray-100 rounded-2xl p-6">
            {/* User Information */}
            {activeTab === "info" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Location */}
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="text-gray-800">
                      {user?.location || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Phone</h3>
                    <p className="text-gray-800">{user?.phone || "N/A"}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="flex items-center gap-4 col-span-2">
                  <InfoOutlineRounded className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Bio</h3>
                    <p className="text-gray-800">
                      {user?.bio || "No bio added yet."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {activeTab === "social" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 hover:text-blue-500 hover:underline hover:underline-blue-500 transition-all duration-300">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-800 ">{user?.social?.facebook}</p>
                </div>
                <div className="flex items-center gap-4 hover:text-blue-500 hover:underline hover:underline-blue-500 transition-all duration-300">
                  <Instagram className="w-6 h-6 text-pink-500" />
                  <p className="text-gray-800 ">{user?.social?.instagram}</p>
                </div>
                <div className="flex items-center gap-4 hover:text-blue-500 hover:underline hover:underline-blue-500 transition-all duration-300">
                  <Twitter className="w-6 h-6 text-blue-400" />
                  <p className="text-gray-800 ">{user?.social?.x}</p>
                </div>
                <div className="flex items-center gap-4 hover:text-blue-500 hover:underline hover:underline-blue-500 transition-all duration-300">
                  <Linkedin className="w-6 h-6 text-blue-800" />
                  <p className="text-gray-800 ">{user?.social?.linkedin}</p>
                </div>
              </div>
            )}

            {/* Account Info */}
            {activeTab === "account" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Company */}
                <div className="flex items-center gap-4">
                  <Building className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Company
                    </h3>
                    <p className="text-gray-800">
                      {user?.company?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Plan */}
                <div className="flex items-center gap-4">
                  <MonetizationOnOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Plan</h3>
                    <p className="text-gray-800">
                      {user?.company?.tier || "Free"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Info */}
            {activeTab === "security" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Password Change */}
                <div className="flex items-center gap-4">
                  <PasswordOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Password Change
                    </h3>
                    <button className="mt-1 px-3 py-1 bg-[#081422] text-white rounded-2xl hover:bg-[#0f2239]">
                      Change / Reset
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="flex items-center gap-4">
                  <AccessAlarmOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Active Sessions
                    </h3>
                    <p className="text-gray-800">
                      {user?.active_sessions || "1 session"}
                    </p>
                  </div>
                </div>

                {/* Roles & Permissions */}
                <div className="flex items-center gap-4">
                  <Key className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Roles & Permissions
                    </h3>
                    <p className="text-gray-800">{user?.role || "user"}</p>
                  </div>
                </div>

                {/* 2FA Status */}
                <div className="flex items-center gap-4">
                  <SecurityOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          checked={settings.two_fa_enabled}
                          onChange={() => handleToggle("two_fa_enabled")}
                        />
                      }
                      label="2FA Enabled"
                      sx={{
                        fontFamily: "Metropolis",
                        "& .MuiFormControlLabel-label": { marginLeft: 2 },
                      }}
                    />
                  </div>
                </div>

                {/* AI Voice Login */}
                <div className="flex items-center gap-4">
                  <AutoAwesomeOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      AI Voice Authentication
                    </h3>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          checked={settings.ai_voice_login_enabled}
                          onChange={() =>
                            handleToggle("ai_voice_login_enabled")
                          }
                        />
                      }
                      label="AI Voice Login"
                      sx={{
                        fontFamily: "Metropolis",
                        "& .MuiFormControlLabel-label": { marginLeft: 2 },
                      }}
                    />
                  </div>
                </div>

                {/* Email Verified */}
                <div className="flex items-center gap-4">
                  <MarkEmailReadOutlined className="text-gray-500" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">
                      Email Verification
                    </h3>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          checked={settings.email_verified}
                          onChange={() => handleToggle("email_verified")}
                        />
                      }
                      label="Email Verified"
                      sx={{
                        fontFamily: "Metropolis",
                        "& .MuiFormControlLabel-label": { marginLeft: 2 },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
