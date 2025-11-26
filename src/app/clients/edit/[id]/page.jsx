"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CompanyService from "@/services/CompanyService";
import AddNewCompanyForm from "@/components/forms/AddNewCompanyForm";
import { Box, Typography } from "@mui/material";
import { useNotification } from "@/providers/NotificationProvider";

export default function EditCompanyPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await CompanyService.getById(id);
        const data = res?.data || res;
        if (mounted) setCompany(data);
      } catch (err) {
        console.error("Failed to load company", err);
        showNotification({
          message: "Failed to load company",
          severity: "error",
        });
        router.push("/clients/list");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <Box p={4}>
        <Typography>Loading company...</Typography>
      </Box>
    );

  if (!company)
    return (
      <Box p={4}>
        <Typography>Company not found.</Typography>
      </Box>
    );

  return <AddNewCompanyForm initialData={company} onSuccess={() => {}} />;
}
