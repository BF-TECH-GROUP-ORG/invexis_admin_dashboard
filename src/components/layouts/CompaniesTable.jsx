"use client";

import { useState, useMemo } from "react";
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
import { HiDotsVertical, HiSearch, HiTrash, HiPencil } from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import CompaniesAnalyticsCards from "./CompaniesAnalyticsCards";
import { useRouter } from "next/navigation";

const mockCompanies = [
  {
    name: "TechHub Rwanda Ltd",
    domain: "techhub-rw-1763386831.com",
    email: "shinjagiraarnold209@gmail.com",
    phone: "+250788123456",
    country: "Rwanda",
    city: "Kigali",
    address: "123 Innovation Street, Kigali",
    tier: "pro",
    industry: "Technology & Electronics",
    employees: 150,
    registrationNumber: "REG-2025-001",
    status: "active",
  },
  {
    name: "Innovate Africa Ltd",
    domain: "innovate-africa.com",
    email: "contact@innovate-africa.com",
    phone: "+250788987654",
    country: "Rwanda",
    city: "Kigali",
    address: "456 Startup Ave, Kigali",
    tier: "mid",
    industry: "Software & IT Services",
    employees: 75,
    registrationNumber: "REG-2025-002",
    status: "active",
  },
  {
    name: "GreenTech Solutions",
    domain: "greentech-solutions.com",
    email: "info@greentech-solutions.com",
    phone: "+250789112233",
    country: "Rwanda",
    city: "Huye",
    address: "789 Innovation Road, Huye",
    tier: "basic",
    industry: "Renewable Energy",
    employees: 120,
    registrationNumber: "REG-2025-003",
    status: "active",
  },
];

export default function CompaniesTable() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const router = useRouter();

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.tier.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase());
      const matchesTier =
        !tierFilter || c.tier.toLowerCase() === tierFilter.toLowerCase();
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesCountry = !countryFilter || c.country === countryFilter;
      return matchesSearch && matchesTier && matchesStatus && matchesCountry;
    });
  }, [companies, search, tierFilter, statusFilter, countryFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredCompanies.map((c) => c.registrationNumber));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (regNum) => {
    setSelected((prev) =>
      prev.includes(regNum)
        ? prev.filter((r) => r !== regNum)
        : [...prev, regNum]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAddCompany = () => {
    router.push("/inventory/companies/add-company");
  };

  const handleToggleStatus = (regNum) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.registrationNumber === regNum
          ? { ...c, status: c.status === "active" ? "inactive" : "active" }
          : c
      )
    );
  };

  const handleEditCompany = (regNum) => {
    router.push(`/clients/edit/${regNum}`);
    setOpenMenu(null);
  };

  const handleDeleteCompany = (regNum) => {
    if (confirm("Are you sure you want to delete this company?")) {
      setCompanies((prev) =>
        prev.filter((c) => c.registrationNumber !== regNum)
      );
      setOpenMenu(null);
    }
  };

  const getUniqueCountries = () => {
    return [...new Set(companies.map((c) => c.country))].sort();
  };

  return (
    <>
      {/* Analytics Cards */}
      <CompaniesAnalyticsCards companies={filteredCompanies} />

      {/* Companies Table Card */}
      <Card
        sx={{
          borderRadius: 0,
          boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
          border: "none",
        }}
      >
        <UsersPageHeader onAddUser={handleAddCompany} />

        {/* 🔍 Top Controls - Search & Filters */}
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
            <MenuItem value="inactive">Inactive</MenuItem>
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

        {/* 🧾 Scrollable Table */}
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
                  <TableCell>Industry</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCompanies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company, index, arr) => (
                    <TableRow
                      key={company.registrationNumber}
                      hover
                      selected={selected.includes(company.registrationNumber)}
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
                          checked={selected.includes(
                            company.registrationNumber
                          )}
                          onChange={() =>
                            handleSelectRow(company.registrationNumber)
                          }
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
                              {company.registrationNumber}
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
                          }}
                        />
                      </TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.employees}</TableCell>

                      <TableCell>
                        <IOSSwitch
                          checked={company.status === "active"}
                          onChange={() =>
                            handleToggleStatus(company.registrationNumber)
                          }
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ position: "relative" }}>
                        <Box sx={{ position: "relative" }}>
                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                setOpenMenu(
                                  openMenu === company.registrationNumber
                                    ? null
                                    : company.registrationNumber
                                )
                              }
                            >
                              <HiDotsVertical />
                            </IconButton>
                          </Tooltip>

                          {/* Action Menu Popup */}
                          {openMenu === company.registrationNumber && (
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
                                minWidth: 150,
                                mt: 0.5,
                              }}
                            >
                              <Box
                                component="button"
                                onClick={() =>
                                  handleEditCompany(company.registrationNumber)
                                }
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
                                  "&:hover": {
                                    backgroundColor: "#f9fafb",
                                  },
                                }}
                              >
                                <HiPencil size={16} />
                                Edit
                              </Box>
                              <Box
                                component="button"
                                onClick={() =>
                                  handleDeleteCompany(
                                    company.registrationNumber
                                  )
                                }
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
                                  "&:hover": {
                                    backgroundColor: "#fee2e2",
                                  },
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

        {/* ⚙️ Bottom Controls */}
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
    </>
  );
}
