"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

const AddNewUserForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "worker",
    position: "",
    nationalId: "",
    companies: "",
    shops: "",
    password: "",
    confirmPassword: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  const roles = ["super_admin", "company_admin", "shop_manager", "worker"];

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      fields: ["firstName", "lastName", "email", "password", "confirmPassword"],
    },
    {
      id: 2,
      title: "Contact & Role",
      fields: ["phone", "nationalId", "role", "position"],
    },
    { id: 3, title: "Assignments", fields: ["companies", "shops", "active"] },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};

    stepFields.forEach((field) => {
      const val = formData[field];
      if (field === "email") {
        if (!val) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
          newErrors.email = "Invalid email";
      } else if (field === "phone") {
        if (!val) newErrors.phone = "Phone is required";
        else {
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(String(val).replace(/\s/g, "")))
            newErrors.phone = "Invalid phone number";
        }
      } else if (field === "password") {
        if (!val) newErrors.password = "Password is required";
        else if (String(val).length < 8)
          newErrors.password = "Password must be at least 8 characters";
      } else if (field === "confirmPassword") {
        if (!val) newErrors.confirmPassword = "Confirm password is required";
        else if (val !== formData.password)
          newErrors.confirmPassword = "Passwords do not match";
      } else {
        if (val === undefined || val === null || String(val).trim() === "") {
          newErrors[field] = "This field is required";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    // Ensure all steps validated before final submit
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        return;
      }
    }

    // Replace with API call as needed
    // alert(`User saved:\n${JSON.stringify(formData, null, 2)}`);
    // Optional redirect:
    router.push("/users/list");
  };

  const handleCancel = () => {
    // go back or clear
    router.back();
  };
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
          {/* Left: Form Container */}
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="border-2 border-[#d1d5db] rounded-3xl p-8 md:p-12 bg-white">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#081422]">
                  {currentStepData.title}
                </h2>
                <p className="text-[#6b7280] mt-2">
                  Step {currentStep} of {steps.length}
                </p>
              </div>

              <div className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="e.g., John"
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422] placeholder-[#6b7280]`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="e.g., Doe"
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422] placeholder-[#6b7280]`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="e.g., user@company.com"
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                            errors.email
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422] placeholder-[#6b7280]`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder="Choose a strong password"
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                            errors.password
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422]`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-9 p-1 text-[#6b7280]"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Confirm Password
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          placeholder="Repeat the password"
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422]`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          className="absolute right-3 top-9 p-1 text-[#6b7280]"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Contact & Role */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="e.g., +250788123456"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.phone
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        National ID
                      </label>
                      <input
                        type="text"
                        value={formData.nationalId}
                        onChange={(e) =>
                          handleInputChange("nationalId", e.target.value)
                        }
                        placeholder="e.g., WORK12345"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.nationalId
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      />
                      {errors.nationalId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nationalId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r} className="capitalize">
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Position
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) =>
                          handleInputChange("position", e.target.value)
                        }
                        placeholder="e.g., Sales Representative"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.position
                            ? "border-red-500"
                            : "border-[#d1d5db]"
                        } bg-white text-[#081422]`}
                      />
                      {errors.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.position}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Assignments */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Companies
                      </label>
                      <input
                        type="text"
                        value={formData.companies}
                        onChange={(e) =>
                          handleInputChange("companies", e.target.value)
                        }
                        placeholder="company-uuid-123, another-uuid"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.companies
                            ? "border-red-500"
                            : "border-[#d1d5db]"
                        } bg-white text-[#081422]`}
                      />
                      <p className="text-xs text-[#6b7280] mt-1">
                        Comma-separated company ids (for mock/demo)
                      </p>
                      {errors.companies && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companies}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Shops
                      </label>
                      <input
                        type="text"
                        value={formData.shops}
                        onChange={(e) =>
                          handleInputChange("shops", e.target.value)
                        }
                        placeholder="shop-uuid-456"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.shops ? "border-red-500" : "border-[#d1d5db]"
                        } bg-white text-[#081422]`}
                      />
                      <p className="text-xs text-[#6b7280] mt-1">
                        Comma-separated shop ids (for mock/demo)
                      </p>
                      {errors.shops && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.shops}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          handleInputChange("active", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#ff782d]"
                      />
                      <label
                        htmlFor="active"
                        className="text-sm font-medium text-[#081422]"
                      >
                        Active
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-10 gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold border-2 border-[#d1d5db] text-[#081422] hover:border-[#ff782d]"
                  >
                    <ChevronLeft size={18} /> Cancel
                  </button>

                  {currentStep === steps.length ? (
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a]"
                    >
                      <Check size={18} /> Save User
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a]"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Right: Steps Sidebar */}
          <div className="hidden lg:block w-72">
            <div className="relative">
              {/* Vertical connecting line */}
              <div
                className="absolute left-6 top-0 w-1 bg-gradient-to-b from-[#ff782d] to-[#d1d5db] transition-all duration-500"
                style={{
                  height: `${(currentStep / steps.length) * 100}%`,
                }}
              ></div>

              {/* Steps */}
              <div className="space-y-6 relative z-10">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Circle indicator */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                        step.id < currentStep
                          ? "bg-[#ff782d] text-white"
                          : step.id === currentStep
                          ? "bg-[#ff782d] text-white border-4 border-[#fff8f5] ring-2 ring-[#ff782d]"
                          : "border-2 border-[#d1d5db] text-[#6b7280] bg-white"
                      }`}
                    >
                      {step.id < currentStep ? <Check size={24} /> : step.id}
                    </div>

                    {/* Step title */}
                    <div className="pt-2">
                      <p
                        className={`font-semibold text-sm transition-colors ${
                          step.id <= currentStep
                            ? "text-[#081422]"
                            : "text-[#6b7280]"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        Step {step.id} of {steps.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewUserForm;
