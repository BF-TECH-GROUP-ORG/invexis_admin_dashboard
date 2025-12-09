"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Search, X } from "lucide-react";
import { useNotification } from "../../providers/NotificationProvider";
import CompanyService from "../../services/CompanyService";
import CategoryService from "../../services/CategoryService";
import UserService from "../../services/UserService";
import { COUNTRIES } from "../../constants/countries";

const AddNewCompanyForm = ({ initialData = null, onSuccess = null }) => {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    tier: "",
    company_admin_id: "",
    category_ids: [],
    industry: "",
    size: "",
    notificationsEmail: true,
    notificationsSms: true,
    notificationsInApp: true,
  });

  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  // Categories state
  const [categoriesList, setCategoriesList] = useState([]);
  // Company admin user selection
  const [companyAdminOptions, setCompanyAdminOptions] = useState([]);
  const [categoryStats, setCategoryStats] = useState({ level1: 0, level3: 0 });

  // Company Admins state
  const [companyAdmins, setCompanyAdmins] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // Country search state
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    if (!adminSearch) return companyAdmins;
    return companyAdmins.filter((admin) => {
      const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
      return (
        fullName.includes(adminSearch.toLowerCase()) ||
        admin.email.toLowerCase().includes(adminSearch.toLowerCase())
      );
    });
  }, [adminSearch, companyAdmins]);

  const selectedCountry = COUNTRIES.find((c) => c.name === formData.country);
  const selectedAdmin = companyAdmins.find(
    (admin) => admin._id === formData.company_admin_id
  );

  // If editing, populate form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        admin_user_ids: initialData?.admin_user_ids || [],
        name: initialData.name || "",
        domain: initialData.domain || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        country: initialData.country || "",
        city: initialData.city || "",
        tier: initialData.tier ?? "",
        company_admin_id: initialData.company_admin_id || "",
        category_ids: initialData.category_ids || [],
        industry: initialData.metadata?.industry || "",
        size: initialData.metadata?.size || "",
        notificationsEmail: initialData.notification_preferences?.email ?? true,
        notificationsSms: initialData.notification_preferences?.sms ?? true,
        notificationsInApp: initialData.notification_preferences?.inApp ?? true,
      }));
    }
  }, [initialData]);

  // Fetch company admins
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await UserService.getCompanyAdmins();
        if (mounted) {
          const admins = res?.admins || res?.data || [];
          setCompanyAdmins(admins);
        }
      } catch (e) {
        console.error("Failed to fetch company admins", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Fetch categories (Level 2 only for selection)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch all categories to process relationships
        const data = await CategoryService.getAll({ page: 1, limit: 1000 });
        const allCategories = data?.data || data || [];

        if (mounted) {
          // Filter for Level 2 categories for the selection list
          const level2 = allCategories.filter((c) => c.level === 2);
          setCategoriesList(level2);

          // Store all categories to calculate stats later
          window.allCategoriesCache = allCategories;
        }
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Fetch available company_admin users for assignment while creating a company
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await UserService.getCompanyAdmins();
        const usersPayload = res?.users ?? res?.data ?? res ?? [];
        if (mounted) setCompanyAdminOptions(usersPayload);
      } catch (e) {
        console.error("Failed to fetch company admin users", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Calculate stats when category selection changes
  useEffect(() => {
    if (!window.allCategoriesCache) return;

    const allCats = window.allCategoriesCache;
    const selectedIds = formData.category_ids;

    // Find selected Level 2 categories
    const selectedL2 = allCats.filter((c) =>
      selectedIds.includes(c.id || c._id)
    );

    // Find related Level 1 (parents of selected L2)
    const relatedL1Ids = new Set(
      selectedL2
        .map(
          (c) =>
            c.parentCategory?.id || c.parentCategory?._id || c.parentCategory
        )
        .filter(Boolean)
    );

    // Find related Level 3 (children of selected L2)
    const relatedL3 = allCats.filter((c) => {
      const parentId =
        c.parentCategory?.id || c.parentCategory?._id || c.parentCategory;
      return c.level === 3 && selectedIds.includes(parentId);
    });

    setCategoryStats({
      level1: relatedL1Ids.size,
      level3: relatedL3.length,
    });
  }, [formData.category_ids]);

  const steps = [
    { id: 1, title: "Basic Info", fields: ["name", "domain", "email"] },
    { id: 2, title: "Contact Details", fields: ["phone", "country", "city"] },
    { id: 3, title: "Company Admin", fields: ["company_admin_id"] },
    { id: 4, title: "Categories", fields: ["category_ids"] },
    { id: 5, title: "Plan & Details", fields: ["tier", "industry", "size"] },
    {
      id: 6,
      title: "Notifications",
      fields: ["notificationsEmail", "notificationsSms", "notificationsInApp"],
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepId) => {
    const stepFields = steps[stepId - 1].fields;
    const newErrors = {};
    const requiredFields = { name: true };

    stepFields.forEach((field) => {
      if (
        requiredFields[field] &&
        (!formData[field] || formData[field].toString().trim() === "")
      ) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.email && stepId === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

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

  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && e.target && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only validate on the last step
    if (currentStep !== steps.length) {
      return;
    }

    const payload = {
      name: formData.name,
      domain: formData.domain || null,
      email: formData.email || null,
      phone: formData.phone || null,
      country: formData.country || null,
      city: formData.city || null,
      tier: formData.tier || null,
      company_admin_id: formData.company_admin_id || null,
      category_ids: formData.category_ids || [],
      metadata: {
        industry: formData.industry || null,
        size: formData.size || null,
      },
      notification_preferences: {
        email: formData.notificationsEmail,
        sms: formData.notificationsSms,
        inApp: formData.notificationsInApp,
      },
    };

    try {
      let res;
      let createdCompanyId = null;
      if (initialData && initialData.id) {
        res = await CompanyService.update(initialData.id, payload);
        createdCompanyId = initialData.id;
      } else {
        res = await CompanyService.create(payload);
        // normalize created company id
        const created = res?.data || res;
        createdCompanyId =
          created?.id ??
          created?._id ??
          created?.companyId ??
          created?.data?.id ??
          null;
      }

      if (res?.success || res?.id || res?.data?.success) {
        try {
          localStorage.removeItem("companies_cache_v1");
        } catch (e) {}

        showNotification({
          message: initialData ? "Company updated" : "Company added",
          severity: "success",
        });

        // If the form included admin_user_ids, try assign those users to the created company
        const admins = formData.admin_user_ids || [];
        if (admins.length > 0 && createdCompanyId) {
          // ensure a company-level role exists for company_admin
          let roleObj = null;
          try {
            const findResp = await RoleService.getRoleByName(
              createdCompanyId,
              "company_admin"
            );
            roleObj = findResp?.data ?? findResp;
          } catch (err) {
            // ignore - will attempt to create
          }

          if (!roleObj || (!roleObj._id && !roleObj.id)) {
            try {
              const createResp = await RoleService.create({
                name: "company_admin",
                company_id: createdCompanyId,
                description: "Default company admin role",
                permissions: [],
              });
              roleObj = createResp?.data ?? createResp;
            } catch (err) {
              console.warn("Failed to ensure company_admin role exists", err);
            }
          }

          const roleId = roleObj?.id ?? roleObj?._id ?? null;

          const assignPromises = admins.map(async (uid) => {
            try {
              await CompanyUserService.assignUserToCompany({
                company_id: createdCompanyId,
                user_id: uid,
                role_id: roleId,
                status: "active",
              });
            } catch (err) {
              console.error("Failed to assign admin to company", uid, err);
            }
          });

          try {
            await Promise.all(assignPromises);
          } catch (e) {}
        }

        if (onSuccess) onSuccess(res.data || res);
        router.push("/clients/list");
      } else {
        showNotification({
          message: "Failed to save company",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Save company failed", err);
      showNotification({
        message: err?.response?.data?.message || "Failed to save company",
        severity: "error",
      });
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-20">
          {/* Left: Form Container */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleFormKeyDown}
            className="flex-1"
          >
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

                    {/* Assign existing Company Admins (multi-select) */}
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Assign Company Admins
                      </label>
                      <div className="w-full p-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]">
                        {companyAdminOptions.length === 0 ? (
                          <p className="text-sm text-[#6b7280]">
                            No company admins available
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                            {companyAdminOptions.map((u) => {
                              const uid = u._id || u.id || u.userId || u.id;
                              const isSelected = (
                                formData.admin_user_ids || []
                              ).includes(uid);
                              return (
                                <label
                                  key={uid}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                                    isSelected
                                      ? "bg-[#fff8f5] border border-[#ffddb8]"
                                      : "hover:bg-[#f3f4f6]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      const current =
                                        formData.admin_user_ids || [];
                                      if (current.includes(uid)) {
                                        handleInputChange(
                                          "admin_user_ids",
                                          current.filter((x) => x !== uid)
                                        );
                                      } else {
                                        handleInputChange("admin_user_ids", [
                                          ...current,
                                          uid,
                                        ]);
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {u.firstName
                                        ? `${u.firstName} ${u.lastName || ""}`
                                        : u.email || uid}
                                    </span>
                                    <span className="text-xs text-[#6b7280]">
                                      {u.email || u.phone || uid}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {errors.admin_user_ids && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.admin_user_ids}
                          </p>
                        )}
                      </div>
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

                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Country
                      </label>
                      <div
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all cursor-pointer flex items-center justify-between ${
                          errors.country
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                        onClick={() =>
                          setIsCountryDropdownOpen(!isCountryDropdownOpen)
                        }
                      >
                        <span
                          className={!formData.country ? "text-[#6b7280]" : ""}
                        >
                          {selectedCountry
                            ? `${selectedCountry.flag} ${selectedCountry.name}`
                            : formData.country || "Select a country"}
                        </span>
                        <ChevronRight
                          className={`transform transition-transform ${
                            isCountryDropdownOpen ? "rotate-90" : ""
                          }`}
                          size={20}
                        />
                      </div>
                      {/* Dropdown contents */}
                      {isCountryDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-full bg-white border-2 border-[#d1d5db] rounded-2xl shadow-lg z-50">
                          <div className="p-3">
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              autoFocus
                              className="w-full px-3 py-2 rounded-xl border-2 outline-none focus:border-[#ff782d] bg-white text-[#081422] placeholder-[#6b7280]"
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56 p-2">
                            {filteredCountries.map((c) => (
                              <div
                                key={c.code}
                                onClick={() => {
                                  handleInputChange("country", c.name);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                  formData.country === c.name
                                    ? "bg-[#fff8f5] text-[#ff782d]"
                                    : "hover:bg-[#f3f4f6] text-[#081422]"
                                }`}
                              >
                                <span className="text-2xl">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                              </div>
                            ))}
                            {filteredCountries.length === 0 && (
                              <div className="p-4 text-center text-[#6b7280]">
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                  </>
                )}

                {/* Step 3: Company Admin */}
                {currentStep === 3 && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Select Company Admin
                      </label>
                      <div
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all cursor-pointer flex items-center justify-between ${
                          errors.company_admin_id
                            ? "border-red-500"
                            : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                        onClick={() =>
                          setIsAdminDropdownOpen(!isAdminDropdownOpen)
                        }
                      >
                        <span
                          className={
                            !formData.company_admin_id ? "text-[#6b7280]" : ""
                          }
                        >
                          {selectedAdmin
                            ? `${selectedAdmin.firstName} ${selectedAdmin.lastName} (${selectedAdmin.email})`
                            : "Select a company admin"}
                        </span>
                        <ChevronRight
                          className={`transform transition-transform ${
                            isAdminDropdownOpen ? "rotate-90" : ""
                          }`}
                          size={20}
                        />
                      </div>
                      {/* Dropdown contents */}
                      {isAdminDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-full bg-white border-2 border-[#d1d5db] rounded-2xl shadow-lg z-50">
                          <div className="p-3">
                            <input
                              type="text"
                              value={adminSearch}
                              onChange={(e) => setAdminSearch(e.target.value)}
                              placeholder="Search admin by name or email..."
                              autoFocus
                              className="w-full px-3 py-2 rounded-xl border-2 outline-none focus:border-[#ff782d] bg-white text-[#081422] placeholder-[#6b7280]"
                            />
                          </div>
                          <div className="overflow-y-auto max-h-56 p-2">
                            {filteredAdmins.length > 0 ? (
                              filteredAdmins.map((admin) => (
                                <div
                                  key={admin._id}
                                  onClick={() => {
                                    handleInputChange(
                                      "company_admin_id",
                                      admin._id
                                    );
                                    setIsAdminDropdownOpen(false);
                                    setAdminSearch("");
                                  }}
                                  className={`flex flex-col p-3 rounded-xl cursor-pointer transition-colors ${
                                    formData.company_admin_id === admin._id
                                      ? "bg-[#fff8f5] text-[#ff782d]"
                                      : "hover:bg-[#f3f4f6] text-[#081422]"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {admin.firstName} {admin.lastName}
                                  </span>
                                  <span className="text-sm text-[#6b7280]">
                                    {admin.email}
                                  </span>
                                  <span className="text-xs text-[#9ca3af]">
                                    {admin.phone}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-[#6b7280]">
                                No admins found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {errors.company_admin_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.company_admin_id}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 4: Categories */}
                {currentStep === 4 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Select Categories (Level 2)
                      </label>
                      <p className="text-xs text-[#6b7280] mb-3">
                        Selecting a Level 2 category will automatically link
                        related Level 1 and Level 3 categories.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                        {categoriesList.length === 0 && (
                          <div className="col-span-2 text-center p-4 text-[#6b7280] border-2 border-dashed border-[#d1d5db] rounded-xl">
                            No Level 2 categories available
                          </div>
                        )}
                        {categoriesList.map((cat) => {
                          const isSelected = formData.category_ids.includes(
                            cat.id || cat._id
                          );
                          return (
                            <div
                              key={cat.id || cat._id}
                              onClick={() => {
                                const id = cat.id || cat._id;
                                const currentIds = [...formData.category_ids];
                                if (isSelected) {
                                  handleInputChange(
                                    "category_ids",
                                    currentIds.filter((i) => i !== id)
                                  );
                                } else {
                                  handleInputChange("category_ids", [
                                    ...currentIds,
                                    id,
                                  ]);
                                }
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "border-[#ff782d] bg-[#fff8f5]"
                                  : "border-[#d1d5db] hover:border-[#ff782d]"
                              }`}
                            >
                              <span
                                className={`font-medium ${
                                  isSelected
                                    ? "text-[#ff782d]"
                                    : "text-[#081422]"
                                }`}
                              >
                                {cat.name}
                              </span>
                              {isSelected && (
                                <Check size={18} className="text-[#ff782d]" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Stats Summary */}
                      <div className="mt-6 bg-[#f9fafb] rounded-2xl p-4 border border-[#e5e7eb]">
                        <h4 className="font-semibold text-[#081422] mb-3">
                          Selection Summary
                        </h4>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-[#6b7280] uppercase tracking-wider">
                              Level 1 (Parents)
                            </p>
                            <p className="text-2xl font-bold text-[#ff782d]">
                              {categoryStats.level1}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6b7280] uppercase tracking-wider">
                              Level 2 (Selected)
                            </p>
                            <p className="text-2xl font-bold text-[#081422]">
                              {formData.category_ids.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6b7280] uppercase tracking-wider">
                              Level 3 (Children)
                            </p>
                            <p className="text-2xl font-bold text-[#ff782d]">
                              {categoryStats.level3}
                            </p>
                          </div>
                        </div>
                      </div>

                      {errors.category_ids && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.category_ids}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 5: Plan Selection */}
                {currentStep === 5 && (
                  <>
                    <div>
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tier}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                          placeholder="e.g., Technology"
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
                          Company Size
                        </label>
                        <select
                          value={formData.size}
                          onChange={(e) =>
                            handleInputChange("size", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422] outline-none focus:border-[#ff782d]"
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-100">51-100 employees</option>
                          <option value="100-500">100-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                        {errors.size && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.size}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 6: Notifications */}
                {currentStep === 6 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-4">
                        Notification Preferences
                      </label>
                      <div className="border-2 border-[#d1d5db] rounded-2xl p-4 space-y-3">
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
