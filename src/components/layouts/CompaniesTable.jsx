"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  Checkbox,
  TextField,
  FormControlLabel,
  TablePagination,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  HiDotsVertical,
  HiSearch,
  HiTrash,
  HiPencil,
  HiEye,
  HiUpload,
  HiBan,
  HiCheckCircle,
} from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import CompaniesAnalyticsCards from "./CompaniesAnalyticsCards";
import { useRouter } from "next/navigation";
import CompanyService from "../../services/CompanyService";
import { useNotification } from "../../providers/NotificationProvider";
import { useLoading } from "../../providers/LoadingProvider";
import CompanyDetailsModal from "./CompanyDetailsModal";
import { setTablePagination } from "@/features/SettingsSlice";

export default function CompaniesTable() {
  const tableSettings = useSelector((s) => s.settings?.tables?.companies || {});
  const tableFilters = tableSettings.filters || {};
  const [tierFilter, setTierFilter] = useState(tableFilters.tierFilter || "");
  const [statusFilter, setStatusFilter] = useState(
    tableFilters.statusFilter || ""
  );
  const [countryFilter, setCountryFilter] = useState(
    tableFilters.countryFilter || ""
  );
  const page = tableSettings.page ?? 0;
  const rowsPerPage = tableSettings.rowsPerPage ?? 5;

  // Direct API state instead of useHybridQuery
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch companies directly from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (tierFilter) params.tier = tierFilter;
        if (statusFilter) params.status = statusFilter;
        if (countryFilter) params.country = countryFilter;
        params.limit = rowsPerPage || 50;
        params.offset = page * (rowsPerPage || 50);

        const data = await CompanyService.getAll(params);
        setCompanies(data?.data || data || []);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setError(err.message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [tierFilter, statusFilter, countryFilter, page, rowsPerPage]);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCompanyId, setDetailsCompanyId] = useState(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase()) ||
        c.tier?.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase());
      const matchesTier =
        !tierFilter || c.tier?.toLowerCase() === tierFilter.toLowerCase();
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesCountry = !countryFilter || c.country === countryFilter;
      return matchesSearch && matchesTier && matchesStatus && matchesCountry;
    });
  }, [companies, search, tierFilter, statusFilter, countryFilter]);

  useEffect(() => {
    try {
      dispatch(
        setTablePagination({
          tableId: "companies",
        })
      );
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      dispatch({
        type: "settings/setTableFilters",
        payload: {
          tableId: "companies",
          filters: { search, tierFilter, statusFilter, countryFilter },
        },
      });
    } catch (e) { }
  }, [search, tierFilter, statusFilter, countryFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredCompanies.map((c) => c.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleChangePage = (_, newPage) =>
    dispatch(setTablePagination({ tableId: "companies", page: newPage }));

  const handleChangeRowsPerPage = (e) => {
    const v = parseInt(e.target.value, 10);
    dispatch(
      setTablePagination({ tableId: "companies", rowsPerPage: v, page: 0 })
    );
  };

  const handleAddCompany = () => {
    router.push("/clients/new");
  };

  const handleDeactivate = async (id) => {
    try {
      showLoader();
      await CompanyService.changeStatus(id, "deactivated");
      showNotification({ message: "Company deactivated", severity: "success" });
      // Refetch companies instead of invalidating query
      setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, status: "deactivated" } : c));
    } catch (err) {
      showNotification({
        message: "Failed to deactivate company",
        severity: "error",
      });
    } finally {
      hideLoader();
      setOpenMenu(null);
    }
  };

  const handleReactivate = async (id) => {
    try {
      showLoader();
      await CompanyService.reactivate(id);
      showNotification({ message: "Company reactivated", severity: "success" });
      // Refetch companies instead of invalidating query
      setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, status: "active" } : c));
    } catch (err) {
      showNotification({
        message: "Failed to reactivate company",
        severity: "error",
      });
    } finally {
      hideLoader();
      setOpenMenu(null);
    }
  };

  const handleEditCompany = (id) => {
    router.push(`/clients/edit/${id}`);
    setOpenMenu(null);
  };

  const handleDeleteCompany = async (id) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      showLoader();
      await CompanyService.delete(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      showNotification({ message: "Company deleted", severity: "success" });
    } catch (err) {
      showNotification({
        message: "Failed to delete company",
        severity: "error",
      });
    } finally {
      hideLoader();
      setOpenMenu(null);
    }
  };

  const handleViewDetails = (id) => {
    router.push(`/clients/${id}`);
    setOpenMenu(null);
  };

  const handleUploadPrompt = (id) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      const files = input.files;
      if (files && files.length) handleUploadDocuments(id, files);
    };
    input.click();
    setOpenMenu(null);
  };

  const handleUploadDocuments = async (id, files) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("documents", f));
    try {
      showLoader();
      await CompanyService.uploadVerificationDocs(id, fd);
      showNotification({ message: "Documents uploaded", severity: "success" });
      // Refetch the company to update the UI
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, metadata: { ...c.metadata, verification: { ...c.metadata?.verification, documents: [...(c.metadata?.verification?.documents || []), ...Array.from(files).map((f) => f.name)] } } }
            : c
        )
      );
    } catch (err) {
      showNotification({ message: "Upload failed", severity: "error" });
    } finally {
      hideLoader();
    }
  };

  const getUniqueCountries = () => {
    return [...new Set(companies.map((c) => c.country || ""))]
      .filter(Boolean)
      .sort();
  };

  const getStatusChip = (status) => {
    let label = status;
    let color = "default";
    let bgColor = "#f3f4f6";
    let textColor = "#374151";

    if (status === "active") {
      label = "Active";
      bgColor = "#E8F5E9";
      textColor = "#2E7D32";
    } else if (status === "deactivated") {
      label = "Deactivated";
      bgColor = "#FFEBEE";
      textColor = "#C62828";
    } else if (status === "pending_verification" || status === "pending") {
      label = "Pending";
      bgColor = "#FFF3E0";
      textColor = "#EF6C00";
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: bgColor,
          color: textColor,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      />
    );
  };

  return (
    <>
      <CompaniesAnalyticsCards companies={filteredCompanies} />

      {loading && (
        <Box px={2.5} py={2}>
          <Typography variant="body2">Loading companies...</Typography>
        </Box>
      )}

      {error && (
        <Box px={2.5} py={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Card
        sx={{
          borderRadius: 0,
          boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
          border: "none",
        }}
      >
        <UsersPageHeader onAddUser={handleAddCompany} />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2.5}
          py={1.5}
          gap={2}
          flexWrap="wrap"
        >
          <TextField
            placeholder="Search companies..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HiSearch size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Select
            size="small"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All Tiers</MenuItem>
            <MenuItem value="pro">Pro</MenuItem>
            <MenuItem value="mid">Mid</MenuItem>
            <MenuItem value="basic">Basic</MenuItem>
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending_verification">Pending</MenuItem>
            <MenuItem value="deactivated">Deactivated</MenuItem>
          </Select>

          <Select
            size="small"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Countries</MenuItem>
            {getUniqueCountries().map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <TableContainer sx={{ minWidth: 1000 }}>
            <Table size={dense ? "small" : "medium"}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f9fafb",
                    "& th:first-of-type": { borderTopLeftRadius: 12 },
                    "& th:last-of-type": { borderTopRightRadius: 12 },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredCompanies.length
                      }
                      checked={
                        filteredCompanies.length > 0 &&
                        selected.length === filteredCompanies.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCompanies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company, index, arr) => (
                    <TableRow
                      key={company.id || index}
                      hover
                      selected={selected.includes(company.id)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f4f6f8",
                          "& td:first-of-type":
                            index === arr.length - 1
                              ? { borderBottomLeftRadius: 12 }
                              : {},
                          "& td:last-of-type":
                            index === arr.length - 1
                              ? { borderBottomRightRadius: 12 }
                              : {},
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(company.id)}
                          onChange={() => handleSelectRow(company.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            alt={company.name}
                            src={`https://ui-avatars.com/api/?name=${company.name}`}
                            sx={{ width: 36, height: 36 }}
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {company.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {company.id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell>{company.country}</TableCell>
                      <TableCell>{company.city}</TableCell>
                      <TableCell>
                        <Chip
                          label={company.tier}
                          size="small"
                          sx={{
                            backgroundColor:
                              company.tier === "pro"
                                ? "#E0F2FE"
                                : company.tier === "mid"
                                  ? "#FEF3C7"
                                  : "#E8F5E9",
                            color:
                              company.tier === "pro"
                                ? "#0369A1"
                                : company.tier === "mid"
                                  ? "#B45309"
                                  : "#2E7D32",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>

                      <TableCell>{getStatusChip(company.status)}</TableCell>

                      <TableCell align="center" sx={{ position: "relative" }}>
                        <Box sx={{ position: "relative" }}>
                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === company.id ? null : company.id
                                )
                              }
                            >
                              <HiDotsVertical />
                            </IconButton>
                          </Tooltip>

                          {openMenu === company.id && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                zIndex: 10,
                                minWidth: 160,
                                mt: 0.5,
                              }}
                            >
                              <Box
                                component="button"
                                onClick={() => handleViewDetails(company.id)}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1.5,
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#081422",
                                  borderBottom: "1px solid #e5e7eb",
                                  "&:hover": { backgroundColor: "#f9fafb" },
                                }}
                              >
                                <HiEye size={16} />
                                View Details
                              </Box>

                              <Box
                                component="button"
                                onClick={() => handleEditCompany(company.id)}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1.5,
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#081422",
                                  borderBottom: "1px solid #e5e7eb",
                                  "&:hover": { backgroundColor: "#f9fafb" },
                                }}
                              >
                                <HiPencil size={16} />
                                Edit
                              </Box>

                              <Box
                                component="button"
                                onClick={() => handleUploadPrompt(company.id)}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1.5,
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#081422",
                                  borderBottom: "1px solid #e5e7eb",
                                  "&:hover": { backgroundColor: "#f9fafb" },
                                }}
                              >
                                <HiUpload size={16} />
                                Add Documents
                              </Box>

                              <Box
                                component="button"
                                onClick={() => {
                                  router.push(`/clients/verify/${company.id}`);
                                  setOpenMenu(null);
                                }}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1.5,
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#081422",
                                  borderBottom: "1px solid #e5e7eb",
                                  "&:hover": { backgroundColor: "#f9fafb" },
                                }}
                              >
                                <HiEye size={16} />
                                Verify
                              </Box>

                              {company.status === "active" ? (
                                <Box
                                  component="button"
                                  onClick={() => handleDeactivate(company.id)}
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 2,
                                    py: 1.5,
                                    border: "none",
                                    backgroundColor: "transparent",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    color: "#dc2626",
                                    borderBottom: "1px solid #e5e7eb",
                                    "&:hover": { backgroundColor: "#fee2e2" },
                                  }}
                                >
                                  <HiBan size={16} />
                                  Deactivate
                                </Box>
                              ) : (
                                <Box
                                  component="button"
                                  onClick={() => handleReactivate(company.id)}
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 2,
                                    py: 1.5,
                                    border: "none",
                                    backgroundColor: "transparent",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    color: "#16a34a",
                                    borderBottom: "1px solid #e5e7eb",
                                    "&:hover": { backgroundColor: "#dcfce7" },
                                  }}
                                >
                                  <HiCheckCircle size={16} />
                                  Reactivate
                                </Box>
                              )}

                              <Box
                                component="button"
                                onClick={() => handleDeleteCompany(company.id)}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1.5,
                                  border: "none",
                                  backgroundColor: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#dc2626",
                                  "&:hover": { backgroundColor: "#fee2e2" },
                                }}
                              >
                                <HiTrash size={16} />
                                Delete
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1.5}
          sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f3f3f3ff" }}
        >
          <FormControlLabel
            control={
              <IOSSwitch
                checked={dense}
                onChange={(e) => setDense(e.target.checked)}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                Dense padding
              </Typography>
            }
            sx={{
              "& .MuiFormControlLabel-label": {
                fontFamily: "Metropolis, sans-serif",
              },
            }}
          />

          <TablePagination
            component="div"
            count={filteredCompanies.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Card>
      <CompanyDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        companyId={detailsCompanyId}
      />
    </>
  );
}
