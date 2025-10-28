"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { IconButton, InputAdornment } from "@mui/material";
import { HiEye, HiEyeOff } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import { login } from "@/services/AuthService";
import { setToken, setUser } from "@/lib/authUtils";
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
    console.log("Submitting formData:", formData);
    alert(JSON.stringify(formData));

    try {
      const { data } = await login(formData);

      // Store auth data
      setToken(data.accessToken);
      setUser(data.user);

      // Update Redux state
      dispatch(setAuthData({ token: data.accessToken, user: data.user }));

      // Redirect to dashboard
      router.replace("/");
    } catch (err) {
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
    />
  );
}
