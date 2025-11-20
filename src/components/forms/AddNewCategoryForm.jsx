"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const AddNewCategoryForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    level: "1",
    parent: "",
    description: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Basic Info", fields: ["name", "slug"] },
    { id: 2, title: "Hierarchy", fields: ["level", "parent"] },
    { id: 3, title: "Details", fields: ["description", "active"] },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};

    stepFields.forEach((field) => {
      if (
        (field === "name" || field === "slug") &&
        (!formData[field] || formData[field].toString().trim() === "")
      ) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.slug && stepId === 1) {
      // basic slug format check
      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug =
          "Slug should be lowercase alphanumeric and hyphens only";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // validate all steps
    let ok = true;
    for (const s of steps) {
      const valid = validateStep(s.id);
      if (!valid) ok = false;
    }
    if (!ok) return;

    // TODO: call API
    alert("Category created successfully");
    router.push("/categories/list");
  };

  const handleCancel = () => {
    router.push("/categories");
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
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
                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="e.g., Electronics"
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
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        placeholder="e.g., electronics"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.slug
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                      {errors.slug && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Level
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) =>
                          handleInputChange("level", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.level
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      >
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                      </select>
                      {errors.level && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.level}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Parent Category (optional)
                      </label>
                      <input
                        value={formData.parent}
                        onChange={(e) =>
                          handleInputChange("parent", e.target.value)
                        }
                        placeholder="Parent category slug or name"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all ${"border-[#d1d5db] hover:border-[#ff782d]"} bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all ${"border-[#d1d5db] hover:border-[#ff782d]"} bg-white text-[#081422] placeholder-[#6b7280]`}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          handleInputChange("active", e.target.checked)
                        }
                      />
                      <label
                        htmlFor="active"
                        className="text-sm text-[#081422]"
                      >
                        Active
                      </label>
                    </div>
                  </>
                )}
              </div>

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

export default AddNewCategoryForm;
