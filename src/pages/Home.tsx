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
  IconButton,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function Home() {
  const { currentCycle, activeWorkout } = useProgram();
  const navigate = useNavigate();

  // If no cycle, show onboarding prompt (or redirect)
  if (!currentCycle) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <FitnessCenterIcon
          sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Start Your Journey
        </Typography>
        <Typography paragraph color="text.secondary" sx={{ mb: 4 }}>
          You don't have an active training cycle set up yet. Let's get you
          started on the 5/3/1 program.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/onboarding")}
          startIcon={<PlayArrowIcon />}
        >
          Start Onboarding
        </Button>
      </Container>
    );
  }

  // Find next workout
  const nextWorkout = currentCycle.weeks.flat().find((w) => !w.completed);

  // Calculate cycle progress
  const totalWorkouts = currentCycle.weeks.flat().length;
  const completedWorkouts = currentCycle.weeks
    .flat()
    .filter((w) => w.completed).length;
  const progress = (completedWorkouts / totalWorkouts) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Dashboard
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Original 5/3/1"
              color="primary"
              size="small"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              Cycle 1 • Week {nextWorkout?.week || 1}
            </Typography>
          </Stack>
        </Box>
        <IconButton onClick={() => navigate("/settings")}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Next Workout Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                bgcolor: "primary.main",
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 4 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="primary"
                    fontWeight="bold"
                  >
                    {activeWorkout ? "IN PROGRESS" : "UP NEXT"}
                  </Typography>
                  {nextWorkout ? (
                    <>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                        {nextWorkout.mainLift}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          icon={<CalendarTodayIcon />}
                          label={`Week ${nextWorkout.week}`}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                        <Typography variant="body1" color="text.secondary">
                          Day {nextWorkout.day}
                        </Typography>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="h4">Cycle Complete! 🎉</Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    width: 56,
                    height: 56,
                  }}
                >
                  <FitnessCenterIcon fontSize="large" />
                </Avatar>
              </Stack>

              {nextWorkout ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      if (activeWorkout) {
                        navigate("/workout/active");
                      } else {
                        navigate(`/workout/pre/${nextWorkout.id}`);
                      }
                    }}
                    startIcon={<PlayArrowIcon />}
                    sx={{ px: 4 }}
                  >
                    {activeWorkout ? "Resume Workout" : "Start Workout"}
                  </Button>
                  <Button variant="outlined" size="large">
                    View Details
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => navigate("/history")}
                >
                  Review Cycle
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Cycle Progress
                </Typography>
              </Stack>

              <Box sx={{ textAlign: "center", my: 4 }}>
                <Typography variant="h2" fontWeight="bold" color="primary.main">
                  {Math.round(progress)}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {completedWorkouts} of {totalWorkouts} workouts completed
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Training Maxes Summary */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>
            Current Training Maxes
          </Typography>
          <Grid container spacing={2}>
            {["Squat", "Bench", "Deadlift", "Press"].map((lift) => {
              const tm = currentCycle.trainingMaxes.find(
                (t) => t.lift === lift
              );
              return (
                <Grid size={{ xs: 6, sm: 3 }} key={lift}>
                  <Card
                    elevation={1}
                    sx={{
                      transition: "0.2s",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: "center",
                        p: 2,
                        "&:last-child": { pb: 2 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {lift}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {tm ? `${tm.weight}` : "-"}{" "}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {tm?.unit || "lbs"}
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
