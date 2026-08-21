"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTablePagination } from "@/features/SettingsSlice";
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
import UsersAnalyticsCards from "./UsersAnalyticsCards";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import UserService from "@/services/UserService";
import { useRouter } from "next/navigation";

export default function UsersListTable() {
  // Direct API state instead of useHybridQuery
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users directly from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await UserService.getCompanyAdmins();
        const userData = res.admins || (Array.isArray(res) ? res : []);
        setUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(err.message);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const dispatch = useDispatch();
  const tableSettings = useSelector((s) => s.settings?.tables?.users || {});
  const page = tableSettings.page ?? 0;
  const rowsPerPage = tableSettings.rowsPerPage ?? 5;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();
  const router = useRouter();

  // persist filters/search to settings
  useEffect(() => {
    try {
      dispatch({
        type: "settings/setTableFilters",
        payload: {
          tableId: "users",
          filters: { search, roleFilter, statusFilter },
        },
      });
    } catch (e) { }
  }, [search, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.position || "").toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "suspended"
          ? u.accountStatus === "suspended" || u.accountStatus === false
          : u.accountStatus === statusFilter);
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
    dispatch(setTablePagination({ tableId: "users", page: 0 }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(filteredUsers.map((u) => u.id || u._id));
    else setSelected([]);
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChangePage = (_, newPage) =>
    dispatch(setTablePagination({ tableId: "users", page: newPage }));

  const handleChangeRowsPerPage = (e) => {
    const v = parseInt(e.target.value, 10);
    dispatch(setTablePagination({ tableId: "users", rowsPerPage: v, page: 0 }));
  };

  const handleAddUser = () => {
    router.push("/users/add-new-user");
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const user = users.find((u) => (u.id || u._id) === id);
      if (!user) return;

      const newStatus = currentStatus === "active" ? "suspended" : "active";

      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountStatus: newStatus,
      };

      await UserService.update(id, payload);
      showNotification({ message: "User status updated", severity: "success" });

      // Update local state directly for immediate feedback
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === id ? { ...u, accountStatus: newStatus } : u
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
      showNotification({
        message: err.message || "Failed to update status",
        severity: "error",
      });
    }
    setOpenMenu(null);
  };

  const handleEditUser = (id) => {
    router.push(`/users/edit/${id}`);
    setOpenMenu(null);
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        showLoader();
        await UserService.delete(id);
        showNotification({ message: "User deleted", severity: "success" });
        // Refetch users to update the list
        const res = await UserService.getCompanyAdmins();
        const userData =
          res.users || res.data || (Array.isArray(res) ? res : []);
        setUsers(userData);
      } catch (err) {
        showNotification({
          message: "Failed to delete user",
          severity: "error",
        });
      } finally {
        hideLoader();
        setOpenMenu(null);
      }
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
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </Box>

        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <TableContainer sx={{ minWidth: 1200 }}>
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
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Company</TableCell>
                  {/* <TableCell>Assignments</TableCell> */}
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u, index, arr) => {
                    const userId = u.id || u._id;
                    return (
                      <TableRow
                        key={userId}
                        hover
                        selected={selected.includes(userId)}
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
                            checked={selected.includes(userId)}
                            onChange={() => handleSelectRow(userId)}
                          />
                        </TableCell>

                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              src={u.profilePicture}
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
                              {/* Username removed as it's not in API response */}
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{u.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {u.phone}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={u.role?.replace("_", " ")}
                            size="small"
                            sx={{
                              backgroundColor: "#fff8f5",
                              color: "#ff782d",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          />
                        </TableCell>

                        {/* <TableCell>
                          <Typography variant="body2">
                            {u.position || "-"}
                          </Typography>
                          {u.department && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {u.department.replace("_", " ")}
                            </Typography>
                          )}
                        </TableCell> */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            {u.companies?.length
                              ? `${u.companies.length} Companies`
                              : "-"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            {u.shops?.length ? `${u.shops.length} Shops` : ""}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <IOSSwitch
                            checked={u?.accountStatus === "active"}
                            onChange={() =>
                              handleToggleActive(userId, u.accountStatus)
                            }
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ position: "relative" }}>
                          <Box sx={{ position: "relative" }}>
                            <Tooltip title="More actions">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu === userId ? null : userId
                                  )
                                }
                              >
                                <HiDotsVertical />
                              </IconButton>
                            </Tooltip>

                            {openMenu === userId && (
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
                                  onClick={() => handleEditUser(userId)}
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
                                  onClick={() => handleDeleteUser(userId)}
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
                    );
                  })}
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
