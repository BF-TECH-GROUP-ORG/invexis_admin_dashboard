"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const AddNewCompanyForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    tier: "basic",
    industry: "",
    employees: "",
    registrationNumber: "",
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Basic Info", fields: ["name", "domain", "email"] },
    {
      id: 2,
      title: "Contact Details",
      fields: ["phone", "country", "city", "address"],
    },
    {
      id: 3,
      title: "Company Details",
      fields: ["industry", "employees", "registrationNumber"],
    },
    { id: 4, title: "Plan Selection", fields: ["tier"] },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};

    stepFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && stepId === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    // Phone validation
    if (formData.phone && stepId === 2) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      console.log("Form submitted:", formData);
      alert("Company added successfully!");
      // Redirect to clients list after successful submission
      router.push("/clients/list");
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
          {/* Left: Form Container */}
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="border-2 border-[#d1d5db] rounded-3xl p-8 md:p-12 bg-white">
              {/* Step Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#081422]">
                  {currentStepData.title}
                </h2>
                <p className="text-[#6b7280] mt-2">
                  Step {currentStep} of {steps.length}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="e.g., TechHub Rwanda Ltd"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.name
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Domain
                      </label>
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) =>
                          handleInputChange("domain", e.target.value)
                        }
                        placeholder="e.g., techhub-rw-1763386831.com"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.domain
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.domain && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.domain}
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
                        placeholder="e.g., info@company.com"
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
                  </>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 2 && (
                  <>
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
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        placeholder="e.g., Rwanda"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.country
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="e.g., Kigali"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.city
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="e.g., 123 Innovation Street, Kigali"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.address
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3: Company Details */}
                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) =>
                          handleInputChange("industry", e.target.value)
                        }
                        placeholder="e.g., Technology & Electronics"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.industry
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.industry && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.industry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Number of Employees
                      </label>
                      <input
                        type="number"
                        value={formData.employees}
                        onChange={(e) =>
                          handleInputChange("employees", e.target.value)
                        }
                        placeholder="e.g., 150"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.employees
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.employees && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.employees}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "registrationNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., REG-2025-001"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.registrationNumber
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.registrationNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.registrationNumber}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 4: Plan Selection */}
                {currentStep === 4 && (
                  <>
                    <label className="block text-sm font-semibold text-[#081422] mb-4">
                      Select a Plan
                    </label>
                    <div className="space-y-3">
                      {["basic", "pro", "mid"].map((tierOption) => (
                        <label
                          key={tierOption}
                          className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.tier === tierOption
                              ? "border-[#ff782d] bg-[#fff8f5]"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="tier"
                            value={tierOption}
                            checked={formData.tier === tierOption}
                            onChange={(e) =>
                              handleInputChange("tier", e.target.value)
                            }
                            className="w-4 h-4 accent-[#ff782d]"
                          />
                          <span className="ml-3 font-semibold text-[#081422] capitalize">
                            {tierOption} Plan
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.tier && (
                      <p className="text-red-500 text-sm mt-1">{errors.tier}</p>
                    )}
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                    currentStep === 1
                      ? "bg-[#f3f4f6] text-[#d1d5db] cursor-not-allowed"
                      : "border-2 border-[#d1d5db] text-[#081422] hover:border-[#ff782d] hover:text-[#ff782d]"
                  }`}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {currentStep === steps.length ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a] transition-all"
                  >
                    <Check size={20} />
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a] transition-all"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
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

export default AddNewCompanyForm;
