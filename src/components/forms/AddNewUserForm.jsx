"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import UserService from "@/services/UserService";
import CompanyService from "@/services/CompanyService";
import CompanyUserService from "@/services/CompanyUserService";
import RoleService from "@/services/RoleService";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import { useSelector } from "react-redux";

const AddNewUserForm = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();
  const currentUser = useSelector((state) => state.auth?.user);
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
    gender: "other",
    dateOfBirth: "",
    nationalId: "",
    
    // Role & Work
    role: "worker",
    position: "",
    department: "",
    companies: [], // Array of IDs
    shops: [], // Array of IDs
    active: true,

    // Address
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",

    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  
  // New state for role management
  const [selectedCompanyRoles, setSelectedCompanyRoles] = useState({}); // { companyId: roleId }
  const [availableRoles, setAvailableRoles] = useState({}); // { companyId: [roles] }
  const [loadingRoles, setLoadingRoles] = useState({}); // { companyId: boolean }
  
  // Dummy shops data
  const availableShops = [
    { id: "shop-1", name: "Kigali Main Shop" },
    { id: "shop-2", name: "Musanze Branch" },
    { id: "shop-3", name: "Rubavu Outlet" },
    { id: "shop-4", name: "Huye Center" },
  ];

  const roles = ["super_admin", "company_admin", "shop_manager", "worker", "customer"];
  const departments = [
    "sales", "inventory_management", "inventory_operations", "sales_manager", "development", "hr", "management", "other"
  ];

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
      title: "Role & Work",
      fields: ["role", "position", "department", "companies", "shops"],
    },
    {
      id: 4,
      title: "Address & Emergency",
      fields: ["street", "city", "state", "postalCode", "country", "emergencyName", "emergencyPhone"],
    },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await CompanyService.getAll();
        // Assuming res.data.companies or res.companies contains the list
        // Adjust based on actual API response structure
        const companiesList = res.companies || res.data || [];
        setAvailableCompanies(companiesList);
      } catch (err) {
        console.error("Failed to fetch companies", err);
        showNotification({ message: "Failed to load companies", severity: "error" });
      }
    };
    fetchCompanies();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleMultiSelectChange = async (field, value) => {
    // Toggle selection
    setFormData((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      let updated;
      if (exists) {
        updated = current.filter((item) => item !== value);
      } else {
        updated = [...current, value];
      }
      return { ...prev, [field]: updated };
    });

    // If it's a company selection, fetch roles for that company
    if (field === "companies") {
      const isSelected = formData.companies.includes(value);
      
      if (!isSelected) {
        // Company was just selected, fetch its roles
        setLoadingRoles((prev) => ({ ...prev, [value]: true }));
        try {
          const rolesData = await RoleService.getRolesByCompany(value);
          const rolesList = rolesData.roles || rolesData.data || (Array.isArray(rolesData) ? rolesData : []);
          setAvailableRoles((prev) => ({ ...prev, [value]: rolesList }));
        } catch (err) {
          console.error(`Failed to fetch roles for company ${value}`, err);
          showNotification({ message: `Failed to load roles for this company`, severity: "warning" });
          setAvailableRoles((prev) => ({ ...prev, [value]: [] }));
        } finally {
          setLoadingRoles((prev) => ({ ...prev, [value]: false }));
        }
      } else {
        // Company was deselected, remove its role selection
        setSelectedCompanyRoles((prev) => {
          const updated = { ...prev };
          delete updated[value];
          return updated;
        });
        setAvailableRoles((prev) => {
          const updated = { ...prev };
          delete updated[value];
          return updated;
        });
      }
    }
  };

  const validateStep = (stepId) => {
    const newErrors = {};
    const role = formData.role;
    const isCustomer = role === "customer";
    const isSuperAdmin = role === "super_admin";
    const isWorkerOrManager = ["worker", "shop_manager"].includes(role);

    // Step 1: Basic Info
    if (stepId === 1) {
      if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email?.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";

      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Min 8 chars";

      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    // Step 2: Personal Details
    if (stepId === 2) {
      if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
      else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ""))) newErrors.phone = "Invalid E.164 phone";

      if (isCustomer && !formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required for customers";
      
      if (!isCustomer && !formData.nationalId?.trim()) newErrors.nationalId = "National ID is required";
    }

    // Step 3: Role & Work
    if (stepId === 3) {
      if (!formData.role) newErrors.role = "Role is required";
      
      if (!isCustomer && !isSuperAdmin && !formData.position?.trim()) newErrors.position = "Position is required";

      if (isWorkerOrManager && !formData.department) newErrors.department = "Department is required";
      
      // Validate that each selected company has a role assigned (for non-super_admin, non-customer)
      if (!isCustomer && !isSuperAdmin && formData.companies.length > 0) {
        const missingRoles = formData.companies.filter(compId => !selectedCompanyRoles[compId]);
        if (missingRoles.length > 0) {
          newErrors.companyRoles = `Please select a role for all selected companies`;
        }
      }
    }

    // Step 4: Address & Emergency
    if (stepId === 4) {
      if (!isCustomer) {
        if (!formData.street?.trim()) newErrors.street = "Street is required";
        if (!formData.country?.trim()) newErrors.country = "Country is required";
        
        if (!formData.emergencyName?.trim()) newErrors.emergencyName = "Emergency contact name is required";
        if (!formData.emergencyPhone?.trim()) newErrors.emergencyPhone = "Emergency contact phone is required";
      }
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
      role: formData.role,
      permissions: [],
      active: formData.active,
      
      ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
      ...(formData.nationalId && { nationalId: formData.nationalId }),
      ...(formData.position && { position: formData.position }),
      ...(formData.department && { department: formData.department }),
      
      companies: formData.companies,
      shops: formData.shops,

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
    };

    try {
      showLoader();
      
      // Step 1: Create user in Auth service
      const userResponse = await UserService.create(payload);
      const createdUser = userResponse.user || userResponse.data || userResponse;
      const userId = createdUser._id || createdUser.id;

      if (!userId) {
        throw new Error("User created but ID not returned from server");
      }

      // Step 2: Create company-user relationships if companies are assigned
      const companyAssignmentErrors = [];
      if (formData.companies.length > 0 && formData.role !== "super_admin" && formData.role !== "customer") {
        const assignmentPromises = formData.companies.map(async (companyId) => {
          try {
            const roleId = selectedCompanyRoles[companyId];
            if (!roleId) {
              throw new Error(`No role selected for company ${companyId}`);
            }

            await CompanyUserService.assignUserToCompany({
              company_id: companyId,
              user_id: userId,
              role_id: roleId,
              status: "active",
              createdBy: currentUser?._id || currentUser?.id,
            });
          } catch (err) {
            console.error(`Failed to assign user to company ${companyId}:`, err);
            companyAssignmentErrors.push({ companyId, error: err.message });
          }
        });

        await Promise.all(assignmentPromises);
      }

      // Show appropriate notification
      if (companyAssignmentErrors.length === 0) {
        showNotification({ message: "User created successfully", severity: "success" });
      } else if (companyAssignmentErrors.length === formData.companies.length) {
        showNotification({ 
          message: "User created but failed to assign to companies. Please assign manually.", 
          severity: "warning" 
        });
      } else {
        showNotification({ 
          message: `User created. ${companyAssignmentErrors.length} company assignment(s) failed.`, 
          severity: "warning" 
        });
      }

      router.push("/users/list");
    } catch (err) {
      console.error("Create user failed", err);
      showNotification({ 
        message: err.response?.data?.message || "Failed to create user", 
        severity: "error" 
      });
    } finally {
      hideLoader();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const currentStepData = steps[currentStep - 1];

  const renderInput = (label, field, type = "text", placeholder = "", required = false) => (
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
          errors[field] ? "border-red-500" : "border-[#d1d5db] hover:border-[#ff782d]"
        } bg-white text-[#081422] placeholder-[#6b7280]`}
      />
      {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
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
                  {currentStepData.title}
                </h2>
                <p className="text-[#6b7280] mt-2">
                  Step {currentStep} of {steps.length}
                </p>
              </div>

              <div className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput("First Name", "firstName", "text", "e.g., John", true)}
                    {renderInput("Last Name", "lastName", "text", "e.g., Doe", true)}
                    {renderInput("Email Address", "email", "email", "e.g., user@example.com", true)}
                    
                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Min 8 characters"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.password ? "border-red-500" : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 p-1 text-[#6b7280]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Repeat password"
                        className={`w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-[#ff782d] ${
                          errors.confirmPassword ? "border-red-500" : "border-[#d1d5db] hover:border-[#ff782d]"
                        } bg-white text-[#081422]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 p-1 text-[#6b7280]"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput("Phone Number", "phone", "tel", "e.g., +250788123456", true)}
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {renderInput("Date of Birth", "dateOfBirth", "date", "", formData.role === 'customer')}
                    {renderInput("National ID", "nationalId", "text", "e.g., 1199...", formData.role !== 'customer')}
                  </div>
                )}

                {/* Step 3: Role & Work */}
                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#081422] mb-2">Role <span className="text-red-500">*</span></label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r} className="capitalize">{r.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>

                    {renderInput("Position", "position", "text", "e.g., Manager", formData.role !== 'customer' && formData.role !== 'super_admin')}

                    {["worker", "shop_manager"].includes(formData.role) && (
                      <div>
                        <label className="block text-sm font-semibold text-[#081422] mb-2">Department <span className="text-red-500">*</span></label>
                        <select
                          value={formData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-[#d1d5db] bg-white text-[#081422]"
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d} value={d} className="capitalize">{d.replace("_", " ")}</option>
                          ))}
                        </select>
                        {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">Assign Companies</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border-2 border-[#d1d5db] rounded-2xl p-3">
                        {availableCompanies.length > 0 ? (
                          availableCompanies.map((comp) => (
                            <label key={comp.id || comp._id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.companies.includes(comp.id || comp._id)}
                                onChange={() => handleMultiSelectChange("companies", comp.id || comp._id)}
                                className="w-4 h-4 accent-[#ff782d]"
                              />
                              <span className="text-sm text-[#081422]">{comp.companyName || comp.name || "Unnamed Company"}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No companies available</p>
                        )}
                      </div>
                    </div>

                    {/* Role Selection for Each Company */}
                    {formData.companies.length > 0 && formData.role !== 'super_admin' && formData.role !== 'customer' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#081422] mb-2">
                          Company Roles <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3 border-2 border-[#d1d5db] rounded-2xl p-4 bg-gray-50">
                          {formData.companies.map((compId) => {
                            const company = availableCompanies.find(c => (c.id || c._id) === compId);
                            const companyRoles = availableRoles[compId] || [];
                            const isLoadingRoles = loadingRoles[compId];
                            
                            return (
                              <div key={compId} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[#081422] min-w-[150px]">
                                  {company?.companyName || company?.name || 'Unknown'}:
                                </span>
                                {isLoadingRoles ? (
                                  <span className="text-sm text-gray-500">Loading roles...</span>
                                ) : companyRoles.length > 0 ? (
                                  <select
                                    value={selectedCompanyRoles[compId] || ""}
                                    onChange={(e) => setSelectedCompanyRoles(prev => ({ 
                                      ...prev, 
                                      [compId]: e.target.value 
                                    }))}
                                    className="flex-1 px-4 py-2 rounded-xl border-2 border-[#d1d5db] bg-white text-[#081422] focus:border-[#ff782d] outline-none"
                                  >
                                    <option value="">Select Role</option>
                                    {companyRoles.map((role) => (
                                      <option key={role.id || role._id} value={role.id || role._id}>
                                        {role.name || 'Unnamed Role'}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm text-red-500">No roles available for this company</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {errors.companyRoles && <p className="text-red-500 text-sm mt-1">{errors.companyRoles}</p>}
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#081422] mb-2">Assign Shops</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border-2 border-[#d1d5db] rounded-2xl p-3">
                        {availableShops.map((shop) => (
                          <label key={shop.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.shops.includes(shop.id)}
                              onChange={() => handleMultiSelectChange("shops", shop.id)}
                              className="w-4 h-4 accent-[#ff782d]"
                            />
                            <span className="text-sm text-[#081422]">{shop.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange("active", e.target.checked)}
                        className="w-4 h-4 accent-[#ff782d]"
                      />
                      <label htmlFor="active" className="text-sm font-medium text-[#081422]">Active Account</label>
                    </div>
                  </div>
                )}

                {/* Step 4: Address & Emergency */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput("Street", "street", "text", "", formData.role !== 'customer')}
                        {renderInput("City", "city", "text")}
                        {renderInput("State", "state", "text")}
                        {renderInput("Postal Code", "postalCode", "text")}
                        {renderInput("Country", "country", "text", "", formData.role !== 'customer')}
                      </div>
                    </div>

                    <div className="md:col-span-2 border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput("Contact Name", "emergencyName", "text", "", formData.role !== 'customer')}
                        {renderInput("Contact Phone", "emergencyPhone", "tel", "", formData.role !== 'customer')}
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
                        <Check size={18} /> Save User
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
                      <p className={`font-semibold text-sm transition-colors ${step.id <= currentStep ? "text-[#081422]" : "text-[#6b7280]"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5">Step {step.id} of {steps.length}</p>
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
