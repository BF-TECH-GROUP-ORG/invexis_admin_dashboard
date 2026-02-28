"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Container,
} from "@mui/material";
import {
  HiOutlineChevronLeft,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineBadgeCheck,
  HiOutlineExternalLink,
  HiOutlineDocumentSearch,
  HiCheck,
  HiX,
} from "react-icons/hi";
import CompanyService from "@/services/CompanyService";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import CompanyVerificationForm from "@/components/forms/CompanyVerificationForm";

export default function CompanyVerifyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();
  const [company, setCompany] = useState(null);

  const fetchCompany = async () => {
    try {
      showLoader();
      const res = await CompanyService.getById(id);
      setCompany(res?.data || res);
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Failed to load company details",
        severity: "error",
      });
      router.push("/clients/list");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (id) fetchCompany();
  }, [id]);

  const onUploaded = () => fetchCompany();

  const handleReview = async (decision) => {
    try {
      showLoader();
      await CompanyService.reviewVerification(
        id,
        decision,
        `${decision} by admin`
      );
      showNotification({
        message: `Company verification ${decision}`,
        severity: "success",
      });
      fetchCompany();
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Failed to process verification review",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return { bg: "#f0fdf4", color: "#16a34a", label: "Active" };
      case "pending_verification":
      case "pending": return { bg: "#fff7ed", color: "#f97316", label: "Pending Verification" };
      case "rejected": return { bg: "#fef2f2", color: "#dc2626", label: "Rejected" };
      default: return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  if (!company) return null;

  const status = getStatusStyle(company.status);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", display: "flex" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 0, md: 320 },
          display: { xs: "none", md: "block" },
          borderRight: "1px solid #f1f3f5",
          bgcolor: "#f8fafc",
          p: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 6 }}>
          <Avatar
            src={`https://ui-avatars.com/api/?name=${company.name}&background=ff782d&color=fff&size=128`}
            sx={{ width: 100, height: 100, mb: 2, boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}
          />
          <Typography variant="h6" fontWeight={800} sx={{ color: "#081422" }}>
            {company.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
            COMPANY ID: {company.id?.substring(0, 8).toUpperCase()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4, opacity: 0.5 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HiOutlineMail size={18} color="#94a3b8" />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700, mb: -0.5 }}>EMAIL</Typography>
              <Typography variant="body2" fontWeight={600} color="#334155">{company.email || "—"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HiOutlinePhone size={18} color="#94a3b8" />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700, mb: -0.5 }}>PHONE</Typography>
              <Typography variant="body2" fontWeight={600} color="#334155">{company.phone || "—"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HiOutlineOfficeBuilding size={18} color="#94a3b8" />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 700, mb: -0.5 }}>LOCATION</Typography>
              <Typography variant="body2" fontWeight={600} color="#334155">
                {company.city ? `${company.city}, ${company.country}` : company.country || "—"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: "auto", pt: 6 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700, mb: 2 }}>STATUS</Typography>
          <Box sx={{ bgcolor: status.bg, color: status.color, p: 1.5, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="caption" fontWeight={800}>{status.label.toUpperCase()}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: { xs: 3, md: 8 } }}>
        <Container maxWidth="lg" sx={{ p: 0 }}>
          <Box sx={{ mb: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Button
                startIcon={<HiOutlineChevronLeft />}
                onClick={() => router.push("/clients/list")}
                sx={{
                  mb: 1,
                  color: "#94a3b8",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#ff782d", bgcolor: "transparent" },
                  p: 0,
                }}
              >
                Back to List
              </Button>
              <Typography variant="h4" fontWeight={900} sx={{ color: "#081422", letterSpacing: -1 }}>
                Verification Dashboard
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleReview("rejected")}
                sx={{
                  borderColor: "#f1f5f9",
                  color: "#64748b",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" },
                }}
              >
                Reject Verification
              </Button>
              <Button
                variant="contained"
                onClick={() => handleReview("approved")}
                sx={{
                  bgcolor: "#ff782d",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(255,120,45,0.2)",
                  "&:hover": { bgcolor: "#e66a25", boxShadow: "0 6px 16px rgba(255,120,45,0.3)" },
                }}
              >
                Approve Company
              </Button>
            </Box>
          </Box>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <CompanyVerificationForm
                companyId={id}
                onUploaded={onUploaded}
                existingDocs={company.metadata?.verification?.documents || []}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}


