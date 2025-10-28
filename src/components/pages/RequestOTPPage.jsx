"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";

export default function RequestOTPPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setSubmitting(true);
  //     setError("");

  //     try {
  //       // Call your backend API POST /login/otp
  //       await fetch("/api/auth/otp/request", {
  //         method: "POST",
  //         body: JSON.stringify({ identifier }),
  //         headers: { "Content-Type": "application/json" },
  //       });
  //       router.push("/login/otp/verify");
  //     } catch (err) {
  //       setError(err.message || "Failed to send OTP");
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      setIdentifier(identifier);
      router.push("/auth/otp-login/verify");
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/otp.png"
          alt="OTP Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Request OTP 🔑"
          desc="Enter your email or phone to receive a one-time password"
          onSubmit={handleSubmit}
          submitLabel={submitting ? "Sending..." : "Send OTP"}
          fields={[
            {
              label: "Email or Phone",
              type: "text",
              value: identifier,
              onChange: (e) => setIdentifier(e.target.value),
              required: true,
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
        />
      </div>
    </div>
  );
}
