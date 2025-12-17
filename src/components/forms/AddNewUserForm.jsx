"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import UserService from "@/services/UserService";
// Removed company/shop assignment logic — keep simple user creation
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import { useSession } from "next-auth/react";

const AddNewUserForm = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const { data: session } = useSession();
  const currentUser = session?.user;
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Personal Details
    phone: "",
    gender: "male",
    dateOfBirth: "",
    nationalId: "",

    // Address
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",

    // Preferences
    language: "en",
    notificationsEmail: true,
    notificationsSms: true,
    notificationsInApp: true,

    // Role (Fixed as company_admin)
    role: "company_admin",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      fields: ["firstName", "lastName", "email", "password", "confirmPassword"],
    },
    {
      id: 2,
      title: "Personal Details",
      fields: ["phone", "gender", "dateOfBirth", "nationalId"],
    },
    {
      id: 3,
      title: "Address",
      fields: ["street", "city", "state", "postalCode", "country"],
    },
    {
      id: 4,
      title: "Emergency & Preferences",
      fields: [
        "emergencyName",
        "emergencyPhone",
        "language",
        "notificationsEmail",
        "notificationsSms",
        "notificationsInApp",
      ],
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validateStep = (stepId) => {
    const newErrors = {};

    // Step 1: Basic Info
    if (stepId === 1) {
      if (!formData.firstName?.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName?.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email?.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email";

      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Min 8 chars";

      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    // Step 2: Personal Details
    if (stepId === 2) {
      if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
      else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, "")))
        newErrors.phone = "Invalid E.164 phone";

      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of Birth is required";
      if (!formData.nationalId?.trim())
        newErrors.nationalId = "National ID is required";
    }

    // Step 3: Address
    if (stepId === 3) {
      if (!formData.street?.trim()) newErrors.street = "Street is required";
      if (!formData.city?.trim()) newErrors.city = "City is required";
      if (!formData.state?.trim()) newErrors.state = "State is required";
      if (!formData.postalCode?.trim())
        newErrors.postalCode = "Postal Code is required";
      if (!formData.country?.trim()) newErrors.country = "Country is required";
    }

    // Step 4: Emergency & Preferences
    if (stepId === 4) {
      if (!formData.emergencyName?.trim())
        newErrors.emergencyName = "Emergency contact name is required";
      if (!formData.emergencyPhone?.trim())
        newErrors.emergencyPhone = "Emergency contact phone is required";
      else if (
        !/^\+?[1-9]\d{1,14}$/.test(formData.emergencyPhone.replace(/\s/g, ""))
      )
        newErrors.emergencyPhone = "Invalid phone";
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      nationalId: formData.nationalId,
      role: "company_admin",
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
      },
      preferences: {
        language: formData.language,
        notifications: {
          email: formData.notificationsEmail,
          sms: formData.notificationsSms,
          inApp: formData.notificationsInApp,
        },
      },
    };

    try {
      showLoader();

      // Register user in Auth service
      const userResponse = await UserService.register(payload);
      const createdUser =
        userResponse.user || userResponse.data || userResponse;
      const userId = createdUser._id || createdUser.id;

      if (!userId) {
        throw new Error("User created but ID not returned from server");
      }

      showNotification({
        message: "Company Admin created successfully",
        severity: "success",
      });
      router.push("/users/list");
    } catch (err) {
      console.error("Register user failed", err);
      showNotification({
        message:
          err.response?.data?.message || "Failed to create company admin",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const currentStepData = steps[currentStep - 1];

  const renderInput = (
    label,
    field,
    type = "text",
    placeholder = "",
    required = false
  ) => (
    <div>
      <label className="block text-sm font-semibold text-[#081422] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
          errors[field]
            ? "border-red-500"
            : "border-[#d1d5db] hover:border-[#ff782d]"
        } bg-white text-[#081422] placeholder-[#6b7280]`}
      />
      {errors[field] && (
        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="border-2 border-[#d1d5db] rounded-3xl p-8 md:p-12 bg-white">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#081422]">
                  Register Company Admin
                </h2>
                <p className="text-[#6b7280] mt-2">
                  {currentStepData.title} - Step {currentStep} of {steps.length}
                </p>
              </div>

              <div className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput(
                      "First Name",
                      "firstName",
                      "text",
                      "e.g., Company",
                      true
                    )}
                    {renderInput(
                      "Last Name",
                      "lastName",
                      "text",
                      "e.g., Admin",
                      true
                    )}
                    {renderInput(
                      "Email Address",
                      "email",
                      "email",
                      "e.g., company.admin@company.com",
                      true
                    )}

                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Min 8 characters"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.password
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 p-1 text-[#6b7280]"
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
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        placeholder="Repeat password"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-9 p-1 text-[#6b7280]"
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
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput(
                      "Phone Number",
                      "phone",
                      "tel",
                      "e.g., +250789123459",
                      true
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {renderInput(
                      "Date of Birth",
                      "dateOfBirth",
                      "date",
                      "",
                      true
                    )}
                    {renderInput(
                      "National ID",
                      "nationalId",
                      "text",
                      "e.g., COMP12345",
                      true
                    )}
                  </div>
                )}

                {/* Step 3: Address */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput(
                      "Street",
                      "street",
                      "text",
                      "e.g., 456 Company Street",
                      true
                    )}
                    {renderInput("City", "city", "text", "e.g., Kigali", true)}
                    {renderInput(
                      "State",
                      "state",
                      "text",
                      "e.g., Kigali",
                      true
                    )}
                    {renderInput(
                      "Postal Code",
                      "postalCode",
                      "text",
                      "e.g., 00000",
                      true
                    )}
                    {renderInput(
                      "Country",
                      "country",
                      "text",
                      "e.g., Rwanda",
                      true
                    )}
                  </div>
                )}

                {/* Step 4: Emergency & Preferences */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 border-b pb-6 mb-6">
                      <h3 className="text-lg font-semibold text-[#081422] mb-4">
                        Emergency Contact
                      </h3>
                      {renderInput(
                        "Contact Name",
                        "emergencyName",
                        "text",
                        "e.g., Emergency Contact",
                        true
                      )}
                      {renderInput(
                        "Contact Phone",
                        "emergencyPhone",
                        "tel",
                        "e.g., +250789123460",
                        true
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-[#081422] mb-4">
                        Preferences
                      </h3>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Language
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) =>
                            handleInputChange("language", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="rw">Kinyarwanda</option>
                        </select>
                      </div>

                      <div className="border-2 border-[#d1d5db] rounded-2xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-[#081422]">
                          Notification Preferences
                        </p>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notificationsEmail}
                            onChange={(e) =>
                              handleInputChange(
                                "notificationsEmail",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 accent-[#ff782d]"
                          />
                          <span className="text-sm text-[#081422]">
                            Email Notifications
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notificationsSms}
                            onChange={(e) =>
                              handleInputChange(
                                "notificationsSms",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 accent-[#ff782d]"
                          />
                          <span className="text-sm text-[#081422]">
                            SMS Notifications
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notificationsInApp}
                            onChange={(e) =>
                              handleInputChange(
                                "notificationsInApp",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 accent-[#ff782d]"
                          />
                          <span className="text-sm text-[#081422]">
                            In-App Notifications
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-10 gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold border-2 border-[#d1d5db] text-[#081422] hover:border-[#ff782d]"
                  >
                    <ChevronLeft size={18} /> Cancel
                  </button>

                  <div className="flex gap-4">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold border-2 border-[#d1d5db] text-[#081422] hover:border-[#ff782d]"
                      >
                        <ChevronLeft size={18} /> Previous
                      </button>
                    )}

                    {currentStep === steps.length ? (
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a]"
                      >
                        <Check size={18} /> Create Admin
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a]"
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Right: Steps Sidebar */}
          <div className="hidden lg:block w-72">
            <div className="relative">
              <div
                className="absolute left-6 top-0 w-1 bg-gradient-to-b from-[#ff782d] to-[#d1d5db] transition-all duration-500"
                style={{ height: `${(currentStep / steps.length) * 100}%` }}
              ></div>

              <div className="space-y-6 relative z-10">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-start gap-4">
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
