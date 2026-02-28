"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDownload,
} from "react-icons/hi";
import CompanyService from "@/services/CompanyService";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";

export default function CompanyVerificationForm({
  companyId,
  existingDocs = [],
  onUploaded,
}) {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []);
    setFiles((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      file: f,
      type: f.type,
      size: (f.size / 1024 / 1024).toFixed(2), // MB
    }));
    setPreviewUrls((p) => [...p, ...urls]);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (idx) => {
    setPreviewUrls((p) => {
      const newUrls = [...p];
      if (newUrls[idx].url) URL.revokeObjectURL(newUrls[idx].url);
      return newUrls.filter((_, i) => i !== idx);
    });
    setFiles((f) => f.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length)
      return showNotification({
        message: "Pick at least one file to upload",
        severity: "info",
      });

    try {
      setUploading(true);
      showLoader();

      const fd = new FormData();
      if (process.env.NODE_ENV === "development") {
        console.log(`[Form] Appending ${files.length} files to FormData`);
      }

      files.forEach((f, i) => {
        if (process.env.NODE_ENV === "development") {
          console.debug(`[Form] Adding file: ${f.name} to 'files' field`);
        }
        fd.append("files", f);
      });

      const res = await CompanyService.uploadVerificationDocs(companyId, fd);
      if (res?.success) {
        showNotification({
          message: "Documents uploaded successfully",
          severity: "success",
        });
        setFiles([]);
        setPreviewUrls([]);
        onUploaded?.();
      } else {
        showNotification({ message: "Upload failed", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showNotification({
        message: err?.response?.data?.message || "Upload failed",
        severity: "error",
      });
    } finally {
      hideLoader();
      setUploading(false);
    }
  };

  const renderFileRow = (doc, index, isExisting = false) => (
    <Box
      key={index}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        border: "1px solid #f1f5f9",
        bgcolor: "#ffffff",
        transition: "all 0.2s",
        "&:hover": { borderColor: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8fafc",
          }}
        >
          <HiOutlineDocumentText size={22} color="#64748b" />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700} color="#334155">
            {doc.name || `Document ${index + 1}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isExisting ? "Verified Document" : `${doc.size} MB • Ready to upload`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {!isExisting ? (
          <Tooltip title="Remove File">
            <IconButton
              size="small"
              onClick={() => removePreview(index)}
              sx={{ color: "#94a3b8", "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" } }}
            >
              <HiOutlineTrash size={18} />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="Download">
              <IconButton
                size="small"
                component="a"
                href={doc.url}
                target="_blank"
                sx={{ color: "#94a3b8", "&:hover": { color: "#ff782d", bgcolor: "#fff7ed" } }}
              >
                <HiOutlineDownload size={18} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Upload Area */}
      <Box
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById("file-input").click()}
        sx={{
          border: "2px dashed",
          borderColor: isDragging ? "#ff782d" : "#e2e8f0",
          borderRadius: 4,
          p: 6,
          textAlign: "center",
          transition: "all 0.3s ease",
          bgcolor: isDragging ? "rgba(255, 120, 45, 0.05)" : "#fffbf9",
          cursor: "pointer",
          "&:hover": {
            borderColor: "#ff782d",
            bgcolor: "rgba(255, 120, 45, 0.02)",
          },
        }}
      >
        <input
          id="file-input"
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          style={{ display: "none" }}
        />
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "rgba(255, 120, 45, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <HiOutlineCloudUpload size={32} color="#ff782d" />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#334155", mb: 1 }}>
          Drag and drop documents here
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          or <span style={{ color: "#ff782d", fontWeight: 700, textDecoration: "underline" }}>Browse Files</span>
        </Typography>
      </Box>

      {/* File List Section */}
      {(previewUrls.length > 0 || existingDocs.length > 0) && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={800} color="#081422">
              Recent Documents
            </Typography>
            {previewUrls.length > 0 && (
              <Button
                variant="contained"
                disabled={uploading}
                onClick={handleSubmit}
                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <HiOutlineCheckCircle />}
                sx={{
                  bgcolor: "#ff782d",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  "&:hover": { bgcolor: "#e66a25" },
                }}
              >
                {uploading ? "Uploading..." : "Save Documents"}
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {previewUrls.map((p, i) => renderFileRow(p, i))}
            {existingDocs.length > 0 && previewUrls.length > 0 && <Divider sx={{ my: 3, borderStyle: "dashed" }} />}
            {existingDocs.map((d, i) => renderFileRow(d, i, true))}
          </Box>
        </Box>
      )}
    </Box>
  );
}


