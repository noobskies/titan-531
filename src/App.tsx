import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { ProgramProvider } from "./context/ProgramContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import PreWorkout from "./pages/PreWorkout";
import ActiveWorkout from "./pages/ActiveWorkout";
import WorkoutComplete from "./pages/WorkoutComplete";
import RequireAuth from "./components/RequireAuth";

const theme = createAppTheme("dark");

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProgramProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <RequireAuth>
                      <Onboarding />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/workout/pre/:workoutId"
                  element={
                    <RequireAuth>
                      <PreWorkout />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/workout/active"
                  element={
                    <RequireAuth>
                      <ActiveWorkout />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/workout/complete"
                  element={
                    <RequireAuth>
                      <WorkoutComplete />
                    </RequireAuth>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ProgramProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
