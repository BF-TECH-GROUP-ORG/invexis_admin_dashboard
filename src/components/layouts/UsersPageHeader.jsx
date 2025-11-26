"use client";

import React from "react";
import { Box, Typography, Breadcrumbs, Link, Button } from "@mui/material";
import { HiUserAdd } from "react-icons/hi";

export default function UsersPageHeader({
  onAddUser,
  onAdd,
  title = "Company List",
  link = "/clients/new",
  addLabel = "Add Company",
  breadcrumb = [
    { label: "Dashboard", href: "/" },
    { label: "clients", href: "/clients" },
    { label: "List" },
  ],
  startIcon,
}) {
  const handleAdd = onAddUser || onAdd;

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
          ml: 1,
        }}
      >
        {breadcrumb.map((b, i) =>
          b.href ? (
            <Link
              key={i}
              underline="hover"
              color="#7a7a7a"
              href={b.href}
              sx={{ fontWeight: 500, "&:hover": { color: "#081422" } }}
            >
              {b.label}
            </Link>
          ) : (
            <Typography key={i} color="#081422" fontWeight={600}>
              {b.label}
            </Typography>
          )
        )}
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
          {title}
        </Typography>

        {handleAdd ? (
          <Button
            variant="contained"
            startIcon={startIcon ?? <HiUserAdd size={20} />}
            onClick={handleAdd}
            sx={{
              backgroundColor: "#081422",
              color: "#fff",
              textTransform: "none",
              borderRadius: "10px",
              fontFamily: "Metropolis, sans-serif",
              fontWeight: 500,
              px: 2.5,
              py: 1,
              "&:hover": { backgroundColor: "#0b2036" },
            }}
          >
            <Link href={link} className="text-white underline-none">{addLabel}</Link>
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
