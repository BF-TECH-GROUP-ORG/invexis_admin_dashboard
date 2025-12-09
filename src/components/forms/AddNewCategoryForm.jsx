"use client";
import React, { useState, useEffect } from "react";
import { useNotification } from "../../providers/NotificationProvider";
import CategoryService from "../../services/CategoryService";
import CompanyService from "../../services/CompanyService";
import { useLoading } from "../../providers/LoadingProvider";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const AddNewCategoryForm = ({ initialData = null, onSuccess = null }) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const { showNotification } = useNotification();
  const loadingHelpers = useLoading();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    level: "1",
    parent: "",
    companyId: "",
    description: "",
    active: true,
  });

  // parent (level 1) options
  const [parentOptions, setParentOptions] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);

  // populate when editing
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || "",
        slug: initialData.slug || "",
        level: initialData.level ? String(initialData.level) : "1",
        parent:
          (initialData.parentCategory &&
            (initialData.parentCategory.id ||
              initialData.parentCategory._id)) ||
          initialData.parent ||
          "",
        companyId:
          initialData.companyId ||
          initialData.company?.id ||
          initialData.company?._id ||
          "",
        description: initialData.description || "",
        active:
          initialData.isActive !== undefined ? !!initialData.isActive : true,
      }));
    }
  }, [initialData]);

  // fetch level-1 and level-2 categories for parent select
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        loadingHelpers.showLoader();
        const data = await CategoryService.getAll({ page: 1, limit: 500 });
        const cats = data?.data || data || [];
        if (!mounted) return;
        // keep only level 1 and 2 categories and sort by level then name
        const filtered = (cats || []).filter(
          (c) => c.level === 1 || c.level === 2
        );
        filtered.sort(
          (a, b) =>
            a.level - b.level || (a.name || "").localeCompare(b.name || "")
        );
        setParentOptions(filtered);
      } catch (err) {
        // ignore silently; parent select will remain empty
      } finally {
        try {
          loadingHelpers.hideLoader();
        } catch (e) {}
      }
    })();
    return () => (mounted = false);
  }, []);

  // fetch companies for level-3 association (best-effort)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        loadingHelpers.showLoader();
        const data = await CompanyService.getAll({ page: 1, limit: 200 });
        const comps = data?.data || data || [];
        if (!mounted) return;
        setCompaniesList(comps || []);
      } catch (err) {
        // ignore
      } finally {
        try {
          loadingHelpers.hideLoader();
        } catch (e) {}
      }
    })();
    return () => (mounted = false);
  }, []);

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Basic Info", fields: ["name", "slug"] },
    { id: 2, title: "Hierarchy", fields: ["level", "parent", "companyId"] },
    { id: 3, title: "Details", fields: ["description", "active"] },
  ];

  // when level changes, clear parent/companyId if they become invalid
  useEffect(() => {
    const lvl = Number(formData.level);
    if (lvl === 1) {
      if (formData.parent) setFormData((p) => ({ ...p, parent: "" }));
      if (formData.companyId) setFormData((p) => ({ ...p, companyId: "" }));
    }
    if (lvl === 2) {
      if (formData.companyId) setFormData((p) => ({ ...p, companyId: "" }));
    }
  }, [formData.level]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};

    stepFields.forEach((field) => {
      // Required fields according to model: name, level
      if (field === "name") {
        if (!formData.name || formData.name.toString().trim() === "") {
          newErrors.name = "Category name is required";
        } else if (formData.name.length < 2) {
          newErrors.name = "Category name must be at least 2 characters";
        } else if (formData.name.length > 100) {
          newErrors.name = "Category name cannot exceed 100 characters";
        }
      }

      if (field === "level") {
        const val = formData.level;
        if (val === undefined || val === null || String(val).trim() === "") {
          newErrors.level = "Level is required";
        } else if (!["1", "2", "3", 1, 2, 3].includes(val)) {
          newErrors.level = "Level must be 1, 2 or 3";
        }
      }

      // parent is required for levels > 1
      if (field === "parent") {
        if (Number(formData.level) > 1) {
          if (!formData.parent || String(formData.parent).trim() === "") {
            newErrors.parent = "Parent category is required for level 2 and 3";
          }
        }
      }

      // companyId required for level 3
      if (field === "companyId") {
        if (Number(formData.level) === 3) {
          if (!formData.companyId || String(formData.companyId).trim() === "") {
            newErrors.companyId = "Company is required for level 3 categories";
          }
        }
      }

      // slug is optional, but if provided validate format
      if (field === "slug" && formData.slug) {
        if (!/^[a-z0-9-]+$/.test(formData.slug)) {
          newErrors.slug =
            "Slug should be lowercase alphanumeric and hyphens only";
        }
      }

      // description is optional but must not exceed 500 chars
      if (field === "description" && formData.description) {
        if (formData.description.length > 500) {
          newErrors.description = "Description cannot exceed 500 characters";
        }
      }
    });

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
    (async () => {
      try {
        const { showLoader, hideLoader } = loadingHelpers;
        showLoader();
        const payload = {
          name: formData.name,
          slug: formData.slug || undefined,
          level: Number(formData.level),
          parentCategory: formData.parent || null,
          companyId: formData.companyId || null,
          description: formData.description || undefined,
          isActive: !!formData.active,
        };
        let res;
        if (initialData && initialData.id) {
          res = await CategoryService.update(initialData.id, payload);
        } else {
          res = await CategoryService.create(payload);
        }

        if (res?.success || res?.data?.success || res?.id || res?._id) {
          showNotification({
            message: "Category created successfully",
            severity: "success",
          });
          try {
            localStorage.removeItem(
              "categories_cache_v1::" + JSON.stringify({ page: 1, limit: 200 })
            );
          } catch (e) {}

          if (onSuccess) onSuccess(res.data || res);
          router.push("/categories/list");
        } else {
          showNotification({
            message: "Failed to create category",
            severity: "error",
          });
        }
      } catch (err) {
        console.error("Create category failed", err);
        showNotification({
          message: err?.response?.data?.message || "Failed to create category",
          severity: "error",
        });
      } finally {
        try {
          loadingHelpers.hideLoader();
        } catch (e) {}
      }
    })();
  };

  const handleCancel = () => {
    router.push("/categories");
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                e.target &&
                e.target.tagName !== "TEXTAREA"
              )
                e.preventDefault();
            }}
            className="flex-1"
          >
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
                        Parent Category{" "}
                        {Number(formData.level) > 1
                          ? "(required)"
                          : "(optional)"}
                      </label>
                      <select
                        value={formData.parent}
                        onChange={(e) =>
                          handleInputChange("parent", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                          errors.parent
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      >
                        <option value="">No parent (root)</option>
                        {parentOptions
                          .filter(
                            (p) =>
                              Number(p.level) === Number(formData.level) - 1
                          )
                          .map((p) => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name}{" "}
                              {p.level === 1
                                ? "(L1)"
                                : p.level === 2
                                ? "(L2)"
                                : ""}
                            </option>
                          ))}
                      </select>
                      {errors.parent && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.parent}
                        </p>
                      )}
                    </div>

                    {Number(formData.level) === 3 && (
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Company (required for Level 3)
                        </label>
                        <select
                          value={formData.companyId}
                          onChange={(e) =>
                            handleInputChange("companyId", e.target.value)
                          }
                          className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                            errors.companyId
                              ? "border-red-500"
                              : "border-[#d1d5db] hover:border-[#ff782d]"
                          } bg-white text-[#081422]`}
                        >
                          <option value="">Select company</option>
                          {companiesList.map((c) => (
                            <option key={c.id || c._id} value={c.id || c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {errors.companyId && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.companyId}
                          </p>
                        )}
                      </div>
                    )}
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
