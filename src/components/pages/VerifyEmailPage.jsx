"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import FormWrapper from "@/components/shared/FormWrapper";
import { HiChevronLeft } from "react-icons/hi";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // token from query string

  const [submitting, setSubmitting] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //   useEffect(() => {
  //     const verifyEmail = async () => {
  //       setSubmitting(true);
  //       setError("");
  //       try {
  //         // POST /me/verify/resend/:type
  //         const res = await fetch(`/api/auth/verify-email`, {
  //           method: "POST",
  //           body: JSON.stringify({ token }),
  //           headers: { "Content-Type": "application/json" },
  //         });

  //         if (!res.ok) throw new Error("Email verification failed");
  //         setSuccess("Email verified successfully!");
  //         setTimeout(() => router.push("/login"), 2000);
  //       } catch (err) {
  //         setError(err.message || "Verification failed");
  //       } finally {
  //         setSubmitting(false);
  //       }
  //     };

  //     if (token) verifyEmail();
  //     else setError("Invalid verification token.");
  //   }, [token, router]);

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-100">
        <Image
          src="/images/verify-email.png"
          alt="Verify Email Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[30%]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <FormWrapper
          title="Verify Email 📧"
          desc="We are verifying your email address..."
          onSubmit={(e) => e.preventDefault()}
          submitLabel="Verifying..."
          fields={[]}
          extraLinks={[
            {
              href: "/auth/login",
              icon: <HiChevronLeft />,
              label: "Return to Login",
            },
          ]}
          error={error}
          success={success}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
