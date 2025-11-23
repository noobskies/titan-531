import type { LiftType } from "./workout";

export interface VolumeDataPoint {
  date: string;
  totalVolume: number;
  lift?: LiftType;
  workoutName: string;
}

export interface E1RMDataPoint {
  date: string;
  estimatedMax: number;
  lift: LiftType;
  actualReps: number;
  weight: number;
}

export interface PersonalRecord {
  id: string;
  date: string;
  lift: LiftType;
  exercise: string;
  recordType: "e1rm" | "repMax" | "volumePR";
  value: number;
  reps?: number;
  weight?: number;
  workoutId?: string;
}

export interface ProgressSummary {
  totalWorkouts: number;
  completedWorkouts: number;
  totalVolume: number;
  averageVolume: number;
  prsAchieved: number;
  currentStreak: number;
  durationMinutes: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export type TimeRangeOption = "30days" | "90days" | "all";
