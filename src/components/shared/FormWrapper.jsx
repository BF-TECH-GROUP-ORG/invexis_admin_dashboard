"use client";

import React, { useState } from "react";
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  HiArrowRight,
  HiCog,
  HiEye,
  HiDevicePhoneMobile,
  HiKey,
} from "react-icons/hi2";
import { HiEyeOff } from "react-icons/hi";
import { FaGoogle, FaApple } from "react-icons/fa";
import Link from "next/link";

function PasswordField({ field, isPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {field.before && <section>{field.before}</section>}
      <TextField
        name={field.name}
        label={field.label}
        type={isPassword && !showPassword ? "password" : field.type}
        value={field.value}
        onChange={field.onChange}
        required={field.required}
        placeholder={field.placeholder}
        fullWidth
        disabled={field.disabled}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
          },
          "& .MuiInputLabel-root": {
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
          },
        }}
        InputProps={{
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </IconButton>
            </InputAdornment>
          ) : (
            field.InputProps?.endAdornment
          ),
        }}
      />
      {field.after && <section>{field.after}</section>}
    </div>
  );
}

export default function FormWrapper({
  title,
  desc,
  fields = [],
  onSubmit,
  submitLabel = "Submit",
  submitIcon = <HiArrowRight />,
  oauthOptions = [],
  extraLinks = [],
  showDivider = true,
  isLoading = false,
  error = null,
  success = null,
  showTerms = false, // NEW → show checkbox dynamically
  onAcceptTerms = () => {},
  acceptedTerms = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900">
      {/* Header + Help */}
      <div className="fixed top-10 right-10 flex items-center justify-center gap-8">
        <Link href="#" className="hover:underline text-sm text-gray-500">
          Need Help?
        </Link>
        <IconButton
          sx={{
            borderRadius: "50%",
            border: "1px solid #e0e0e0",
            width: "50px",
            height: "50px",
          }}
        >
          <HiCog />
        </IconButton>
      </div>

      {/* Title & Description */}
      {title && (
        <h2 className="text-3xl font-extrabold text-center mb-2 text-zinc-800 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {desc && <p className="text-center text-gray-500 mb-6 text-sm">{desc}</p>}

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 text-center border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4 text-center border border-green-200">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {fields.map((field, idx) => {
          if (field.hidden) return null;
          const isPassword = field.type === "password";

          return (
            <PasswordField key={idx} field={field} isPassword={isPassword} />
          );
        })}

        {/* Terms & Conditions Checkbox */}
        {showTerms && (
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => onAcceptTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <span className="text-sm text-gray-600 font-metropolis">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:underline font-metropolis"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline font-metropolis"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            }
            sx={{ mt: 1 }}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          className="flex items-center justify-center mt-2"
          endIcon={!isLoading && submitIcon}
          sx={{
            borderRadius: "12px",
            height: "50px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            textTransform: "none",
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      {/* Divider */}
      {showDivider && (
        <div className="flex items-center my-10">
          <Divider className="flex-grow" />
          <span className="px-4 text-gray-500 font-medium">or</span>
          <Divider className="flex-grow" />
        </div>
      )}

      {/* OAuth + Phone + OTP Authentication */}
      <div className="flex justify-center  gap-4 flex-wrap">
        {oauthOptions.includes("google") && (
          <IconButton
            onClick={() => (window.location.href = "/api/auth/google")}
            sx={{
              borderRadius: "50%",
              border: "1px solid #e0e0e0",
              width: "50px",
              height: "50px",
            }}
          >
            <FaGoogle className="text-xl text-red-500" />
          </IconButton>
        )}
        {oauthOptions.includes("apple") && (
          <IconButton
            sx={{
              borderRadius: "50%",
              border: "1px solid #e0e0e0",
              width: "50px",
              height: "50px",
            }}
          >
            <FaApple className="text-2xl text-black" />
          </IconButton>
        )}

        {oauthOptions.includes("phone") && (
          <IconButton
            onClick={() => (window.location.href = "#")}
            sx={{
              borderRadius: "50%",
              border: "1px solid #e0e0e0",
              width: "50px",
              height: "50px",
            }}
          >
            <HiDevicePhoneMobile className="text-2xl text-blue-600" />
          </IconButton>
        )}

        {oauthOptions.includes("otp") && (
          <IconButton
            onClick={() => (window.location.href = "/auth/otp-login/request")}
            sx={{
              borderRadius: "50%",
              border: "1px solid #e0e0e0",
              width: "50px",
              height: "50px",
            }}
          >
            <HiKey className="text-2xl text-green-600" />
          </IconButton>
        )}
      </div>

      {/* Extra Links */}
      {extraLinks.length > 0 && (
        <div className="flex flex-col items-center mt-8 space-y-2">
          {extraLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="flex items-center justify-center text-blue-600 gap-2 hover:underline font-metropolis text-sm"
            >
              {link.icon && <span className="text-xl">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
