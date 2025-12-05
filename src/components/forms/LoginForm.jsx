"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { login } from "@/features/AuthSlice";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    identifier: "", // can be email, phone or username
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

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
      console.log("[LoginForm] Submitting login form with data:", {
        identifier: formData.identifier,
        password: formData.password,
        hasIdentifier: !!formData.identifier,
        hasPassword: !!formData.password,
      });

      // Dispatch login thunk - it handles everything:
      // - API call to /auth/login
      // - Token storage in memory via authUtils.setToken()
      // - Redux state update with token and user
      const result = await dispatch(login(formData));

      console.log("[LoginForm] Login thunk result:", {
        type: result.type,
        fulfilled: login.fulfilled.match(result),
        rejected: login.rejected.match(result),
      });

      if (login.fulfilled.match(result)) {
        // Login successful, redirect to dashboard
        console.log("[LoginForm] Login successful, redirecting to dashboard", {
          hasUser: !!result.payload.user,
          userId: result.payload.user?._id,
          userName: result.payload.user?.firstName,
          hasToken: !!result.payload.token,
        });
        setError(""); // Clear any errors
        router.replace("/");
      } else if (login.rejected.match(result)) {
        // Login failed - show error from thunk
        const errorMessage =
          result.payload?.message || "Login failed. Please try again.";
        setError(errorMessage);
        console.error("[LoginForm] Login rejected:", {
          error: result.payload,
          message: errorMessage,
        });
      } else {
        // Unexpected state
        console.error("[LoginForm] Unexpected login result:", result);
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("[LoginForm] Unexpected error during login:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
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
      oauthOptions={["google"]}
    />
  );
}
