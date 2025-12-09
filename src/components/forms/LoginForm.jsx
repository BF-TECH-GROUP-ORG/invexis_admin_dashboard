"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { loginAction } from "@/actions/auth";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    identifier: "", // can be email, phone or username
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form before submitting
    if (!formData.identifier.trim()) {
      setError("Please enter your email, phone, or username");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for server action
      const formDataObj = new FormData();
      formDataObj.append("identifier", formData.identifier);
      formDataObj.append("password", formData.password);

      const result = await loginAction(null, formDataObj);

      if (result?.success) {
        // Login successful, redirect to dashboard
        router.push("/");
        router.refresh();
      } else {
        // Login failed - show error
        setError(result || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("[LoginForm] Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormWrapper
      title="Welcome Back"
      desc="Sign in to your account"
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      isLoading={submitting}
      error={error}
      fields={[
        {
          label: "Email, Phone or Username",
          type: "text",
          value: formData.identifier,
          onChange: (e) => handleChange("identifier", e.target.value),
          required: true,
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
      ]}
    />
  );
}
