import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  IconButton,
  TextField,
  Stack,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { WorkoutSet } from "../../types/workout";
import { WORKOUT_UI_CONSTANTS } from "../../constants/workout";

interface SetLoggerProps {
  set: WorkoutSet;
  onLog: (reps: number, weight: number) => void;
  isAmrap?: boolean;
}

export function SetLogger({ set, onLog, isAmrap }: SetLoggerProps) {
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weight);

  // Reset local state when set changes
  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
  }, [set]);

  const handleLog = () => {
    onLog(reps, weight);
  };

  const adjustReps = (amount: number) => {
    setReps((prev) => Math.max(0, prev + amount));
  };

  const adjustWeight = (amount: number) => {
    setWeight((prev) => Math.max(0, prev + amount));
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Target Display */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: isAmrap ? "warning.dark" : "action.hover",
          color: isAmrap ? "warning.contrastText" : "inherit",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          TARGET
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          {set.reps}
          {isAmrap ? "+" : ""} × {set.weight}
          <Typography component="span" variant="h5" sx={{ opacity: 0.7 }}>
            lbs
          </Typography>
        </Typography>
        {isAmrap && (
          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: "bold" }}>
            AMRAP SET - GO FOR A PR!
          </Typography>
        )}
      </Paper>

      {/* Inputs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Weight Control */}
        <Grid size={{ xs: 6 }}>
          <Typography align="center" variant="subtitle2" gutterBottom>
            WEIGHT
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => adjustWeight(-5)} color="primary">
              <RemoveIcon />
            </IconButton>
            <TextField
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              type="number"
              inputProps={{
                style: { textAlign: "center", fontSize: "1.25rem" },
              }}
              variant="standard"
              fullWidth
            />
            <IconButton onClick={() => adjustWeight(5)} color="primary">
              <AddIcon />
            </IconButton>
          </Stack>
        </Grid>

        {/* Reps Control */}
        <Grid size={{ xs: 6 }}>
          <Typography align="center" variant="subtitle2" gutterBottom>
            REPS
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => adjustReps(-1)} color="primary">
              <RemoveIcon />
            </IconButton>
            <TextField
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              type="number"
              inputProps={{
                style: { textAlign: "center", fontSize: "1.25rem" },
              }}
              variant="standard"
              fullWidth
            />
            <IconButton onClick={() => adjustReps(1)} color="primary">
              <AddIcon />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Quick Action Buttons */}
      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLog}
          startIcon={<CheckCircleIcon />}
          sx={{
            height: WORKOUT_UI_CONSTANTS.BUTTON_HEIGHT,
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {isAmrap ? "LOG AMRAP SET" : `LOG ${reps} REPS`}
        </Button>

        {!isAmrap && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => {
                  setReps(set.reps + 1);
                }}
              >
                +1 Rep
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => {
                  setReps(set.reps - 1);
                }}
              >
                -1 Rep
              </Button>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
