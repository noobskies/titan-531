import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Gym-optimized palette
const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: {
      main: "#2196f3", // Bright Blue - Energetic
    },
    secondary: {
      main: "#f50057", // Pink/Red - Action
    },
    ...(mode === "dark" && {
      background: {
        default: "#121212",
        paper: "#1e1e1e",
      },
      text: {
        primary: "#ffffff",
        secondary: "rgba(255, 255, 255, 0.7)",
      },
    }),
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none" as const, // Fix for TypeScript error
    },
  },
  components: {
    // Component overrides for large touch targets (Gym-Optimized)
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          fontSize: "1rem",
          borderRadius: "8px",
          minHeight: "48px", // Easy to tap
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            minHeight: "56px", // Larger input area
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: "16px",
          paddingBottom: "16px", // Larger list items
        },
      },
    },
  },
});

export const createAppTheme = (mode: "light" | "dark" = "dark") => {
  let theme = createTheme(getDesignTokens(mode));
  theme = responsiveFontSizes(theme);
  return theme;
};
