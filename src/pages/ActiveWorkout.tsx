import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useProgram } from "../hooks/useProgram";
import { SetLogger } from "../components/workout/SetLogger";
import { RestTimer } from "../components/workout/RestTimer";
import { useRestTimer } from "../hooks/useRestTimer";
import { WORKOUT_CONSTANTS } from "../constants/workout";
// import type { WorkoutSet } from "../types/workout";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { activeWorkout, completeWorkout } = useProgram();

  // State
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer
  const restTimer = useRestTimer(WORKOUT_CONSTANTS.REST_TIMER_MAIN);

  // Redirect if no active workout
  useEffect(() => {
    if (!activeWorkout) {
      navigate("/");
    }
  }, [activeWorkout, navigate]);

  if (!activeWorkout) return null;

  const currentExercise = activeWorkout.exercises[exerciseIndex];
  const currentSet = currentExercise.sets[setIndex];

  // Calculate total progress
  const totalSets = activeWorkout.exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );
  const completedSetsCount =
    activeWorkout.exercises
      .slice(0, exerciseIndex)
      .reduce((acc, ex) => acc + ex.sets.length, 0) + setIndex;

  const progress = (completedSetsCount / totalSets) * 100;

  const handleLogSet = (reps: number, weight: number) => {
    console.log("Logging set:", { reps, weight });
    // 1. Update set data (in a real app, we'd update context here)
    /*
    const updatedSet: WorkoutSet = {
      ...currentSet,
      completed: true,
      actualReps: reps,
      weight: weight,
    };
    */

    // Note: We need a way to update the specific set in context
    // For MVP, we'll assume context updates happen via completeWorkout or we add a helper
    // Since we don't have updateSet in context yet, we'll modify activeWorkout locally
    // This assumes activeWorkout is mutable or we update it.
    // Ideally, we add updateSet to ProgramContext.
    // For now, let's proceed with flow logic.

    // 2. Start Rest Timer
    let restTime: number = WORKOUT_CONSTANTS.REST_TIMER_ASSISTANCE;
    if (currentExercise.type === "Main")
      restTime = WORKOUT_CONSTANTS.REST_TIMER_MAIN;
    else if (currentExercise.type === "Supplemental")
      restTime = WORKOUT_CONSTANTS.REST_TIMER_SUPPLEMENTAL;

    restTimer.start(restTime);
    setIsResting(true);
  };

  const handleNext = () => {
    setIsResting(false);
    restTimer.reset();

    // Check if more sets in current exercise
    if (setIndex < currentExercise.sets.length - 1) {
      setSetIndex(setIndex + 1);
    } else {
      // Check if more exercises
      if (exerciseIndex < activeWorkout.exercises.length - 1) {
        setExerciseIndex(exerciseIndex + 1);
        setSetIndex(0);
      } else {
        // Workout Complete!
        handleFinishWorkout();
      }
    }
  };

  const handleFinishWorkout = () => {
    completeWorkout(activeWorkout);
    navigate("/"); // In Phase 2b completion, we'll go to summary
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => setShowExitConfirm(true)}>
          <CloseIcon />
        </IconButton>
        <Stack alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {activeWorkout.name}
          </Typography>
          <Typography variant="h6" sx={{ lineHeight: 1 }}>
            {currentExercise.name}
          </Typography>
        </Stack>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 4 }}
      />

      {/* Main Content */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        {isResting ? (
          <RestTimer
            remaining={restTimer.remaining}
            totalDuration={WORKOUT_CONSTANTS.REST_TIMER_MAIN} // Should pass actual duration
            isRunning={restTimer.isRunning}
            onPause={restTimer.pause}
            onResume={restTimer.resume}
            onReset={restTimer.reset}
            onAddTime={restTimer.addTime}
            onSkip={handleNext}
          />
        ) : (
          <>
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              gutterBottom
            >
              SET {setIndex + 1} OF {currentExercise.sets.length}
            </Typography>

            <SetLogger
              set={currentSet}
              onLog={handleLogSet}
              isAmrap={currentSet.isAmrap}
            />
          </>
        )}
      </Container>

      {/* Exit Dialog */}
      <Dialog open={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
        <DialogTitle>End Workout?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end this workout? Progress will be saved up
            to this point.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitConfirm(false)}>Resume</Button>
          <Button
            onClick={() => {
              setShowExitConfirm(false);
              navigate("/");
            }}
            color="error"
          >
            End Workout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
