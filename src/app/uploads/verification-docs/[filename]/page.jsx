"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

// Base URL for the backend - matching the one in axios.js
// We strip the '/api' suffix to get the root for static files if they are served from root
const API_BASE_URL = "https://5fd3ebd3d745.ngrok-free.app";

export default function DocumentViewerPage({ params }) {
  const router = useRouter();
  const { filename } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Construct the source URL for the file on the backend
  // Assuming backend serves files at /uploads/verification-docs/:filename
  const fileUrl = `${API_BASE_URL}/uploads/verification-docs/${filename}`;

  const isPdf = filename?.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

  const handleBack = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            variant="outlined"
            sx={{
              color: "#081422",
              borderColor: "#d1d5db",
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ color: "#081422", fontWeight: 600 }}>
            {filename}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            startIcon={<Download size={20} />}
            href={fileUrl}
            download
            target="_blank"
            variant="contained"
            sx={{
              bgcolor: "#081422",
              "&:hover": { bgcolor: "#2c3e50" },
            }}
          >
            Download
          </Button>
          <Button
            startIcon={<ExternalLink size={20} />}
            href={fileUrl}
            target="_blank"
            variant="outlined"
            sx={{
              color: "#081422",
              borderColor: "#d1d5db",
            }}
          >
            Open Original
          </Button>
        </Box>
      </Box>

      {/* Content Viewer */}
      <Box
        sx={{
          flex: 1,
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {isPdf ? (
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            title="PDF Viewer"
          />
        ) : isImage ? (
          <Box
            component="img"
            src={fileUrl}
            alt="Document"
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Preview not available for this file type.
            </Typography>
            <Button
              variant="contained"
              href={fileUrl}
              download
              sx={{ mt: 2, bgcolor: "#ff782d" }}
            >
              Download File
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
