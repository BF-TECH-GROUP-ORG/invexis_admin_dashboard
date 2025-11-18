"use client";

import React from "react";
import { Box, Typography, Breadcrumbs, Link, Button } from "@mui/material";
import { HiUserAdd } from "react-icons/hi";

export default function UsersPageHeader({ onAddUser }) {
  return (
    <Box mb={3}>
      {/* === Breadcrumbs Navigation === */}
      <Breadcrumbs
        separator="›"
        aria-label="breadcrumb"
        sx={{
          fontFamily: "Metropolis, sans-serif",
          fontSize: 14,
          color: "#7a7a7a",
          mb: 1,
          ml: 1
        }}
      >
        <Link
          underline="hover"
          color="#7a7a7a"
          href="/"
          sx={{
            fontWeight: 500,
            "&:hover": { color: "#081422" },
          }}
        >
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="#7a7a7a"
          href="/clients"
          sx={{
            fontWeight: 500,
            "&:hover": { color: "#081422" },
          }}
        >
          clients
        </Link>
        <Typography color="#081422" fontWeight={600}>
          List
        </Typography>
      </Breadcrumbs>

      {/* === Title + Button Row === */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#081422",
            fontFamily: "Metropolis, sans-serif",
            ml: 1,
          }}
        >
          Company List
        </Typography>

        <Button
          variant="contained"
          startIcon={<HiUserAdd size={20} />}
          onClick={onAddUser}
          sx={{
            backgroundColor: "#081422",
            color: "#fff",
            textTransform: "none",
            borderRadius: "10px",
            fontFamily: "Metropolis, sans-serif",
            fontWeight: 500,
            px: 2.5,
            py: 1,
            "&:hover": {
              backgroundColor: "#0b2036",
            },
          }}
        >
          Add Company
        </Button>
      </Box>
    </Box>
  );
}
