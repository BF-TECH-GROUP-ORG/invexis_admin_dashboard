"use client";

import { useState } from "react";
import Image from "next/image";
import { IconButton, InputAdornment, LinearProgress } from "@mui/material";
import { HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import TermsAndPrivacyPopup from "@/components/layouts/TermsAndPrivacyPopup";
import { useDispatch } from "react-redux";
import { setToken, setRefreshToken, setUser } from "@/lib/authUtils";
import { setAuthData } from "@/features/AuthSlice";
import { registerSuperAdmin } from "@/services/AuthService";
import { useNotification } from "@/providers/NotificationProvider";

export default function SuperAdminRegister() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    role: "super_admin",
    nationalId: "",
    emergencyContact: { name: "", phone: "" },
    address: {
      street: "",
      province: "",
      district: "",
      sector: "",
      country: "",
    },
    preferences: {
      language: "en",
      notifications: {
        email: true,
        sms: true,
        inApp: true,
      },
    },
  });

  const handleTermsClick = () => {
    if (!acceptTerms) setShowTermsPopup(true);
    else setAcceptTerms(false);
  };

  const handleAgree = () => {
    setAcceptTerms(true);
    setShowTermsPopup(false);
  };

  const handleClosePopup = () => setShowTermsPopup(false);

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setFormData((prev) => {
      let updated = { ...prev };
      let temp = updated;
      while (keys.length > 1) {
        const key = keys.shift();
        temp[key] = { ...temp[key] };
        temp = temp[key];
      }
      temp[keys[0]] = value;
      return updated;
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("You must accept the Terms & Privacy Policy to continue.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
        role: formData.role,
        nationalId: formData.nationalId,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        preferences: formData.preferences,
      };
      const { data } = await registerSuperAdmin(payload); 
      
      // if API returns token (auto-login):
      if (data.token || data.accessToken) {
        const token = data.token || data.accessToken;
        setToken(token);
        
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
        }
        
        if (data.user) {
          setUser(data.user);
          dispatch(setAuthData({ 
            token: token, 
            refreshToken: data.refreshToken,
            user: data.user 
          }));
        }
      }

      // success UX
      console.log("Registered:", data);
      showNotification({
        message: "Super Admin registered successfully!",
        severity: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Basic Information",
      fields: [
        {
          label: "First Name",
          type: "text",
          value: formData.firstName,
          onChange: (e) => handleChange("firstName", e.target.value),
          required: true,
        },
        {
          label: "Last Name",
          type: "text",
          value: formData.lastName,
          onChange: (e) => handleChange("lastName", e.target.value),
          required: true,
        },
        {
          label: "Date of Birth",
          type: "date",
          value: formData.dateOfBirth,
          onChange: (e) => handleChange("dateOfBirth", e.target.value),
          required: true,
        },
        {
          label: "National ID",
          type: "text",
          value: formData.nationalId,
          onChange: (e) => handleChange("nationalId", e.target.value),
          required: true,
        },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        {
          label: "Email",
          type: "email",
          value: formData.email,
          onChange: (e) => handleChange("email", e.target.value),
          required: true,
        },
        {
          label: "Phone Number",
          type: "text",
          value: formData.phone,
          onChange: (e) => handleChange("phone", e.target.value),
          required: true,
        },
      ],
    },
    {
      title: "Address Information",
      fields: [
        {
          label: "Street Number",
          type: "text",
          value: formData.address.street,
          onChange: (e) => handleChange("address.street", e.target.value),
          required: true,
        },
        {
          label: "Province",
          type: "text",
          value: formData.address.province,
          onChange: (e) => handleChange("address.province", e.target.value),
          required: true,
        },
        {
          label: "District",
          type: "text",
          value: formData.address.district,
          onChange: (e) => handleChange("address.district", e.target.value),
          required: true,
        },
        {
          label: "Sector",
          type: "text",
          value: formData.address.sector,
          onChange: (e) => handleChange("address.sector", e.target.value),
          required: true,
        },
        {
          label: "Country",
          type: "text",
          value: formData.address.country,
          onChange: (e) => handleChange("address.country", e.target.value),
          required: true,
        },
      ],
    },
    {
      title: "Emergency Contact",
      fields: [
        {
          label: "Contact Name",
          type: "text",
          value: formData.emergencyContact.name,
          onChange: (e) =>
            handleChange("emergencyContact.name", e.target.value),
          required: true,
        },
        {
          label: "Contact Phone",
          type: "text",
          value: formData.emergencyContact.phone,
          onChange: (e) =>
            handleChange("emergencyContact.phone", e.target.value),
          required: true,
        },
      ],
    },
    {
      title: "Preferences & Security",
      fields: [
        {
          label: "Preferred Language",
          type: "select",
          value: formData.preferences.language,
          onChange: (e) => handleChange("preferences.language", e.target.value),
          options: [
            { value: "en", label: "English" },
            { value: "rw", label: "Kinyarwanda" },
            { value: "sw", label: "Kiswahili" },
            { value: "fr", label: "French" },
          ],
        },
        {
          label: "Password",
          type: showPassword ? "text" : "password",
          value: formData.password,
          onChange: (e) => handleChange("password", e.target.value),
          required: true,
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </IconButton>
              </InputAdornment>
            ),
          },
        },
        {
          label: "Confirm Password",
          type: "password",
          value: formData.confirmPassword,
          onChange: (e) => handleChange("confirmPassword", e.target.value),
          required: true,
        },
      ],
    },
  ];

  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-zinc-950">
      {/* Left Image Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-orange-100 relative">
        <Image
          src="/images/8.png"
          alt="Register Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[40%] px-4"
          priority
        />
      </div>

      {/* Right Form Side */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <LinearProgress
            variant="determinate"
            value={(step / steps.length) * 100}
            className="mb-4"
          />
          <FormWrapper
            title={`Step ${step} of ${steps.length}`}
            desc={steps[step - 1].title}
            onSubmit={step === steps.length ? handleSubmit : handleNext}
            submitLabel={step === steps.length ? "Finish" : "Next"}
            submitIcon={<HiArrowRight />}
            isLoading={submitting}
            error={error}
            showTerms={step === steps.length}
            acceptedTerms={acceptTerms}
            onAcceptTerms={handleTermsClick}
            fields={steps[step - 1].fields}
            oauthOptions={[]} // Hide divider when empty
          />
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Terms Popup */}
      <TermsAndPrivacyPopup
        open={showTermsPopup}
        onAgree={handleAgree}
        onClose={handleClosePopup}
      />
    </div>
  );
}
