"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
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
  Switch,
  TablePagination,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { HiDotsVertical, HiSearch } from "react-icons/hi";
import IOSSwitch from "../shared/IosSwitch";
import UsersPageHeader from "./UsersPageHeader";
import { useRouter } from "next/navigation";

const mockWorkers = [
  {
    firstName: "Store",
    lastName: "Worker",
    email: "store.worker@company.com",
    phone: "+250789123463",
    role: "worker",
    position: "Sales Representative",
    department: "Sales",
    gender: "Male",
    nationalId: "WORK12345",
    address: { city: "Kigali", country: "Rwanda" },
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+250789987654",
    role: "manager",
    position: "Cashier",
    department: "Finance",
    gender: "Male",
    nationalId: "WORK56789",
    address: { city: "Kigali", country: "Rwanda" },
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    phone: "+250788123456",
    role: "worker",
    position: "Stock Keeper",
    department: "Inventory",
    gender: "Female",
    nationalId: "WORK91011",
    address: { city: "Huye", country: "Rwanda" },
  },
];

export default function WorkersTable() {
  const [workers] = useState(mockWorkers);
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const router = useRouter();

  // Filtering logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchesSearch =
        `${w.firstName} ${w.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        w.email.toLowerCase().includes(search.toLowerCase()) ||
        w.phone.includes(search);
      const matchesFilter =
        !filter ||
        w.role.toLowerCase() === filter.toLowerCase() ||
        w.position.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [workers, search, filter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredWorkers.map((w) => w.email));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleAddUser = () => {
    router.push("/inventory/workers/add-worker")
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
      <UsersPageHeader onAddUser={handleAddUser} />

      {/* 🔍 Top Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        py={1.5}
        gap={2}
      >
        <TextField
          placeholder="Search workers..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 300 }}
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
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Roles / Positions</MenuItem>
          <MenuItem value="worker">Worker</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="cashier">Cashier</MenuItem>
          <MenuItem value="sales representative">Sales Representative</MenuItem>
          <MenuItem value="stock keeper">Stock Keeper</MenuItem>
        </Select>
      </Box>

      {/* 🧾 Table */}
      <TableContainer>
        <Table size={dense ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < filteredWorkers.length
                  }
                  checked={
                    filteredWorkers.length > 0 &&
                    selected.length === filteredWorkers.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredWorkers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((worker) => (
                <TableRow
                  key={worker.email}
                  hover
                  selected={selected.includes(worker.email)}
                  sx={{
                    "&:hover": { backgroundColor: "#f4f6f8" },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(worker.email)}
                      onChange={() => handleSelectRow(worker.email)}
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        alt={worker.firstName}
                        src={`https://ui-avatars.com/api/?name=${worker.firstName}+${worker.lastName}`}
                        sx={{ width: 36, height: 36 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {worker.firstName} {worker.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {worker.nationalId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{worker.email}</TableCell>
                  <TableCell>{worker.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={worker.role}
                      size="small"
                      sx={{
                        backgroundColor:
                          worker.role === "worker" ? "#E0F2FE" : "#E8F5E9",
                        color: worker.role === "worker" ? "#0369A1" : "#2E7D32",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>{worker.position}</TableCell>
                  <TableCell>{worker.department}</TableCell>
                  <TableCell>{worker.address.city}</TableCell>

                  <TableCell align="center">
                    <Tooltip title="Actions">
                      <IconButton size="small">
                        <HiDotsVertical />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ⚙️ Bottom Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}
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
          count={filteredWorkers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </Card>
  );
}
