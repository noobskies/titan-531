import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Chip,
  LinearProgress,
  Stack,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";

export default function Home() {
  const { currentCycle, activeWorkout } = useProgram();
  const navigate = useNavigate();

  // If no cycle, show onboarding prompt (or redirect)
  if (!currentCycle) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          No Active Program
        </Typography>
        <Typography paragraph color="text.secondary">
          You don't have an active training cycle set up yet.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/onboarding")}
        >
          Start Onboarding
        </Button>
      </Container>
    );
  }

  // Find next workout
  // In a real implementation, we'd search for the first incomplete workout
  const nextWorkout = currentCycle.weeks.flat().find((w) => !w.completed);

  // Calculate cycle progress
  const totalWorkouts = currentCycle.weeks.flat().length;
  const completedWorkouts = currentCycle.weeks
    .flat()
    .filter((w) => w.completed).length;
  const progress = (completedWorkouts / totalWorkouts) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Dashboard
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Original 5/3/1" color="primary" variant="outlined" />
          <Typography variant="body2" color="text.secondary">
            Cycle 1
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Next Workout Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              height: "100%",
              backgroundImage:
                "linear-gradient(45deg, #1a237e 30%, #283593 90%)",
              color: "white",
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8 }}>
                {activeWorkout ? "IN PROGRESS" : "UP NEXT"}
              </Typography>

              {nextWorkout ? (
                <>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                    {nextWorkout.mainLift}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
                    Week {nextWorkout.week} • Day {nextWorkout.day}
                  </Typography>

                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      sx={{ height: 64, fontSize: "1.25rem" }}
                      onClick={() => {
                        if (activeWorkout) {
                          navigate("/workout/active");
                        } else {
                          navigate(`/workout/pre/${nextWorkout.id}`);
                        }
                      }}
                    >
                      {activeWorkout ? "Resume Workout" : "Start Workout"}
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: "center", my: "auto" }}>
                  <Typography variant="h5">Cycle Complete! 🎉</Typography>
                  <Button variant="outlined" color="inherit" sx={{ mt: 2 }}>
                    Review Cycle
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cycle Progress
              </Typography>
              <Box sx={{ my: 3, textAlign: "center" }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  {/* Circular progress placeholder - using linear for now */}
                  <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {completedWorkouts} of {totalWorkouts} workouts completed
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Training Maxes Summary */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Training Maxes
              </Typography>
              <Grid container spacing={2}>
                {["Squat", "Bench", "Deadlift", "Press"].map((lift) => {
                  const tm = currentCycle.trainingMaxes.find(
                    (t) => t.lift === lift
                  );
                  return (
                    <Grid size={{ xs: 6, sm: 3 }} key={lift}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: "center",
                          bgcolor: "action.hover",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {lift}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {tm ? `${tm.weight} ${tm.unit}` : "-"}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
