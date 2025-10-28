"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#081422", // dark navy (default)
    },
    secondary: {
      main: "#ff782d", // orange accent
    },
  },

  typography: {
    fontFamily: "Metropolis, sans-serif",
    fontSize: 14,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
          textTransform: "none",
          borderRadius: "12px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            opacity: 0.9,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          fontFamily: "Metropolis, sans-serif",
          fontSize: "14px",
          "& fieldset": {
            borderColor: "#d1d5db", // gray-300 default
          },
          "&:hover fieldset": {
            borderColor: "#ff782d", // orange hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "#ff782d", // orange focus
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
          fontSize: "14px",
          color: "#6b7280", // gray-500
          "&.Mui-focused": {
            color: "#ff782d",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#6b7280", // default gray
          "&.Mui-checked": {
            color: "#ff782d", // selected orange
          },
        },
      },
    },

    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Metropolis, sans-serif",
        },
      },
    },
  },
});

export function ThemeRegistry({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
