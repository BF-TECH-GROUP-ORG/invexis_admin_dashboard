"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Edit,
  Power,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Menu, MenuItem, Button } from "@mui/material";
import CompanyService from "../../../services/CompanyService";
import CategoryService from "../../../services/CategoryService";
import { useNotification } from "../../../providers/NotificationProvider";
import { useLoading } from "../../../providers/LoadingProvider";
import { useDataCache } from "../../../hooks/useDataCache";

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const [verificationFile, setVerificationFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tierMenuAnchor, setTierMenuAnchor] = useState(null);

  // Use cached data hook
  const {
    data: company,
    loading,
    refetch: fetchCompany,
    updateLocal,
  } = useDataCache(
    `company_${id}`,
    async () => {
      const res = await CompanyService.getById(id);
      return res?.data || res;
    },
    [id]
  );

  const handleStatusChange = async (newStatus) => {
    try {
      showLoader();
      if (newStatus === "active" && company.status === "deactivated") {
        await CompanyService.reactivate(id);
      } else {
        await CompanyService.changeStatus(id, newStatus);
      }
      showNotification({
        message: `Company status updated to ${newStatus}`,
        severity: "success",
      });
      fetchCompany();
    } catch (err) {
      showNotification({
        message: "Failed to update status",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const handleTierChange = async (newTier) => {
    try {
      showLoader();
      await CompanyService.changeTier(id, newTier);
      showNotification({
        message: `Company tier changed to ${newTier}`,
        severity: "success",
      });
      setTierMenuAnchor(null);
      fetchCompany();
    } catch (err) {
      showNotification({
        message: err.response?.data?.message || "Failed to change tier",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!verificationFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("documents", verificationFile);

      await CompanyService.uploadVerificationDocs(id, formData);
      showNotification({
        message: "Documents uploaded successfully",
        severity: "success",
      });
      setVerificationFile(null);
      fetchCompany();
    } catch (err) {
      showNotification({
        message: "Failed to upload documents",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // load more category details for nicer display (level1 / level2 / level3)
  const [categoryDetails, setCategoryDetails] = React.useState({
    level1: [],
    level2: [],
    level3: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!company?.category_ids || !company.category_ids.length) return;
      try {
        // batch fetch level 2 category details
        const ids = company.category_ids || [];
        const fetches = ids.map((cid) =>
          CategoryService.getById(cid)
            .then((r) => r?.data || r)
            .catch(() => null)
        );
        const l2cats = (await Promise.all(fetches)).filter(Boolean);
        if (!mounted) return;

        // gather level1 parents from the selected level2
        const parentIds = [
          ...new Set(
            l2cats.map(
              (c) =>
                c.parentCategory?.id ||
                c.parentCategory?._id ||
                c.parentCategory
            )
          ),
        ].filter(Boolean);

        const parentFetches = parentIds.map((pid) =>
          CategoryService.getById(pid)
            .then((r) => r?.data || r)
            .catch(() => null)
        );
        const l1cats = (await Promise.all(parentFetches)).filter(Boolean);

        // fetch level3 that have parent in selected level2 ids
        const allL3Fetches = l2cats.map((l2) =>
          CategoryService.getAll({
            parent: l2.id,
            level: 3,
            page: 1,
            limit: 500,
          })
            .then((r) => r?.data || r)
            .catch(() => null)
        );
        const l3groups = (await Promise.all(allL3Fetches)).filter(Boolean);
        const l3 = l3groups.flatMap((g) => g || []);

        setCategoryDetails({ level1: l1cats, level2: l2cats, level3: l3 });
      } catch (err) {
        // ignore
      }
    })();
    return () => (mounted = false);
  }, [company?.category_ids]);

  const handleVerify = async (decision) => {
    try {
      showLoader();
      // Using 'decision' as per the corrected service method
      await CompanyService.reviewVerification(id, decision);
      showNotification({
        message: `Verification ${decision}`,
        severity: "success",
      });
      fetchCompany();
    } catch (err) {
      showNotification({
        message: "Failed to review verification",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  if (loading && !company)
    return <div className="p-12 text-center">Loading...</div>;
  if (!company) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending_verification":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "deactivated":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/clients/list")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ff782d] transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Companies
          </button>

          <div className="flex gap-3">
            {company.status === "active" ? (
              <button
                onClick={() => handleStatusChange("deactivated")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium transition-all"
              >
                <Power size={18} />
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("active")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-green-200 text-green-600 hover:bg-green-50 font-medium transition-all"
              >
                <CheckCircle size={18} />
                Activate
              </button>
            )}
            <button
              onClick={() => router.push(`/clients/edit/${id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff782d] text-white hover:bg-[#ff6b1a] font-medium transition-all shadow-lg shadow-orange-200"
            >
              <Edit size={18} />
              Edit Details
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Company Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#081422] mb-2">
                    {company.name}
                  </h1>
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff782d] hover:underline font-medium"
                  >
                    {company.domain}
                  </a>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(
                    company.status
                  )} capitalize`}
                >
                  {company.status?.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="font-medium text-[#081422]">
                    {company.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-[#081422]">
                    {company.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-[#081422]">
                    {company.city}, {company.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#081422] capitalize">
                      {company.tier} Plan
                    </p>
                    <button
                      onClick={(e) => setTierMenuAnchor(e.currentTarget)}
                      className="text-gray-400 hover:text-[#ff782d]"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <Menu
                      anchorEl={tierMenuAnchor}
                      open={Boolean(tierMenuAnchor)}
                      onClose={() => setTierMenuAnchor(null)}
                    >
                      {["basic", "mid", "pro"].map((tier) => (
                        <MenuItem
                          key={tier}
                          onClick={() => handleTierChange(tier)}
                          selected={company.tier === tier}
                        >
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#081422] mb-6">
                Categories
              </h3>
              {company.category_ids && company.category_ids.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex gap-3 flex-wrap items-center">
                    <div className="px-3 py-1 rounded-lg bg-[#fff8f5] text-[#ff782d] font-semibold">
                      Level 2 selected: {company.category_ids.length}
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-[#f3f5ff] text-[#334155] font-semibold">
                      Level 1 linked: {categoryDetails.level1.length}
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-[#f0fff4] text-[#065f46] font-semibold">
                      Level 3 total: {categoryDetails.level3.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        Level 2 (selected)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {categoryDetails.level2.map((c) => (
                          <span
                            key={c.id || c._id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        Level 3 (tied to selected)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {categoryDetails.level3.map((c) => (
                          <span
                            key={c.id || c._id}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No categories assigned</p>
              )}
            </div>
          </div>

          {/* Right Column: Verification & Actions */}
          <div className="space-y-8">
            {/* Verification Status */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#081422] mb-6 flex items-center gap-2">
                <ShieldCheck className="text-[#ff782d]" />
                Verification
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  {company.metadata?.verification?.status === "approved" ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="text-orange-500" size={20} />
                  )}
                  <span className="font-medium capitalize">
                    {company.metadata?.verification?.status || "Pending"}
                  </span>
                </div>
              </div>

              {/* Document List */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Uploaded Documents</p>
                <div className="space-y-3">
                  {company.metadata?.verification?.documents?.length > 0 ? (
                    company.metadata.verification.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-sm font-medium truncate flex-1">
                          {doc.name || `Document ${idx + 1}`}
                        </span>
                        <a
                          href={doc.url || "#"}
                          target="_blank"
                          className="text-[#ff782d] text-xs font-bold hover:underline"
                        >
                          VIEW
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No documents uploaded yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleFileUpload} className="mb-6">
                <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#ff782d] hover:bg-[#fff8f5] transition-all cursor-pointer text-center">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setVerificationFile(e.target.files[0])}
                  />
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600 font-medium">
                    {verificationFile
                      ? verificationFile.name
                      : "Upload Legal Document"}
                  </span>
                </label>
                {verificationFile && (
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full mt-3 py-2 bg-[#081422] text-white rounded-xl font-medium hover:bg-black transition-all disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Submit Document"}
                  </button>
                )}
              </form>

              {/* Admin Actions */}
              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Admin Actions
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleVerify("approved")}
                    className="py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify("rejected")}
                    className="py-2 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
