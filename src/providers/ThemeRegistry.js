"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";

// Only light palette
const lightPalette = {
  mode: "light",
  primary: { main: "#ff782d" },
  secondary: { main: "#081422" },
  background: { default: "#ffffff", paper: "#ffffff" },
  text: { primary: "#081422", secondary: "#6b7280" },
  divider: "rgba(0, 0, 0, 0.12)",
  grey: { 300: "#d1d5db", 500: "#6b7280" },
};

export default function ThemeRegistry({ children }) {
  const theme = createTheme({
    palette: lightPalette,
    typography: {
      fontFamily: '"Metropolis", "Inter", sans-serif',
      fontSize: 14,
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Metropolis, sans-serif",
            textTransform: "none",
            borderRadius: "16px",
            fontWeight: 600,
            transition: "all 0.2s ease",
            color: lightPalette.text.primary,
            "&:hover": { transform: "translateY(-1px)" },
          },
          contained: {
            backgroundColor: lightPalette.primary.main,
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(255, 120, 45, 0.2)",
            "&:hover": {
              opacity: 0.9,
              backgroundColor: `${lightPalette.primary.main}dd`,
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(255, 120, 45, 0.3)",
            },
          },
          outlined: {
            borderColor: lightPalette.primary.main,
            color: lightPalette.primary.main,
            "&:hover": {
              borderColor: `${lightPalette.primary.main}dd`,
              backgroundColor: "rgba(255, 120, 45, 0.05)",
            },
          },
          text: {
            color: lightPalette.primary.main,
            "&:hover": {
              backgroundColor: "rgba(255, 120, 45, 0.08)",
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            backgroundColor: "white",
            color: lightPalette.text.primary,
            "& fieldset": {
              borderColor: lightPalette.grey[300],
              borderWidth: 2,
            },
            "&:hover fieldset": {
              borderColor: lightPalette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: lightPalette.primary.main,
              boxShadow: `0 0 0 3px rgba(255, 120, 45, 0.15)`,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            color: lightPalette.text.secondary,
            "&.Mui-focused": {
              color: lightPalette.primary.main,
              fontWeight: 600,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "20px !important",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
            border: `1px solid rgba(255, 120, 45, 0.15)`,
            backgroundColor: lightPalette.background.paper,
            overflow: "hidden",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            margin: "4px 8px",
            color: lightPalette.text.primary,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 120, 45, 0.08)",
              transform: "translateX(4px)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(255, 120, 45, 0.15)",
              "&:hover": { backgroundColor: "rgba(255, 120, 45, 0.2)" },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            fontFamily: "Metropolis, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            padding: "10px 40px 10px 16px !important", // Increase right padding
            borderRadius: "16px",
            backgroundColor: "#fff8f5",
            border: `2px solid #ffede0`,
            color: lightPalette.text.primary,
            "&:focus": {
              backgroundColor: "#fff8f5",
              borderColor: lightPalette.primary.main,
              boxShadow: "0 0 0 3px rgba(255, 120, 45, 0.2)",
            },
          },
          icon: {
            color: lightPalette.primary.main,
            fontSize: "20px",
            right: "10px", // adjust distance from the right edge
          },
        },
      },

      MuiInput: {
        styleOverrides: {
          underline: {
            "&:before": { display: "none" },
            "&:after": { display: "none" },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { margin: "8px 16px", backgroundColor: lightPalette.divider },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: "36px", color: lightPalette.text.primary },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            // Keep snackbar area visually elevated but subtle
            zIndex: 1400,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          standardSuccess: {
            backgroundColor: "#ecfdf5",
            color: "#065f46",
            border: `1px solid rgba(16,185,129,0.12)`,
          },
          standardError: {
            backgroundColor: "#fff1f2",
            color: "#991b1b",
            border: `1px solid rgba(220,38,38,0.08)`,
          },
          root: {
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(2,6,23,0.08)",
            fontFamily: "Metropolis, sans-serif",
            fontWeight: 600,
          },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
