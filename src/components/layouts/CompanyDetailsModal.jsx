"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Link,
  TextField,
} from "@mui/material";
import CompanyService from "@/services/CompanyService";
import CategoryService from "@/services/CategoryService";
import { useLoading } from "@/providers/LoadingProvider";
import { useNotification } from "@/providers/NotificationProvider";

export default function CompanyDetailsModal({ open, onClose, companyId }) {
  const [company, setCompany] = useState(null);
  const [level3Categories, setLevel3Categories] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!open || !companyId) return;
    let mounted = true;
    (async () => {
      try {
        showLoader();
        const data = await CompanyService.getById(companyId);
        const companyData = data?.data || data || null;
        if (mounted) setCompany(companyData);
      } catch (err) {
        console.error("Failed to load company details", err);
        showNotification({
          message: "Failed to load company details",
          severity: "error",
        });
        onClose?.();
      } finally {
        hideLoader();
      }
    })();
    return () => (mounted = false);
  }, [open, companyId]);

  // fetch Level 3 categories tied to this company
  useEffect(() => {
    if (!open || !companyId) return;
    let mounted = true;
    (async () => {
      try {
        // don't show global loader for this small fetch
        const data = await CategoryService.getLevel3ByCompany(companyId);
        const cats = data?.data || data || [];
        if (mounted) setLevel3Categories(cats || []);
      } catch (err) {
        console.warn("Failed to load level 3 categories for company", err);
        // non-fatal; we don't surface an error snackbar here
      }
    })();
    return () => (mounted = false);
  }, [open, companyId]);

  const [reviewNote, setReviewNote] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const handleReview = async (decision) => {
    try {
      showLoader();
      await CompanyService.reviewVerification(companyId, decision, reviewNote);
      showNotification({
        message: `Company verification ${decision}`,
        severity: "success",
      });
      // Refresh company data
      const data = await CompanyService.getById(companyId);
      setCompany(data?.data || data);
      setReviewNote("");
    } catch (err) {
      console.error("Review failed", err);
      showNotification({
        message: err?.response?.data?.message || "Review failed",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    try {
      showLoader();
      const formData = new FormData();
      formData.append("files", uploadFile);
      // Optional: Add document type/notes if needed, but backend defaults are fine
      
      await CompanyService.uploadVerificationDocs(companyId, formData);
      showNotification({
        message: "Document uploaded successfully",
        severity: "success",
      });
      setUploadFile(null);
      // Refresh company data
      const data = await CompanyService.getById(companyId);
      setCompany(data?.data || data);
    } catch (err) {
      console.error("Upload failed", err);
      showNotification({
        message: err?.response?.data?.message || "Upload failed",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Company Details</DialogTitle>
      <DialogContent>
        {!company && <Typography>Loading...</Typography>}
        {company && (
          <Box>
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {company.domain}
            </Typography>

            <Box mt={2}>
              <Typography variant="subtitle2">Contact</Typography>
              <Typography>{company.email || "-"}</Typography>
              <Typography>{company.phone || "-"}</Typography>
              <Typography>
                {company.country || "-"}{" "}
                {company.city ? `, ${company.city}` : ""}
              </Typography>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2">Tier</Typography>
              <Typography>{company.tier}</Typography>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography>{company.status}</Typography>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2">
                Verification Documents
              </Typography>
              <List>
                {(company.metadata?.verification?.documents || []).length ===
                  0 && (
                  <ListItem>
                    <ListItemText primary="No documents uploaded" />
                  </ListItem>
                )}
                {(company.metadata?.verification?.documents || []).map(
                  (doc, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={
                          <Link href={doc.url} target="_blank">
                            {doc.name || doc.url}
                          </Link>
                        }
                        secondary={doc.notes ? `Notes: ${doc.notes}` : null}
                      />
                    </ListItem>
                  )
                )}
              </List>

              {/* Upload Section */}
              <Box mt={2} display="flex" gap={2} alignItems="center">
                <Button variant="outlined" component="label">
                  Select File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                </Button>
                {uploadFile && <Typography variant="body2">{uploadFile.name}</Typography>}
                <Button 
                  variant="contained" 
                  onClick={handleUpload}
                  disabled={!uploadFile}
                >
                  Upload
                </Button>
              </Box>
            </Box>

            {/* Review Section */}
            <Box mt={4} p={2} bgcolor="#f9fafb" borderRadius={2}>
              <Typography variant="subtitle2" gutterBottom>Review Verification</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Review notes (optional)"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Box display="flex" gap={2}>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleReview("approved")}
                >
                  Approve
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => handleReview("rejected")}
                >
                  Reject
                </Button>
              </Box>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2">Level 3 Categories</Typography>
              <List>
                {(!level3Categories || level3Categories.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No level 3 categories tied to this company" />
                  </ListItem>
                )}
                {(level3Categories || []).map((cat) => (
                  <ListItem key={cat.id || cat._id || cat.slug}>
                    <ListItemText primary={cat.name || cat.title || cat.slug} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
