"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  HiOutlineOfficeBuilding,
  HiOutlineExternalLink,
  HiOutlineDocumentSearch,
} from "react-icons/hi";
import { Menu, MenuItem, Button } from "@mui/material";
import CompanyService from "../../../services/CompanyService";
import CategoryService from "../../../services/CategoryService";
import { useNotification } from "../../../providers/NotificationProvider";
import { useLoading } from "../../../providers/LoadingProvider";

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const [verificationFile, setVerificationFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tierMenuAnchor, setTierMenuAnchor] = useState(null);

  // Company data state
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch company data
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await CompanyService.getById(id);
      setCompany(res?.data || res);
    } catch (error) {
      console.error("Failed to fetch company:", error);
      showNotification({
        message: "Failed to load company details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCompany();
  }, [id]);

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
      formData.append("files", verificationFile);

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
        const l2catsAll = (await Promise.all(fetches)).filter(Boolean);
        // Deduplicate Level 2
        const l2cats = Array.from(new Map(l2catsAll.map(c => [c.id || c._id, c])).values());

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
        const l1catsAll = (await Promise.all(parentFetches)).filter(Boolean);
        // Deduplicate Level 1
        const l1cats = Array.from(new Map(l1catsAll.map(c => [c.id || c._id, c])).values());

        // fetch level3 that have parent in selected level2 ids
        const allL3Fetches = l2cats.map((l2) =>
          CategoryService.getAll({
            parent: l2.id || l2._id,
            level: 3,
            page: 1,
            limit: 500,
          })
            .then((r) => r?.data || r)
            .catch(() => null)
        );
        const l3groups = (await Promise.all(allL3Fetches)).filter(Boolean);
        const l3All = l3groups.flatMap((g) => g || []);
        // Deduplicate Level 3
        const l3 = Array.from(new Map(l3All.map(c => [c.id || c._id, c])).values());

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6 md:p-12 bg-[#fcfcfc]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => router.push("/clients/list")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#ff782d] transition-colors font-medium mb-4 group"
            >
              <ArrowLeft size={18} />
              Back to Companies
            </motion.button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-[#081422] tracking-tight">
                {company.name}
              </h1>
              {company.is_bank && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 rounded-lg"
                >
                  Bank Entity
                </motion.span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {company.status === "active" ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange("deactivated")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold transition-all"
              >
                <Power size={18} />
                Deactivate
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange("active")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-green-100 text-green-600 hover:bg-green-50 font-bold transition-all"
              >
                <CheckCircle size={18} />
                Activate
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05, shadow: "0 20px 25px -5px rgb(255 120 45 / 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/clients/edit/${id}`)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ff782d] to-[#ff985d] text-white hover:to-[#ff782d] font-bold transition-all shadow-xl shadow-orange-200/50"
            >
              <Edit size={18} />
              Edit Profile
            </motion.button>
          </div>
        </motion.div>

        {/* Top Grid: Main Info + Subscription Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Info Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8">
              <span className={`px-5 py-2 rounded-2xl text-xs font-black border uppercase tracking-widest ${getStatusColor(company.status)}`}>
                {company.status?.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Email</p>
                <p className="text-lg font-bold text-[#081422] group-hover:text-[#ff782d] transition-colors">{company.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Contact</p>
                <p className="text-lg font-bold text-[#081422]">{company.phone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Web Domain</p>
                <p className="text-lg font-bold text-[#ff782d] truncate hover:underline cursor-pointer">{company.domain || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Location</p>
                <p className="text-lg font-bold text-[#081422]">{company.city}, {company.country}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created Date</p>
                <p className="text-sm font-medium text-gray-600">{new Date(company.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Update</p>
                <p className="text-sm font-medium text-gray-600">{new Date(company.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Subscription Summary Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-[#081422] rounded-[2rem] p-8 text-white relative flex flex-col justify-between overflow-hidden shadow-2xl shadow-[#081422]/20"
          >
            {/* Abstract background element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff782d]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <ShieldCheck className="text-[#ff782d]" size={40} />
                </motion.div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Tier</p>
                  <h2 className="text-3xl font-black capitalize bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    {company.tier}
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-400 font-medium">Status</span>
                  <span className={`flex items-center gap-2 font-black tracking-tighter uppercase text-[10px] px-3 py-1 rounded-full ${company.subscription?.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${company.subscription?.is_active ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    {company.subscription?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-400 font-medium">Billing</span>
                  <span className="font-bold text-lg">{company.subscription?.amount?.toLocaleString()} <span className="text-[10px] text-gray-500">{company.subscription?.currency}</span></span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-400 font-medium">Expiry</span>
                  <span className="font-bold text-[#ff782d]">
                    {company.subscription?.end_date ? new Date(company.subscription.end_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => setTierMenuAnchor(e.currentTarget)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
              >
                Manage Subscription
                <ChevronDown size={14} />
              </motion.button>
              <Menu
                anchorEl={tierMenuAnchor}
                open={Boolean(tierMenuAnchor)}
                onClose={() => setTierMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: '1.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '0.5rem'
                  }
                }}
              >
                {["basic", "mid", "pro"].map((tier) => (
                  <MenuItem
                    key={tier}
                    onClick={() => handleTierChange(tier)}
                    sx={{
                      borderRadius: '1rem',
                      fontWeight: 'bold',
                      margin: '0.25rem 0',
                      '&.Mui-selected': { backgroundColor: '#fff8f5', color: '#ff782d' }
                    }}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </motion.div>
        </div>

        {/* Lower Grid: Categories + Payment Phones + Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Category Hierarchy Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.005 }}
              className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
            >
              <h3 className="text-xl font-black text-[#081422] mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#ff782d] rounded-full"></div>
                Industry Classification
              </h3>

              {categoryDetails.level2.length > 0 ? (
                <div className="space-y-10">
                  {categoryDetails.level1.map((l1) => {
                    const l1Id = l1.id || l1._id;
                    const childrenL2 = categoryDetails.level2.filter(l2 =>
                      (l2.parentCategory?.id || l2.parentCategory?._id || l2.parentCategory) === l1Id
                    );

                    return (
                      <motion.div key={l1Id} layout className="group">
                        <div className="flex items-center gap-4 mb-6">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-[#ff782d] transition-colors whitespace-nowrap">
                            {l1.name}
                          </h4>
                          <div className="h-px bg-gray-100 w-full"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ml-4">
                          {childrenL2.map((l2) => {
                            const l2Id = l2.id || l2._id;
                            const childrenL3 = categoryDetails.level3.filter(l3 =>
                              (l3.parentCategory?.id || l3.parentCategory?._id || l3.parentCategory) === l2Id
                            );

                            return (
                              <motion.div
                                key={l2Id}
                                whileHover={{ y: -4, shadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                                className="p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-orange-100 hover:bg-white transition-all"
                              >
                                <p className="font-bold text-[#081422] text-sm mb-4 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                  {l2.name}
                                </p>

                                {childrenL3.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {childrenL3.map((l3) => (
                                      <motion.span
                                        key={l3.id || l3._id}
                                        whileHover={{ scale: 1.05, backgroundColor: "#fff8f5", color: "#ff782d" }}
                                        className="px-3 py-1 bg-white text-[10px] font-bold text-gray-500 border border-gray-100 rounded-xl shadow-sm cursor-default transition-colors"
                                      >
                                        {l3.name}
                                      </motion.span>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 opacity-50">
                  <HiOutlineOfficeBuilding size={64} className="mb-4 text-gray-200" />
                  <p className="italic font-medium">No business categories mapped</p>
                </div>
              )}
            </motion.div>

            {/* Payment Phones Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.005 }}
              className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
            >
              <h3 className="text-xl font-black text-[#081422] mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Mobile Payment Providers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {company.payment_phones?.length > 0 ? (
                  company.payment_phones.map((phone, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: "#f8fbff" }}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-200/50 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg ${phone.provider === 'MTN' ? 'bg-yellow-400 shadow-yellow-100' : 'bg-red-500 shadow-red-100'}`}>
                          {phone.provider?.[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{phone.provider}</p>
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[8px] font-black rounded">{phone.currency}</span>
                          </div>
                          <p className="text-lg font-black text-gray-800">{phone.phoneNumber}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-4 border-white ${phone.enabled ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-2 text-center py-10 text-gray-400 italic font-medium">No mobile payment profiles configured</p>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Documents & Verification Control */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-12"
            >
              <h3 className="text-xl font-black text-[#081422] mb-8 flex items-center gap-3">
                <FileText className="text-[#ff782d]" />
                Compliance Record
              </h3>

              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {company.metadata?.verification?.documents?.length > 0 ? (
                    company.metadata.verification.documents.map((doc, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ x: 5 }}
                        className="group flex items-center gap-4 p-5 bg-gray-50 hover:bg-orange-50/30 rounded-2xl transition-all border border-gray-100 hover:border-orange-100"
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#ff782d] transition-colors shadow-sm">
                          <FileText size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#081422] truncate">
                            {doc.name || `Legal Document ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                            {doc.format || 'PDF'} • {(doc.size / 1024).toFixed(0)}KB
                          </p>
                        </div>
                        <motion.a
                          href={doc.url || "#"}
                          target="_blank"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 bg-white rounded-xl text-[#ff782d] hover:bg-[#ff782d] hover:text-white transition-all shadow-sm border border-gray-100"
                        >
                          <HiOutlineExternalLink size={18} />
                        </motion.a>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10"
                    >
                      <HiOutlineDocumentSearch size={56} className="mx-auto text-gray-100 mb-4" />
                      <p className="text-[10px] text-gray-400 font-black italic uppercase tracking-[0.2em]">Zero artifacts found</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Upload Interface */}
              <form onSubmit={handleFileUpload} className="space-y-5">
                <motion.label
                  whileHover={{ borderColor: "#ff782d", backgroundColor: "#fff8f5" }}
                  className="group block w-full p-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] transition-all cursor-pointer text-center"
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setVerificationFile(e.target.files[0])}
                  />
                  <motion.div
                    animate={verificationFile ? { scale: [1, 1.1, 1] } : {}}
                    className="w-16 h-16 bg-gray-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all shadow-inner"
                  >
                    <Upload className="text-gray-400 group-hover:text-[#ff782d]" size={28} />
                  </motion.div>
                  <p className="text-sm font-black text-[#081422] mb-1">
                    {verificationFile ? verificationFile.name : "Secure Upload"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em]">Drag & drop legal evidence</p>
                </motion.label>

                <AnimatePresence>
                  {verificationFile && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-5 bg-[#081422] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-gray-200/50 disabled:opacity-50"
                    >
                      {isUploading ? "Transmitting..." : "Push to Registry"}
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>

              {/* Approval Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-12 pt-10 border-t border-gray-50">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVerify("approved")}
                  className="py-5 bg-green-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-100/50"
                >
                  Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#fee2e2" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVerify("rejected")}
                  className="py-5 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Reject
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyDetailsPage;
