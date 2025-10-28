"use client";
import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings } from "@/store/authActions";
import {
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import IOSSwitch from "@/components/shared/IosSwitch";
import Image from "next/image";
import { ThemeRegistry } from "@/providers/ThemeRegistry";
import { RadioGroup, Radio, FormControl } from "@mui/material";

export default function EditProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeSection, setActiveSection] = useState("profile");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
    desc: user?.desc || "",
    facebook: user?.social?.facebook || "",
    instagram: user?.social?.instagram || "",
    x: user?.social?.x || "",
    linkedin: user?.social?.linkedin || "",
    profileImage: user?.profileImage || "",
    backgroundImage: user?.backgroundImage || "",
    two_fa_enabled: user?.two_fa_enabled || false,
    loginOptions: {
      emailPassword: true,
      google: false,
      phone: false,
      otp: false,
      voice: false,
    },
    email_verified: user?.email_verified || false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLoginOptionToggle = (option) => {
    setFormData((prev) => ({
      ...prev,
      loginOptions: {
        ...prev.loginOptions,
        [option]: !prev.loginOptions[option],
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profileImage: imageURL }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateUserSettings(formData));
  };

  const handleReset = () => {
    setFormData({
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob || "",
      gender: user?.gender || "",
      bio: user?.bio || "",
      desc: user?.desc || "",
      facebook: user?.social?.facebook || "",
      instagram: user?.social?.instagram || "",
      x: user?.social?.x || "",
      linkedin: user?.social?.linkedin || "",
      profileImage: user?.profileImage || "",
      backgroundImage: user?.backgroundImage || "",
      two_fa_enabled: user?.two_fa_enabled || false,
      loginOptions: {
        emailPassword: true,
        google: false,
        phone: false,
        otp: false,
        voice: false,
      },
      email_verified: user?.email_verified || false,
    });
  };

  return (
    <ThemeRegistry>
      <div className="flex flex-col md:flex-row bg-gray-50 rounded-2xl w-full p-6 font-metropolis pb-24">
        {/* Left: Form Content */}
        <div className="flex-1 p-6 rounded-2xl">
          <h5 className="font-bold text-2xl mb-10">
            {activeSection === "profile"
              ? "Edit Profile"
              : activeSection === "account"
              ? "Account Management"
              : "Security Settings"}
          </h5>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {activeSection === "profile" && (
              <>
                <div className="col-span-2 flex items-center gap-6 mb-8">
                  <div className="relative">
                    <Image
                      src={formData.profileImage || "/images/user3.jpg"}
                      alt="Profile"
                      width={90}
                      height={90}
                      className="w-[90px] h-[90px] rounded-full border object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col">
                      <p className="font-semibold text-lg">
                        {formData.fullName || "Your Name"}
                      </p>
                      <p className="font-light text-sm text-gray-400 italic">
                        {formData.username || "Your Name"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-2xl w-fit"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                />
                <TextField
                  label="Description"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  className="col-span-2"
                />
              </>
            )}

            {activeSection === "account" && (
              <>
                <p className="col-span-2 mb-2 font-semibold text-lg">
                  Personal Information
                </p>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
                {!formData.email_verified && (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1, ml: 1, height: "40px" }}
                  >
                    Verify Email
                  </Button>
                )}
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl component="fieldset" className="col-span-2">
                  <p className="mb-2 font-semibold">Gender</p>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl>
                <p className="col-span-2 mt-4 mb-2 font-semibold text-lg">
                  Social Media
                </p>
                <TextField
                  label="Facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="X (Twitter)"
                  name="x"
                  value={formData.x}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  fullWidth
                />
              </>
            )}

            {activeSection === "security" && (
              <div className="col-span-2 flex flex-col gap-6">
                <div>
                  <h6 className="font-bold mb-2 text-xl">
                    Two-Factor Authentication
                  </h6>
                  <p className="text-gray-600 mb-2 text-sm">
                    Add an extra layer of security to your account by enabling
                    two-factor authentication.
                  </p>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={formData.two_fa_enabled}
                        onChange={() => handleToggle("two_fa_enabled")}
                      />
                    }
                    label="Enable 2FA"
                    sx={{
                      fontFamily: "Metropolis",
                      "& .MuiFormControlLabel-label": { marginLeft: 2 },
                    }}
                  />
                </div>

                <div>
                  <h6 className="font-bold mb-2 text-xl">Login Options</h6>
                  <p className="text-gray-600 mb-3 text-sm">
                    Choose which authentication methods you can use to log in.
                  </p>
                  {Object.keys(formData.loginOptions).map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={formData.loginOptions[option]}
                          onChange={() => handleLoginOptionToggle(option)}
                        />
                      }
                      label={option.replace(/([A-Z])/g, " $1")}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full md:w-64 border-l pl-6 mt-6 md:mt-0">
          <h6 className="font-bold mb-6 text-xl font-metropolis">Settings</h6>
          <div className="flex flex-col space-y-4">
            {["profile", "account", "security"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-left font-bold transition-all text-[#081422] duration-200 pb-1 border-b-4  ${
                  activeSection === section
                    ? "border-[#081422]"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                {section === "profile"
                  ? "Edit Profile"
                  : section === "account"
                  ? "Account Management"
                  : "Security"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🧭 Fixed Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-end gap-4 px-6 py-3 md:pl-[calc(256px+1.5rem)]">
        <Button
          variant="contained"
          onClick={handleReset}
          sx={{
            backgroundColor: "#9ca3af", // tailwind gray-400
            color: "#000",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            border: "none",
            ":hover": {
              backgroundColor: "#6b7280", // gray-500 hover
            },
          }}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          type="submit"
          onClick={async (e) => {
            await handleSubmit(e);
            window.location.href = "/account/profile"; // redirect to profile page
          }}
          sx={{
            backgroundColor: "#ff782d",
            textTransform: "none",
            fontWeight: 600,
            ":hover": { opacity: 0.9 },
          }}
        >
          Save
        </Button>
      </div>
    </ThemeRegistry>
  );
}
