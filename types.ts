
export enum LiftType {
  Squat = 'Squat',
  Bench = 'Bench Press',
  Deadlift = 'Deadlift',
  Overhead = 'Overhead Press'
}

export type ProgramType = 'Original' | 'BBB' | 'Beginner' | 'BBS' | 'FSL' | 'Monolith';

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

export interface ExerciseInfo {
  name: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Main' | 'Custom';
  instructions: string;
  videoUrl?: string; 
}

export interface TimerSettings {
  main: number;
  supplemental: number;
  assistance: number;
}

export interface AssistanceSettings {
    sets: number;
    reps: number;
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

// --- Nutrition Types ---
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

export interface SetData {
  reps: number;
  weight: number;
  completed: boolean;
  isAmrap: boolean;
  isWarmup?: boolean; 
  actualReps?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface Exercise {
  id: string;
  name: string;
  type: 'Main' | 'Supplemental' | 'Assistance';
  sets: SetData[];
  completed: boolean;
  videoUrl?: string;
  notes?: string;
}

export interface ConditioningData {
    activity: string;
    distance?: number;
    distanceUnit?: 'mi' | 'km' | 'm';
    durationSeconds: number;
    intensity: 'Easy' | 'Moderate' | 'Hard';
    notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  title: string; // e.g. "Cycle 1 - Week 2 - Squat" or "Morning Run"
  cycle: number; 
  week: number;  
  lift: LiftType | 'Conditioning'; 
  type: 'Strength' | 'Conditioning'; // New discriminator
  exercises: Exercise[]; // Empty for conditioning
  conditioningData?: ConditioningData; // Only for conditioning
  completed: boolean;
  durationSeconds: number;
  notes?: string;
  programType: ProgramType | 'N/A';
  profileId?: string; // Link session to specific profile/client
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  Dashboard = 'Dashboard',
  Workout = 'Workout',
  Conditioning = 'Conditioning', // New View
  Nutrition = 'Nutrition',
  History = 'History',
  Profile = 'Profile',
  AICoach = 'AICoach',
  Tools = 'Tools',
  Settings = 'Settings',
  CoachDashboard = 'CoachDashboard',
  ExerciseManager = 'ExerciseManager'
}
