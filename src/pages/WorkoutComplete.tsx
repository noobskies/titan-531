import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimerIcon from "@mui/icons-material/Timer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useProgram } from "../hooks/useProgram";
import {
  calculateTotalVolume,
  formatDuration,
  detectBasicPRs,
} from "../services/workoutAnalytics";
import type { Workout } from "../types/workout";

export default function WorkoutComplete() {
  const navigate = useNavigate();
  const { currentCycle, updateWorkoutNotes } = useProgram();
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [volume, setVolume] = useState(0);
  const [prs, setPrs] = useState<string[]>([]);

  useEffect(() => {
    // Find the most recently completed workout
    if (currentCycle) {
      let mostRecentWorkout: Workout | null = null;
      let mostRecentDate = 0;

      currentCycle.weeks.forEach((week) => {
        week.forEach((workout) => {
          if (workout.completed && workout.completedAt) {
            const date = new Date(workout.completedAt).getTime();
            if (date > mostRecentDate) {
              mostRecentDate = date;
              mostRecentWorkout = workout;
            }
          }
        });
      });

      if (mostRecentWorkout) {
        // Set workout first
        setCompletedWorkout(mostRecentWorkout);

        // Then set derived state synchronously
        // Note: In React 18+ strict mode this pattern is acceptable inside useEffect
        // for initialization from external data (currentCycle)
        setNotes((mostRecentWorkout as Workout).notes || "");
        setVolume(calculateTotalVolume(mostRecentWorkout));
        setPrs(detectBasicPRs(mostRecentWorkout));
      } else {
        // No completed workout found, redirect home
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [currentCycle, navigate]);

  const handleFinish = () => {
    if (completedWorkout && notes) {
      updateWorkoutNotes(completedWorkout.id, notes);
    }
    navigate("/");
  };

  if (!completedWorkout) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
      <Container maxWidth="sm">
        <Stack spacing={3} py={4}>
          {/* Header */}
          <Stack alignItems="center" spacing={1}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h4" align="center" fontWeight="bold">
              Workout Complete!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {completedWorkout.name}
            </Typography>
          </Stack>

          {/* Stats Cards */}
          <Stack direction="row" spacing={2}>
            <Paper sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <TimerIcon color="primary" />
              <Typography variant="h6">
                {formatDuration(completedWorkout.duration || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <FitnessCenterIcon color="primary" />
              <Typography variant="h6">
                {Math.round(volume).toLocaleString()} lbs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Volume
              </Typography>
            </Paper>
          </Stack>

          {/* PRs Section */}
          {prs.length > 0 && (
            <Paper
              sx={{
                p: 2,
                bgcolor: "warning.light",
                color: "warning.contrastText",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <EmojiEventsIcon />
                <Typography variant="h6">Personal Records!</Typography>
              </Stack>
              <List dense disablePadding>
                {prs.map((pr, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText primary={pr} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Exercise Summary */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <List disablePadding>
              {completedWorkout.exercises.map((exercise, index) => (
                <div key={exercise.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={exercise.name}
                      secondary={`${
                        exercise.sets.filter((s) => s.completed).length
                      } / ${exercise.sets.length} sets completed`}
                    />
                    {exercise.sets.every((s) => s.completed) && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </ListItem>
                </div>
              ))}
            </List>
          </Paper>

          {/* Notes */}
          <TextField
            label="Workout Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            placeholder="How did the workout feel? Any pain or achievements?"
          />

          {/* Finish Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleFinish}
            sx={{ height: 56 }}
          >
            Finish & Return Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
