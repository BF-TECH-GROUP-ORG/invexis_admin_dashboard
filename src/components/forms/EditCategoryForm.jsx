"use client";

import React, { useState, useEffect } from "react";
import { useNotification } from "../../providers/NotificationProvider";
import CategoryService from "../../services/CategoryService";
import CompanyService from "../../services/CompanyService";
import { useLoading } from "../../providers/LoadingProvider";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Image as ImageIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const EditCategoryForm = ({ initialData }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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
    image: "", // URL or file path
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    sortOrder: 0,
  });
  const [imageFile, setImageFile] = useState(null);

  const [parentOptions, setParentOptions] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        level: initialData.level ? String(initialData.level) : "1",
        parent:
          initialData.parentCategory?.id ||
          initialData.parentCategory?._id ||
          initialData.parentCategory ||
          "",
        companyId: initialData.companyId || "",
        description: initialData.description || "",
        active:
          initialData.isActive !== undefined ? initialData.isActive : true,
        image: initialData.image?.url || "",
        metaTitle: initialData.seo?.metaTitle || "",
        metaDescription: initialData.seo?.metaDescription || "",
        keywords: initialData.seo?.keywords?.join(", ") || "",
        sortOrder: initialData.sortOrder || 0,
      });
    }
  }, [initialData]);

  // Fetch parent categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await CategoryService.getAll({ page: 1, limit: 500 });
        const cats = data?.data || data || [];
        if (mounted) {
          // Filter out self and children to prevent cycles (simple check)
          const filtered = cats.filter(
            (c) => c.id !== initialData?.id && (c.level === 1 || c.level === 2)
          );
          filtered.sort(
            (a, b) => a.level - b.level || a.name.localeCompare(b.name)
          );
          setParentOptions(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => (mounted = false);
  }, [initialData]);

  // Fetch companies
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await CompanyService.getAll({ page: 1, limit: 200 });
        const comps = data?.data || data || [];
        if (mounted) setCompaniesList(comps);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => (mounted = false);
  }, []);

  const steps = [
    { id: 1, title: "Basic Info", fields: ["name", "slug", "description"] },
    {
      id: 2,
      title: "Hierarchy & Image",
      fields: ["level", "parent", "companyId", "image"],
    },
    {
      id: 3,
      title: "SEO & Settings",
      fields: [
        "metaTitle",
        "metaDescription",
        "keywords",
        "sortOrder",
        "active",
      ],
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};

    stepFields.forEach((field) => {
      if (field === "name") {
        if (!formData.name?.trim()) newErrors.name = "Name is required";
        else if (formData.name.length < 2)
          newErrors.name = "Name must be at least 2 chars";
      }
      if (field === "level") {
        if (!formData.level) newErrors.level = "Level is required";
      }
      if (field === "parent" && Number(formData.level) > 1) {
        if (!formData.parent)
          newErrors.parent = "Parent is required for subcategories";
      }
      if (field === "companyId" && Number(formData.level) === 3) {
        if (!formData.companyId)
          newErrors.companyId = "Company is required for Level 3";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep))
      setCurrentStep((p) => Math.min(p + 1, steps.length));
  };

  const handlePrev = () => {
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      loadingHelpers.showLoader();
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        level: Number(formData.level),
        parentCategory: formData.parent || null,
        companyId: formData.companyId || null,
        description: formData.description || undefined,
        isActive: formData.active,
        sortOrder: Number(formData.sortOrder),
        image: formData.image
          ? { url: formData.image, alt: formData.name }
          : undefined,
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        },
      };

      await CategoryService.update(initialData.id, payload);

      // Clear cache
      try {
        localStorage.removeItem("categories_cache_v1");
      } catch (e) {}

      queryClient.invalidateQueries({ queryKey: ["categories_list"] });

      showNotification({
        message: "Category updated successfully",
        severity: "success",
      });
      router.push("/categories/list");
    } catch (err) {
      console.error(err);
      showNotification({
        message: err?.response?.data?.message || "Failed to update category",
        severity: "error",
      });
    } finally {
      loadingHelpers.hideLoader();
    }
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
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
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
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                      />
                    </div>
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
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                      />
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Level
                        </label>
                        <select
                          value={formData.level}
                          onChange={(e) =>
                            handleInputChange("level", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                        >
                          <option value="1">Level 1</option>
                          <option value="2">Level 2</option>
                          <option value="3">Level 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Parent Category
                        </label>
                        <select
                          value={formData.parent}
                          onChange={(e) =>
                            handleInputChange("parent", e.target.value)
                          }
                          disabled={formData.level === "1"}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d] disabled:bg-gray-100"
                        >
                          <option value="">None</option>
                          {parentOptions.map((p) => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} (L{p.level})
                            </option>
                          ))}
                        </select>
                        {errors.parent && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.parent}
                          </p>
                        )}
                      </div>
                    </div>

                    {formData.level === "3" && (
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Company
                        </label>
                        <select
                          value={formData.companyId}
                          onChange={(e) =>
                            handleInputChange("companyId", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                        >
                          <option value="">Select Company</option>
                          {companiesList.map((c) => (
                            <option key={c.id} value={c.id}>
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

                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Image URL or Upload
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setImageFile(null);
                            handleInputChange("image", e.target.value);
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                        />

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setImageFile(f);
                              const preview = URL.createObjectURL(f);
                              handleInputChange("image", preview);
                            }
                          }}
                          className="border rounded px-2 py-2 text-sm"
                        />

                        {formData.image && (
                          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Paste an image URL or upload a file (preview shown). If
                        you upload a file the preview is used in the payload.
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) =>
                          handleInputChange("metaTitle", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) =>
                          handleInputChange("metaDescription", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) =>
                          handleInputChange("keywords", e.target.value)
                        }
                        placeholder="electronics, gadgets, tech"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) =>
                            handleInputChange("sortOrder", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] outline-none focus:border-[#ff782d]"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.active}
                          onChange={(e) =>
                            handleInputChange("active", e.target.checked)
                          }
                          className="w-5 h-5 accent-[#ff782d]"
                        />
                        <label
                          htmlFor="active"
                          className="font-semibold text-[#081422]"
                        >
                          Active
                        </label>
                      </div>
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
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-2 border-[#d1d5db] hover:border-[#ff782d]"
                  }`}
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                {currentStep === steps.length ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a] transition-all"
                  >
                    <Check size={20} /> Save Changes
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-[#ff782d] text-white hover:bg-[#ff6b1a] transition-all"
                  >
                    Next <ChevronRight size={20} />
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step.id <= currentStep
                          ? "bg-[#ff782d] text-white"
                          : "bg-white border-2 border-[#d1d5db]"
                      }`}
                    >
                      {step.id < currentStep ? <Check size={24} /> : step.id}
                    </div>
                    <div className="pt-2">
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500">Step {step.id}</p>
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

export default EditCategoryForm;
