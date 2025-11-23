import { v4 as uuidv4 } from "uuid";
import type {
  TrainingMax,
  Cycle,
  Workout,
  Exercise,
  LiftType,
  WeightUnit,
  WorkoutSet,
} from "../types/workout";
import { WORKOUT_CONSTANTS } from "../constants/workout";

// Round weight to nearest increment (e.g., 2.5 or 5)
export const roundWeight = (
  weight: number,
  increment: number = 2.5
): number => {
  return Math.round(weight / increment) * increment;
};

// Calculate Training Max (90% of 1RM)
export const calculateTM = (oneRepMax: number): number => {
  return roundWeight(oneRepMax * 0.9, 2.5); // Default to 2.5 increment
};

// Calculate working weight based on TM and percentage
export const calculateWorkingWeight = (
  tm: number,
  percentage: number,
  roundTo: number = 2.5
): number => {
  return roundWeight(tm * percentage, roundTo);
};

// Generate Warmup Sets
export const generateWarmupSets = (
  workingWeight: number,
  roundTo: number = 2.5
): WorkoutSet[] => {
  return [
    {
      id: uuidv4(),
      setNumber: 1,
      reps: 5,
      weight: roundWeight(workingWeight * 0.4, roundTo),
      completed: false,
    },
    {
      id: uuidv4(),
      setNumber: 2,
      reps: 5,
      weight: roundWeight(workingWeight * 0.5, roundTo),
      completed: false,
    },
    {
      id: uuidv4(),
      setNumber: 3,
      reps: 3,
      weight: roundWeight(workingWeight * 0.6, roundTo),
      completed: false,
    },
  ];
};

// Generate Main Sets for a specific week
export const generateMainSets = (
  tm: number,
  week: number,
  roundTo: number = 2.5
): WorkoutSet[] => {
  const percentages = WORKOUT_CONSTANTS.PERCENTAGES[week - 1]; // week is 1-based
  const reps = WORKOUT_CONSTANTS.REPS[week - 1];

  return percentages.map((percentage, index) => ({
    id: uuidv4(),
    setNumber: index + 1,
    reps: reps[index],
    weight: calculateWorkingWeight(tm, percentage, roundTo),
    completed: false,
    isAmrap: index === 2 && week !== 4, // Last set is AMRAP except deload week
  }));
};

// Generate a full workout for a specific lift and week
export const generateWorkout = (
  tm: TrainingMax,
  week: number,
  day: number,
  programId: string
): Workout => {
  const workoutId = uuidv4();
  const mainLiftName = tm.lift;

  // 1. Warmup Sets (based on first working set weight)
  const firstSetPercentage = WORKOUT_CONSTANTS.PERCENTAGES[week - 1][0];
  const firstWorkingWeight = calculateWorkingWeight(
    tm.weight,
    firstSetPercentage
  );
  const warmupSets = generateWarmupSets(tm.weight); // Use TM for warmup calc base usually, or working weight?
  // Actually standard is based on TM: 40/50/60% of TM
  const standardWarmups = [0.4, 0.5, 0.6].map((p, i) => ({
    id: uuidv4(),
    setNumber: i + 1,
    reps: 5,
    weight: calculateWorkingWeight(tm.weight, p),
    completed: false,
  }));

  // 2. Main Work Sets
  const mainSets = generateMainSets(tm.weight, week);

  // Re-number sets to be continuous
  const allMainSets = [...standardWarmups, ...mainSets].map((set, i) => ({
    ...set,
    setNumber: i + 1,
  }));

  const mainExercise: Exercise = {
    id: uuidv4(),
    name: mainLiftName,
    lift: mainLiftName,
    type: "Main",
    sets: allMainSets,
  };

  // 3. Supplemental/Assistance would be added here based on programId
  // For MVP Phase 2a, we just do main lift

  return {
    id: workoutId,
    name: `Week ${week}: ${mainLiftName}`,
    week,
    day,
    mainLift: mainLiftName,
    exercises: [mainExercise],
    completed: false,
  };
};

// Generate a full 4-week cycle
export const generateCycle = (
  programId: string,
  trainingMaxes: TrainingMax[],
  startDate: string
): Cycle => {
  const cycleId = uuidv4();
  const weeks: Workout[][] = [];

  // Standard 5/3/1 Schedule:
  // Day 1: Squat
  // Day 2: Bench
  // Day 3: Deadlift
  // Day 4: Press
  // Order might vary, but let's stick to this default for now
  const liftOrder: LiftType[] = ["Squat", "Bench", "Deadlift", "Press"];

  for (let week = 1; week <= 4; week++) {
    const weekWorkouts: Workout[] = [];

    liftOrder.forEach((liftName, dayIndex) => {
      const tm = trainingMaxes.find((t) => t.lift === liftName);
      if (tm) {
        weekWorkouts.push(generateWorkout(tm, week, dayIndex + 1, programId));
      }
    });

    weeks.push(weekWorkouts);
  }

  return {
    id: cycleId,
    programId,
    startDate,
    weeks,
    isActive: true,
    trainingMaxes: JSON.parse(JSON.stringify(trainingMaxes)), // Snapshot
  };
};
