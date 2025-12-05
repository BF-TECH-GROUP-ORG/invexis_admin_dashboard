"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Box,
  TablePagination,
  Chip,
} from "@mui/material";
import CompanyUserService from "@/services/CompanyUserService";
import { HiTrash, HiUser } from "react-icons/hi";
import { useNotification } from "@/providers/NotificationProvider";

export default function CompanyAdminsTable() {
  const { showNotification } = useNotification();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetch = async () => {
    try {
      const res = await CompanyUserService.getAll({ page: 1, limit: 1000 });
      const payload = res?.data ?? res ?? [];
      const list = payload?.companyUsers ?? payload?.data ?? payload;
      setRows(Array.isArray(list) ? list : []);
      setTotal(Array.isArray(list) ? list.length : payload?.totalCount ?? 0);
    } catch (err) {
      console.error("Failed to fetch company users", err);
      showNotification({
        message: "Failed to load company admins",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleRemove = async (companyId, userId) => {
    try {
      await CompanyUserService.removeUserFromCompany(companyId, userId);
      showNotification({
        message: "Removed user from company",
        severity: "success",
      });
      fetch();
    } catch (err) {
      showNotification({ message: "Failed to remove", severity: "error" });
    }
  };

  const handleSuspend = async (companyId, userId) => {
    try {
      await CompanyUserService.suspendUser(companyId, userId);
      showNotification({ message: "User suspended", severity: "success" });
      fetch();
    } catch (err) {
      showNotification({ message: "Failed to suspend", severity: "error" });
    }
  };

  return (
    <Card sx={{ padding: 2, borderRadius: 0 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1}
      >
        <Typography variant="h6">Company Admins</Typography>
        <Typography variant="caption" color="text.secondary">
          {total} assignments
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((r) => (
                <TableRow
                  key={r.id || r._id || `${r.company_id}-${r.user_id}`}
                  hover
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <HiUser />
                      <div>
                        <Typography variant="subtitle2">
                          {r.user?.firstName
                            ? `${r.user.firstName} ${r.user.lastName || ""}`
                            : r.user_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.user?.email ?? r.user?.phone ?? ""}
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell>{r.company?.name ?? r.company_id}</TableCell>
                  <TableCell>{r.role?.name ?? r.role_id ?? "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status ?? "active"}
                      size="small"
                      color={r.status === "active" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Suspend">
                      <IconButton
                        size="small"
                        onClick={() => handleSuspend(r.company_id, r.user_id)}
                      >
                        <HiTrash />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(r.company_id, r.user_id)}
                      >
                        <HiTrash />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" px={2} py={1}>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    </Card>
  );
}
