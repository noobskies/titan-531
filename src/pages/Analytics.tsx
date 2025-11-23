import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useProgram } from "../hooks/useProgram";
import {
  getE1RMHistory,
  getVolumeHistory,
  getPRHistory,
  getProgressSummary,
} from "../services/workoutAnalytics";
import { E1RMChart } from "../components/analytics/E1RMChart";
import { VolumeChart } from "../components/analytics/VolumeChart";
import { PRHistoryList } from "../components/analytics/PRHistoryList";
import { ProgressCard } from "../components/analytics/ProgressCard";
import type { LiftType } from "../types/workout";

export const Analytics: React.FC = () => {
  const { currentCycle, loading } = useProgram();
  const [selectedLift, setSelectedLift] = useState<LiftType>("Squat");

  const analyticsData = useMemo(() => {
    if (!currentCycle) return null;

    return {
      e1rmHistory: getE1RMHistory(currentCycle, selectedLift),
      volumeHistory: getVolumeHistory(currentCycle),
      prHistory: getPRHistory(currentCycle),
      summary: getProgressSummary(currentCycle),
    };
  }, [currentCycle, selectedLift]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentCycle) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Start a new cycle to see analytics.</Alert>
      </Container>
    );
  }

  if (!analyticsData) return null;

  const handleLiftChange = (
    event: React.SyntheticEvent,
    newValue: LiftType
  ) => {
    setSelectedLift(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Progress Summary */}
        <Grid size={{ xs: 12 }}>
          <ProgressCard summary={analyticsData.summary} />
        </Grid>

        {/* E1RM Chart */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={selectedLift}
              onChange={handleLiftChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Squat" value="Squat" />
              <Tab label="Bench" value="Bench" />
              <Tab label="Deadlift" value="Deadlift" />
              <Tab label="Press" value="Press" />
            </Tabs>
          </Box>
          <E1RMChart data={analyticsData.e1rmHistory} liftName={selectedLift} />
        </Grid>

        {/* Volume Chart */}
        <Grid size={{ xs: 12 }}>
          <VolumeChart data={analyticsData.volumeHistory} />
        </Grid>

        {/* Recent PRs */}
        <Grid size={{ xs: 12 }}>
          <PRHistoryList prs={analyticsData.prHistory} limit={5} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
