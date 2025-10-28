"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = params; // token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setError("");
  //     setSuccess("");

  //     if (password !== confirmPassword) {
  //       setError("Passwords do not match.");
  //       return;
  //     }

  //     setSubmitting(true);
  //     try {
  //       // POST /password/reset/confirm
  //       const res = await fetch(`/api/auth/password/reset/confirm`, {
  //         method: "POST",
  //         body: JSON.stringify({ token, password }),
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       if (!res.ok) throw new Error("Failed to reset password");

  //       setSuccess("Password reset successfully!");
  //       setTimeout(() => router.push("/login"), 2000);
  //     } catch (err) {
  //       setError(err.message || "Reset failed");
  //     } finally {
  //       setSubmitting(false);
  //     }
  //   };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/reset-password.png"
          alt="Reset Password Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Reset Password 🔑"
          desc="Enter your new password below"
          submitLabel={submitting ? "Resetting..." : "Reset Password"}
          fields={[
            {
              label: "New Password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
            },
            {
              label: "Confirm New Password",
              type: "password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
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
          success={success}
        />
      </div>
    </div>
  );
}
