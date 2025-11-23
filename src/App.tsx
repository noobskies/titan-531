import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import PreWorkout from "./pages/PreWorkout";
import ActiveWorkout from "./pages/ActiveWorkout";
import WorkoutComplete from "./pages/WorkoutComplete";
import Analytics from "./pages/Analytics";

function App() {
  return (
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
          path="/workout/:workoutId/preview"
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
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
