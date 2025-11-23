import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useProgram } from "../hooks/useProgram";
import { WORKOUT_UI_CONSTANTS } from "../constants/workout";
import type { Exercise } from "../types/workout";

// Helper component for exercise item
function ExercisePreviewItem({ exercise }: { exercise: Exercise }) {
  const setDetails = useMemo(() => {
    if (exercise.sets.length === 0) return "No sets";

    // Group similar sets for display (e.g., "3 sets of 5 reps @ 135 lbs")
    // For 5/3/1, sets often vary, so we might just show range or main work
    const mainSets = exercise.sets.filter((s) => !s.isWarmup);

    if (mainSets.length > 0) {
      const topSet = mainSets[mainSets.length - 1];
      return `${exercise.sets.length} sets total • Top set: ${topSet.reps}${
        topSet.isAmrap ? "+" : ""
      } @ ${topSet.weight} lbs`;
    }

    return `${exercise.sets.length} sets`;
  }, [exercise]);

  return (
    <ListItem divider disablePadding sx={{ py: 2 }}>
      <ListItemText
        primary={
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {exercise.name}
          </Typography>
        }
        secondary={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.5 }}
          >
            <Chip
              label={exercise.type}
              size="small"
              color={exercise.type === "Main" ? "primary" : "default"}
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {setDetails}
            </Typography>
          </Stack>
        }
      />
    </ListItem>
  );
}

export default function PreWorkout() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { currentCycle, setActiveWorkout } = useProgram();

  // Find the workout
  const workout = useMemo(() => {
    if (!currentCycle || !workoutId) return null;

    // Search through all weeks
    for (const week of currentCycle.weeks) {
      const found = week.find((w) => w.id === workoutId);
      if (found) return found;
    }
    return null;
  }, [currentCycle, workoutId]);

  // Redirect if invalid
  useEffect(() => {
    if (!workout && currentCycle) {
      navigate("/");
    }
  }, [workout, currentCycle, navigate]);

  if (!workout) return null;

  const handleStartWorkout = () => {
    setActiveWorkout(workout);
    navigate("/workout/active");
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          color="inherit"
        >
          Back
        </Button>
      </Stack>

      <Typography variant="overline" color="text.secondary">
        PRE-WORKOUT OVERVIEW
      </Typography>

      <Typography
        variant="h3"
        component="h1"
        sx={{ fontWeight: "bold", mb: 1 }}
      >
        {workout.name}
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Week {workout.week} • Day {workout.day}
      </Typography>

      {/* Main Actions Card */}
      <Card sx={{ mb: 4, bgcolor: "primary.dark", color: "white" }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                MAIN LIFT
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {workout.mainLift}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                ESTIMATED DURATION
              </Typography>
              <Typography variant="h6">45-60 Minutes</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Workout Plan
      </Typography>

      <Card sx={{ mb: 4 }}>
        <List sx={{ py: 0 }}>
          {workout.exercises.map((exercise) => (
            <ExercisePreviewItem key={exercise.id} exercise={exercise} />
          ))}
        </List>
      </Card>

      {/* Fixed Bottom Action Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1000,
        }}
      >
        <Container maxWidth="md">
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={handleStartWorkout}
            sx={{
              height: WORKOUT_UI_CONSTANTS.BUTTON_HEIGHT,
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Begin Workout
          </Button>
        </Container>
      </Box>
    </Container>
  );
}
