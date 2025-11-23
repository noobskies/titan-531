export type LiftType = "Squat" | "Bench" | "Deadlift" | "Press";

export type WeightUnit = "lbs" | "kg";

export interface TrainingMax {
  id: string;
  lift: LiftType;
  weight: number;
  unit: WeightUnit;
  date: string; // ISO date string
}

export type ExerciseType = "Main" | "Supplemental" | "Assistance" | "Warmup";

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  actualReps?: number;
  isAmrap?: boolean;
  rpe?: number;
}

export interface Exercise {
  id: string;
  name: string;
  lift?: LiftType; // If it's a main lift variation
  type: ExerciseType;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string; // e.g., "Week 1: Squat"
  week: number;
  day: number;
  mainLift: LiftType;
  exercises: Exercise[];
  completed: boolean;
  completedAt?: string;
  duration?: number; // seconds
  notes?: string;
}

export interface Cycle {
  id: string;
  programId: string;
  startDate: string;
  endDate?: string;
  weeks: Workout[][]; // Organized by week number (index 0 = week 1)
  isActive: boolean;
  trainingMaxes: TrainingMax[]; // Snapshot of TMs used for this cycle
}

export type ProgramId = "original-531" | "bbb" | "fsl" | "triumvirate";

export interface Program {
  id: ProgramId;
  name: string;
  description: string;
  weeks: number;
  daysPerWeek: number;
}
