"use client";

import { Calendar } from "lucide-react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export default function DateRangeInput({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1,
        alignItems: { xs: "flex-start", sm: "center" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Calendar
          style={{ height: 22, width: 22, color: "#ff782d", marginRight: 2 }}
        />
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            fontFamily: "Metropolis, Inter, sans-serif",
            fontSize: 14,
            minWidth: 160,
            background: "#fff8f5",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(255,120,45,0.07)",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              fontFamily: "Metropolis, Inter, sans-serif",
              fontSize: 14,
              background: "#fff8f5",
              color: "#081422",
              paddingRight: "0px",
              "& fieldset": {
                borderColor: "#ff782d33",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "#ff782d",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ff782d",
                boxShadow: "0 0 0 3px rgba(255, 120, 45, 0.15)",
              },
            },
            "& .MuiInputBase-input": {
              fontFamily: "Metropolis, Inter, sans-serif",
              fontSize: 14,
              padding: "12px 18px",
              letterSpacing: "0.01em",
            },
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              filter:
                "invert(44%) sepia(98%) saturate(749%) hue-rotate(345deg) brightness(97%) contrast(101%)",
              cursor: "pointer",
            },
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <span
        style={{
          color: "#6b7280",
          fontWeight: 500,
          fontSize: 15,
          margin: "0 18px",
        }}
      >
        to
      </span>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            fontFamily: "Metropolis, Inter, sans-serif",
            fontSize: 14,
            minWidth: 160,
            background: "#fff8f5",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(255,120,45,0.07)",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              fontFamily: "Metropolis, Inter, sans-serif",
              fontSize: 14,
              background: "#fff8f5",
              color: "#081422",
              paddingRight: "0px",
              "& fieldset": {
                borderColor: "#ff782d33",
                borderWidth: 2,
              },
              "&:hover fieldset": {
                borderColor: "#ff782d",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ff782d",
                boxShadow: "0 0 0 3px rgba(255, 120, 45, 0.15)",
              },
            },
            "& .MuiInputBase-input": {
              fontFamily: "Metropolis, Inter, sans-serif",
              fontSize: 14,
              padding: "12px 18px",
              letterSpacing: "0.01em",
            },
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              filter:
                "invert(44%) sepia(98%) saturate(749%) hue-rotate(345deg) brightness(97%) contrast(101%)",
              cursor: "pointer",
            },
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Box>
  );
}
