"use client";

import { useState } from "react";
import Image from "next/image";
import { HiChevronLeft, HiArrowRight, HiCog } from "react-icons/hi";
import FormWrapper from "../shared/FormWrapper";
import Link from "next/link";
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";

const RequestResetPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setSubmitting(true);
  //     setError("");
  //     setSuccess("");

  //     try {
  //       // POST /password/reset
  //       await fetch("/api/auth/password/reset", {
  //         method: "POST",
  //         body: JSON.stringify({ email }),
  //         headers: { "Content-Type": "application/json" },
  //       });
  //       setSuccess("Password reset link sent!");
  //     } catch (err) {
  //       setError(err.message || "Failed to send reset link");
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      setEmail(email);
      setSuccess("Request sent successfully! Please check your email.");
      router.push("/auth/reset-password/reset");
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white">
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-gray-50 relative">
        <Image
          src="/images/7.png"
          alt="Reset password in Invexis application"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[90%] px-4"
          priority
        />
      </div>

      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Reset Password"
          desc="Please enter the email address associated with your account and we'll email you a link to reset your password."
          submitLabel={submitting ? "Sending..." : "Send Link"}
          submitIcon={<HiArrowRight />}
          onSubmit={handleSubmit}
          fields={[
            {
              label: "Email",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              placeholder: "example@gmail.com",
            },
          ]}
          extraLinks={[
            {
              href: "/auth/login",
              icon: <HiChevronLeft />,
              label: "Return to Login",
            },
          ]}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
};

export default RequestResetPasswordPage;
