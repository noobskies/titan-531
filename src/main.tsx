import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { ProgramProvider } from "./context/ProgramContext";
import App from "./App";
import "./index.css";

const theme = createAppTheme("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ProgramProvider>
            <App />
          </ProgramProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
