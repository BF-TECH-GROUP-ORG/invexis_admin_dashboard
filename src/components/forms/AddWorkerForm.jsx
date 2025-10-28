"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Divider,
  Typography,
  CircularProgress,
} from "@mui/material";
import { HiArrowRight } from "react-icons/hi2";
import { ThemeRegistry } from "@/providers/ThemeRegistry";

const positions = [
  "Sales Representative",
  "Cashier",
  "Manager",
  "Stock Keeper",
];

const departments = ["sales", "finance", "logistics", "hr"];

const genders = ["male", "female", "other"];

export default function AddWorkerForm({ onSubmit }) {
  const [worker, setWorker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "worker",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    position: "",
    department: "",
    companies: [],
    shops: [],
    emergencyContact: { name: "", phone: "" },
    address: { street: "", city: "", state: "", postalCode: "", country: "" },
    preferences: {
      language: "en",
      notifications: { email: true, sms: true, inApp: true },
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (key, value) => {
    setWorker((prev) => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setWorker((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await onSubmit(worker); // your API call goes here
      setSuccess("Worker added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add worker");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeRegistry>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 600,
          mx: "auto",
          mt: 4,
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Add New Worker
        </Typography>

        {error && (
          <Box bgcolor="#fdecea" color="#d32f2f" p={1} borderRadius={1}>
            {error}
          </Box>
        )}
        {success && (
          <Box bgcolor="#e6f4ea" color="#388e3c" p={1} borderRadius={1}>
            {success}
          </Box>
        )}

        {/* Personal Info */}
        <Divider sx={{ my: 1 }}>Personal Info</Divider>
        <TextField
          label="First Name"
          value={worker.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          required
        />
        <TextField
          label="Last Name"
          value={worker.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={worker.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
        <TextField
          label="Phone"
          value={worker.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={worker.password}
          onChange={(e) => handleChange("password", e.target.value)}
          required
        />
        <TextField
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={worker.dateOfBirth}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
        />
        <TextField
          select
          label="Gender"
          value={worker.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          {genders.map((g) => (
            <MenuItem key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        {/* Job Info */}
        <Divider sx={{ my: 1 }}>Job Info</Divider>
        <TextField
          label="National ID"
          value={worker.nationalId}
          onChange={(e) => handleChange("nationalId", e.target.value)}
        />
        <TextField
          select
          label="Position"
          value={worker.position}
          onChange={(e) => handleChange("position", e.target.value)}
        >
          {positions.map((pos) => (
            <MenuItem key={pos} value={pos}>
              {pos}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Department"
          value={worker.department}
          onChange={(e) => handleChange("department", e.target.value)}
        >
          {departments.map((dep) => (
            <MenuItem key={dep} value={dep}>
              {dep.charAt(0).toUpperCase() + dep.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        {/* Emergency Contact */}
        <Divider sx={{ my: 1 }}>Emergency Contact</Divider>
        <TextField
          label="Emergency Name"
          value={worker.emergencyContact.name}
          onChange={(e) =>
            handleNestedChange("emergencyContact", "name", e.target.value)
          }
        />
        <TextField
          label="Emergency Phone"
          value={worker.emergencyContact.phone}
          onChange={(e) =>
            handleNestedChange("emergencyContact", "phone", e.target.value)
          }
        />

        {/* Address */}
        <Divider sx={{ my: 1 }}>Address</Divider>
        <TextField
          label="Street"
          value={worker.address.street}
          onChange={(e) =>
            handleNestedChange("address", "street", e.target.value)
          }
        />
        <TextField
          label="City"
          value={worker.address.city}
          onChange={(e) =>
            handleNestedChange("address", "city", e.target.value)
          }
        />
        <TextField
          label="State"
          value={worker.address.state}
          onChange={(e) =>
            handleNestedChange("address", "state", e.target.value)
          }
        />
        <TextField
          label="Postal Code"
          value={worker.address.postalCode}
          onChange={(e) =>
            handleNestedChange("address", "postalCode", e.target.value)
          }
        />
        <TextField
          label="Country"
          value={worker.address.country}
          onChange={(e) =>
            handleNestedChange("address", "country", e.target.value)
          }
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          endIcon={<HiArrowRight />}
          disabled={submitting}
          sx={{
            mt: 2,
            backgroundColor: "#081422",
            "&:hover": { backgroundColor: "#0b2036" },
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Add Worker"
          )}
        </Button>
      </Box>
    </ThemeRegistry>
  );
}
