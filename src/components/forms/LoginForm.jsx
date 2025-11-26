"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { login } from "@/services/AuthService";
import { setToken, setUser, setRefreshToken } from "@/lib/authUtils";
import { setAuthData } from "@/features/AuthSlice";

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
    setSubmitting(true);

    try {
      console.log("Submitting Login Form Data:", formData);
      const { data } = await login(formData);

      // Support different API shapes (accessToken or token)
      const token = data.accessToken ?? data.token ?? null;
      const refresh = data.refreshToken ?? data.refresh_token ?? null;

      // Store auth data safely
      if (token) setToken(token);
      if (refresh) setRefreshToken(refresh);
      if (data.user) setUser(data.user);

      // Update Redux state (include the token fallback)
      dispatch(
        setAuthData({
          token: token,
          refreshToken: refresh,
          user: data.user ?? null,
        })
      );

      // Redirect to dashboard
      router.replace("/");
    } catch (err) {
      console.error("Login error details:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
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
