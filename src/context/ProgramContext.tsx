import React, { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  TrainingMax,
  Cycle,
  Workout,
  LiftType,
  WeightUnit,
} from "../types/workout";
import { generateCycle } from "../services/programGenerator";
import { syncService } from "../services/syncService";

interface ProgramContextType {
  trainingMaxes: TrainingMax[];
  currentCycle: Cycle | null;
  activeWorkout: Workout | null;
  loading: boolean;

  // Actions
  updateTM: (lift: LiftType, weight: number, unit?: WeightUnit) => void;
  startNewCycle: (programId: string, startDate?: string) => void;
  setActiveWorkout: (workout: Workout | null) => void;
  updateSet: (
    workoutId: string,
    exerciseId: string,
    setId: string,
    actualReps: number,
    weight: number
  ) => void;
  updateWorkoutNotes: (workoutId: string, notes: string) => void;
  completeWorkout: (workout: Workout) => void;
  resetProgram: () => void;
}

export const ProgramContext = createContext<ProgramContextType | undefined>(
  undefined
);

// Local Storage Keys
const STORAGE_KEYS = {
  TRAINING_MAXES: "titan531_training_maxes",
  CURRENT_CYCLE: "titan531_current_cycle",
};

export function ProgramProvider({ children }: { children: React.ReactNode }) {
  const [trainingMaxes, setTrainingMaxes] = useState<TrainingMax[]>([]);
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from local storage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTMs = localStorage.getItem(STORAGE_KEYS.TRAINING_MAXES);
        const storedCycle = localStorage.getItem(STORAGE_KEYS.CURRENT_CYCLE);

        if (storedTMs) {
          setTrainingMaxes(JSON.parse(storedTMs));
        }

        if (storedCycle) {
          setCurrentCycle(JSON.parse(storedCycle));
        }
      } catch (error) {
        console.error("Error loading program data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Persist TMs when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(
        STORAGE_KEYS.TRAINING_MAXES,
        JSON.stringify(trainingMaxes)
      );

      // Trigger sync for updated TMs
      trainingMaxes.forEach((tm) => syncService.syncTrainingMax(tm));
    }
  }, [trainingMaxes, loading]);

  // Persist Cycle when it changes
  useEffect(() => {
    if (!loading) {
      if (currentCycle) {
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_CYCLE,
          JSON.stringify(currentCycle)
        );

        // Trigger sync for updated Cycle
        syncService.syncCycle(currentCycle);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CYCLE);
      }
    }
  }, [currentCycle, loading]);

  // Initial cloud sync on load
  useEffect(() => {
    if (!loading) {
      const performCloudSync = async () => {
        const cloudData = await syncService.pullFromCloud();
        if (cloudData) {
          // Merge strategy:
          // For TMs: Use cloud data if it exists (cloud is source of truth for premium)
          // For Cycles: MVP implementation doesn't merge cycles yet
          if (cloudData.trainingMaxes.length > 0) {
            setTrainingMaxes(cloudData.trainingMaxes);
          }
        }
      };
      performCloudSync();
    }
  }, [loading]);

  const updateTM = (
    lift: LiftType,
    weight: number,
    unit: WeightUnit = "lbs"
  ) => {
    setTrainingMaxes((prev) => {
      const existingIndex = prev.findIndex((tm) => tm.lift === lift);
      const newTM: TrainingMax = {
        id: existingIndex >= 0 ? prev[existingIndex].id : uuidv4(),
        lift,
        weight,
        unit,
        date: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const newTMs = [...prev];
        newTMs[existingIndex] = newTM;
        return newTMs;
      } else {
        return [...prev, newTM];
      }
    });
  };

  const startNewCycle = (
    programId: string,
    startDate: string = new Date().toISOString()
  ) => {
    // Ensure we have TMs for all lifts before starting
    const requiredLifts: LiftType[] = ["Squat", "Bench", "Deadlift", "Press"];
    const missingLifts = requiredLifts.filter(
      (lift) => !trainingMaxes.find((tm) => tm.lift === lift)
    );

    if (missingLifts.length > 0) {
      console.warn(
        `Cannot start cycle. Missing TMs for: ${missingLifts.join(", ")}`
      );
      // In a real app, we might throw an error or handle this more gracefully
      // But for now, we'll let the generator handle it (it skips missing TMs)
    }

    const newCycle = generateCycle(programId, trainingMaxes, startDate);
    setCurrentCycle(newCycle);
    syncService.syncCycle(newCycle);
  };

  const updateSet = (
    workoutId: string,
    exerciseId: string,
    setId: string,
    actualReps: number,
    weight: number
  ) => {
    if (!activeWorkout || activeWorkout.id !== workoutId) return;

    // Create deep copy of active workout
    const updatedWorkout = { ...activeWorkout };

    // Find exercise
    const exercise = updatedWorkout.exercises.find(
      (ex) => ex.id === exerciseId
    );
    if (!exercise) return;

    // Find set
    const set = exercise.sets.find((s) => s.id === setId);
    if (!set) return;

    // Update set data
    set.completed = true;
    set.actualReps = actualReps;
    set.weight = weight;

    // Update state
    setActiveWorkout(updatedWorkout);

    // Also persist to currentCycle for redundancy/safety
    if (currentCycle) {
      const updatedCycle = { ...currentCycle };
      const weekIndex = updatedWorkout.week - 1;

      if (updatedCycle.weeks[weekIndex]) {
        const workoutIndex = updatedCycle.weeks[weekIndex].findIndex(
          (w) => w.id === workoutId
        );

        if (workoutIndex >= 0) {
          // Replace entire workout with updated one
          updatedCycle.weeks[weekIndex][workoutIndex] = updatedWorkout;
          setCurrentCycle(updatedCycle);
          // Don't sync on every set update to avoid spamming network
          // We rely on completeWorkout for final sync
        }
      }
    }
  };

  const updateWorkoutNotes = (workoutId: string, notes: string) => {
    if (activeWorkout && activeWorkout.id === workoutId) {
      const updatedWorkout = { ...activeWorkout, notes };
      setActiveWorkout(updatedWorkout);
    }
  };

  const completeWorkout = (workout: Workout) => {
    if (!currentCycle) return;

    // Update the workout in the current cycle
    const updatedCycle = { ...currentCycle };

    // Find and update the specific workout
    // Note: This is a deep update, simplifying for readability
    const weekIndex = workout.week - 1;
    if (updatedCycle.weeks[weekIndex]) {
      const workoutIndex = updatedCycle.weeks[weekIndex].findIndex(
        (w) => w.id === workout.id
      );
      if (workoutIndex >= 0) {
        const completedWorkout = {
          ...workout,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        updatedCycle.weeks[weekIndex][workoutIndex] = completedWorkout;
        setCurrentCycle(updatedCycle);

        // Sync the completed workout
        if (currentCycle.id) {
          syncService.syncWorkout(completedWorkout, currentCycle.id);
        }
      }
    }

    setActiveWorkout(null);
  };

  const resetProgram = () => {
    setTrainingMaxes([]);
    setCurrentCycle(null);
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEYS.TRAINING_MAXES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CYCLE);
  };

  return (
    <ProgramContext.Provider
      value={{
        trainingMaxes,
        currentCycle,
        activeWorkout,
        loading,
        updateTM,
        startNewCycle,
        setActiveWorkout,
        updateSet,
        updateWorkoutNotes,
        completeWorkout,
        resetProgram,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}
