"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setSubmitting(true);
  //     setError("");

  //     try {
  //       // POST /login/otp/verify
  //       await fetch("/api/auth/otp/verify", {
  //         method: "POST",
  //         body: JSON.stringify({ otp }),
  //         headers: { "Content-Type": "application/json" },
  //       });
  //       router.push("/inventory");
  //     } catch (err) {
  //       setError(err.message || "OTP verification failed");
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/verify.png"
          alt="Verify OTP Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Verify OTP 🔐"
          desc="Enter the OTP sent to your email or phone"
          submitLabel={submitting ? "Verifying..." : "Verify OTP"}
          fields={[
            {
              label: "One-Time Password",
              type: "text",
              value: otp,
              onChange: (e) => setOtp(e.target.value),
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
