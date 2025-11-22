
import { LiftType, ThemeColor } from './common';
import { ProgramType, TimerSettings, AssistanceSettings, WarmupSetSetting, ExerciseInfo } from './workout';

export interface BodyMetricLog {
  date: string;
  weight: number;
}

export type BodyMetric = 'weight' | 'chest' | 'waist' | 'arms' | 'thighs';

export interface MeasurementLog {
  date: string;
  value: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  dataUrl: string; // Base64 string
  notes?: string;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: number;
  macros: Macros;
  photoUrl?: string;
}

export interface NutritionLog {
    [date: string]: Meal[];
}

export interface NutritionTargets {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface UserProfile {
  id: string; // Unique ID for profile management
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  bodyWeight: number;
  bodyWeightHistory: BodyMetricLog[]; // Keep for backward compat, but prefer measurements.weight
  measurements?: Record<BodyMetric, MeasurementLog[]>; // New generic structure
  progressPhotos?: ProgressPhoto[];
  unit: 'lbs' | 'kg';
  rounding: number; // e.g., 2.5, 5
  trainingMaxes: Record<LiftType, number>;
  oneRepMaxes: Record<LiftType, number>;
  currentCycle: number;
  currentWeek: 1 | 2 | 3 | 4; // 4 is deload
  selectedProgram: ProgramType;
  progressionScheme: 'Standard' | 'Performance';
  theme: 'dark' | 'light';
  themeColor: ThemeColor;
  onboardingComplete: boolean;
  
  defaultRestTimer: number; // Deprecated in favor of timerSettings
  timerSettings: TimerSettings;
  assistanceSettings: AssistanceSettings;
  warmupSettings?: WarmupSetSetting[]; // New custom warmups
  liftOrder?: LiftType[]; // New custom lift order

  customAssistance: Record<LiftType, string[]>;
  achievements: string[];
  isPremium: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean; // New: Text-to-Speech cues
  notificationsEnabled: boolean;
  language: 'en' | 'es' | 'fr';
  
  // Schedule & Equipment
  trainingDays: number[]; // 0=Sun, 1=Mon, ...
  customBarWeight?: number;
  plateInventory?: Record<number, number>; // New: Custom plate counts

  // Coach / Pro Features
  isCoach: boolean;
  clients: UserProfile[]; // List of managed profiles
  
  // Customizations
  customPercentages?: Record<number, number[]>; // Custom % for main lifts by week
  customReps?: Record<number, number[]>; // Custom reps for main lifts by week
  customExercises: ExerciseInfo[]; // User-defined exercises

  // Nutrition
  nutritionLog?: NutritionLog;
  nutritionTargets?: NutritionTargets;
}
