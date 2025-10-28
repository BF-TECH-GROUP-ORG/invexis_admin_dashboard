import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import Image from "next/image";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="w-screen h-screen flex text-sm flex-col md:flex-row bg-white dark:bg-zinc-950">
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center bg-orange-100 relative">
        <Image
          src="/images/8.png"
          alt="Register Illustration"
          width={600}
          height={600}
          className="object-contain hidden md:block md:max-h-[40%] px-4"
          priority
        />
      </div>

      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
