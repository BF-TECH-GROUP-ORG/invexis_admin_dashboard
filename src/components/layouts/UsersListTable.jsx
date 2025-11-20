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
  Button,
} from "@mui/material";
import { HiDotsVertical, HiSearch, HiTrash, HiPencil } from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import UsersAnalyticsCards from "./UsersAnalyticsCards";
import { Edit2, Trash2, MoreHorizontal, User as UserIcon } from "lucide-react";

const mockUsers = [
  {
    id: "u1",
    firstName: "Company",
    lastName: "Admin",
    email: "company.admin@company.com",
    phone: "+250789123459",
    role: "company_admin",
    position: "Admin",
    nationalId: "COMP12345",
    companies: ["company-uuid-123"],
    shops: [],
    active: true,
  },
  {
    id: "u2",
    firstName: "Store",
    lastName: "Worker",
    email: "store.worker@company.com",
    phone: "+250789123463",
    role: "worker",
    position: "Sales Representative",
    nationalId: "WORK12345",
    companies: ["company-uuid-123"],
    shops: ["shop-uuid-456"],
    active: true,
  },
  {
    id: "u3",
    firstName: "Shop",
    lastName: "Manager",
    email: "shop.manager@company.com",
    phone: "+250789123461",
    role: "shop_manager",
    position: "Manager",
    nationalId: "SHOP12345",
    companies: ["company-uuid-123"],
    shops: ["shop-uuid-456"],
    active: false,
  },
  {
    id: "u4",
    firstName: "Frank",
    lastName: "bahirwa",
    email: "super.adminns@invexis.com",
    phone: "+250789133157",
    role: "super_admin",
    position: "Admin",
    nationalId: "ABC1452345",
    companies: [],
    shops: [],
    active: true,
  },
];

export default function UsersListTable() {
  const [users, setUsers] = useState(mockUsers);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.position || "").toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus =
        !statusFilter || (statusFilter === "active" ? u.active : !u.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleCardFilter = (payload = {}) => {
    const { role = "", status = "" } = payload;
    const same = role === roleFilter && status === statusFilter;
    if (same) {
      setRoleFilter("");
      setStatusFilter("");
    } else {
      setRoleFilter(role || "");
      setStatusFilter(status || "");
    }
    setPage(0);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(filteredUsers.map((u) => u.id));
    else setSelected([]);
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAddUser = () => {
    // route to add user page or open modal
    alert("Go to add user form");
  };

  const handleToggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    setOpenMenu(null);
  };

  const handleEditUser = (id) => {
    alert(`Edit user ${id}`);
    setOpenMenu(null);
  };

  const handleDeleteUser = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setOpenMenu(null);
    }
  };

  const roles = Array.from(new Set(users.map((u) => u.role))).filter(Boolean);

  return (
    <>
      <UsersAnalyticsCards
        users={users}
        onFilter={handleCardFilter}
        activeFilters={{ role: roleFilter, status: statusFilter }}
      />

      <Card
        sx={{
          borderRadius: 0,
          boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
          border: "none",
        }}
      >
        <UsersPageHeader
          onAddUser={handleAddUser}
          title="Users"
          addLabel="Add User"
          link="/users/add-new-user"
          breadcrumb={[
            { label: "Dashboard", href: "/" },
            { label: "Users" },
            { label: "List" },
          ]}
        />

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
            placeholder="Search users..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            displayEmpty
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r.replace("_", " ")}
              </MenuItem>
            ))}
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
                        selected.length < filteredUsers.length
                      }
                      checked={
                        filteredUsers.length > 0 &&
                        selected.length === filteredUsers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Company / Shop</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u, index, arr) => (
                    <TableRow
                      key={u.id}
                      hover
                      selected={selected.includes(u.id)}
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
                          checked={selected.includes(u.id)}
                          onChange={() => handleSelectRow(u.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "#fff8f5",
                              color: "#ff782d",
                            }}
                          >
                            {(u.firstName || "")[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {u.firstName} {u.lastName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {u.nationalId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            backgroundColor: "#fff8f5",
                            color: "#ff782d",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{u.position || "-"}</TableCell>
                      <TableCell>
                        {u.companies?.length ? u.companies.join(", ") : "-"}
                        {u.shops?.length ? " / " + u.shops.join(", ") : ""}
                      </TableCell>

                      <TableCell>
                        <IOSSwitch
                          checked={u.active}
                          onChange={() => handleToggleActive(u.id)}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ position: "relative" }}>
                        <Box sx={{ position: "relative" }}>
                          <Tooltip title="More actions">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setOpenMenu(openMenu === u.id ? null : u.id)
                              }
                            >
                              <HiDotsVertical />
                            </IconButton>
                          </Tooltip>

                          {openMenu === u.id && (
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
                                onClick={() => handleEditUser(u.id)}
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
                                <HiPencil size={16} /> Edit
                              </Box>
                              <Box
                                component="button"
                                onClick={() => handleDeleteUser(u.id)}
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
                                <HiTrash size={16} /> Delete
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
            count={filteredUsers.length}
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
