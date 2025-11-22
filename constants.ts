
import { LiftType, ProgramType, TimerSettings, AssistanceSettings, ThemeColor } from './types';

export const WEEK_MULTIPLIERS = {
  1: [0.65, 0.75, 0.85], // 5/5/5+
  2: [0.70, 0.80, 0.90], // 3/3/3+
  3: [0.75, 0.85, 0.95], // 5/3/1+
  4: [0.40, 0.50, 0.60], // Deload
};

export const WEEK_REPS = {
  1: [5, 5, 5],
  2: [3, 3, 3],
  3: [5, 3, 1],
  4: [5, 5, 5],
};

export const WARMUP_SETS = [
  { percentage: 0.40, reps: 5 },
  { percentage: 0.50, reps: 5 },
  { percentage: 0.60, reps: 3 },
];

export const DEFAULT_TM: Record<LiftType, number> = {
  [LiftType.Squat]: 225,
  [LiftType.Bench]: 135,
  [LiftType.Deadlift]: 275,
  [LiftType.Overhead]: 95,
};

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
    main: 180,
    supplemental: 120,
    assistance: 90
};

export const DEFAULT_ASSISTANCE_SETTINGS: AssistanceSettings = {
    sets: 3,
    reps: 10
};

export const ROUNDING = 5; // Round to nearest 5lbs

export const PROGRAMS: Record<ProgramType, { name: string; description: string; supplemental: string; isPremium?: boolean }> = {
  'Original': { name: 'Original 5/3/1', description: 'The classic strength program. Minimal volume, high intensity.', supplemental: 'None' },
  'BBB': { name: 'Boring But Big', description: 'High volume for hypertrophy. 5x10 supplemental work.', supplemental: '5x10 @ 50%' },
  'FSL': { name: 'First Set Last', description: 'Great balance of volume and intensity. 5x5 using first set weight.', supplemental: '5x5 @ FSL', isPremium: true },
  'Beginner': { name: 'Beginner Prep', description: 'Full body 3 days a week. High frequency.', supplemental: '5x5 FSL' },
  'BBS': { name: 'Boring But Strong', description: 'Focus on strength and bar speed. 10 sets of 5.', supplemental: '10x5 @ FSL', isPremium: true },
  'Monolith': { name: 'Building the Monolith', description: 'High volume/intensity mass building program.', supplemental: 'Varied', isPremium: true }
};

export const PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const BAR_WEIGHT_LBS = 45;
export const BAR_WEIGHT_KG = 20;

export const DEFAULT_PLATE_INVENTORY_LBS: Record<number, number> = {
    45: 8, 35: 0, 25: 4, 10: 4, 5: 2, 2.5: 2
};

export const DEFAULT_PLATE_INVENTORY_KG: Record<number, number> = {
    25: 8, 20: 2, 15: 2, 10: 4, 5: 2, 2.5: 2, 1.25: 2
};

export const THEME_COLORS: Record<ThemeColor, { primary: string, secondary: string, accent: string, soft: string }> = {
    blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa', soft: 'rgba(59, 130, 246, 0.1)' },
    purple: { primary: '#9333ea', secondary: '#6b21a8', accent: '#c084fc', soft: 'rgba(147, 51, 234, 0.1)' },
    green: { primary: '#10b981', secondary: '#047857', accent: '#34d399', soft: 'rgba(16, 185, 129, 0.1)' },
    orange: { primary: '#f97316', secondary: '#c2410c', accent: '#fb923c', soft: 'rgba(249, 115, 22, 0.1)' },
    red: { primary: '#ef4444', secondary: '#b91c1c', accent: '#f87171', soft: 'rgba(239, 68, 68, 0.1)' },
};

export const CONDITIONING_ACTIVITIES = [
    'Running',
    'Weighted Walk / Ruck',
    'Prowler / Sled',
    'Hill Sprints',
    'Assault Bike',
    'Rowing',
    'Jump Rope',
    'Cycling',
    'Swimming',
    'Walking'
];

// --- Exercise Database ---

export interface ExerciseInfo {
  name: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Main';
  instructions: string;
  videoUrl?: string; // Placeholder for YouTube search query or embed
}

export const EXERCISE_DB: Record<string, ExerciseInfo> = {
  // Main Lifts
  [LiftType.Squat]: {
    name: LiftType.Squat,
    category: 'Main',
    instructions: "Keep chest up, break at hips and knees simultaneously. Go below parallel.",
    videoUrl: "https://www.youtube.com/results?search_query=low+bar+squat+form"
  },
  [LiftType.Bench]: {
    name: LiftType.Bench,
    category: 'Main',
    instructions: "Retract scapula, arch back slightly. Touch bar to lower chest. Keep elbows tucked.",
    videoUrl: "https://www.youtube.com/results?search_query=bench+press+form"
  },
  [LiftType.Deadlift]: {
    name: LiftType.Deadlift,
    category: 'Main',
    instructions: "Bar over mid-foot. Hips lower than shoulders. Pull slack out of bar. Push floor away.",
    videoUrl: "https://www.youtube.com/results?search_query=deadlift+form"
  },
  [LiftType.Overhead]: {
    name: LiftType.Overhead,
    category: 'Main',
    instructions: "Tight core/glutes. Head back, press bar in straight line. Head forward at lockout.",
    videoUrl: "https://www.youtube.com/results?search_query=overhead+press+form"
  },

  // Legs / Lower Body
  "Leg Press": { name: "Leg Press", category: "Legs", instructions: "Feet shoulder width. Lower until knees represent 90 degrees. Don't lock out knees." },
  "Leg Curls": { name: "Leg Curls", category: "Legs", instructions: "Control the eccentric. Squeeze hamstrings at the top." },
  "Bulgarian Split Squat": { name: "Bulgarian Split Squat", category: "Legs", instructions: "One foot elevated behind. Lower hips until back knee almost touches ground." },
  "Front Squat": { name: "Front Squat", category: "Legs", instructions: "Bar on front delts. High elbows. Keep torso upright." },
  "Good Mornings": { name: "Good Mornings", category: "Legs", instructions: "Bar on back. Hinge at hips keeping legs slightly bent. Feel stretch in hamstrings." },
  "Lunges": { name: "Lunges", category: "Legs", instructions: "Step forward, lower hips. Keep torso upright." },

  // Push (Chest/Shoulders/Triceps)
  "Dips": { name: "Dips", category: "Push", instructions: "Lean forward for chest, upright for triceps. Lower until shoulders below elbows." },
  "Tricep Pushdowns": { name: "Tricep Pushdowns", category: "Push", instructions: "Elbows fixed at sides. Push down and squeeze triceps." },
  "Incline Dumbbell Press": { name: "Incline Dumbbell Press", category: "Push", instructions: "Bench at 30-45 degrees. Press dumbbells overhead." },
  "Push-ups": { name: "Push-ups", category: "Push", instructions: "Straight body line. Chest to floor. Full lockout." },
  "Lateral Raises": { name: "Lateral Raises", category: "Push", instructions: "Raise dumbbells to side until shoulder height. Slight bend in elbows." },
  "Face Pulls": { name: "Face Pulls", category: "Push", instructions: "Pull rope to forehead. Externally rotate shoulders at end." },

  // Pull (Back/Biceps)
  "Chin-ups": { name: "Chin-ups", category: "Pull", instructions: "Palms facing you. Pull chin over bar. Full ROM." },
  "Pull-ups": { name: "Pull-ups", category: "Pull", instructions: "Palms facing away. Pull chin over bar." },
  "Dumbbell Row": { name: "Dumbbell Row", category: "Pull", instructions: "One hand on bench. Pull dumbbell to hip. Squeeze back." },
  "Barbell Row": { name: "Barbell Row", category: "Pull", instructions: "Torso 45 degrees. Pull bar to lower chest/upper abs." },
  "Lat Pulldowns": { name: "Lat Pulldowns", category: "Pull", instructions: "Wide grip. Pull bar to upper chest. Lean back slightly." },
  "Bicep Curls": { name: "Bicep Curls", category: "Pull", instructions: "Keep elbows at sides. Curl weight up. Control eccentric." },

  // Core
  "Hanging Leg Raise": { name: "Hanging Leg Raise", category: "Core", instructions: "Hang from bar. Raise legs until parallel or toes to bar. Avoid swinging." },
  "Ab Wheel": { name: "Ab Wheel", category: "Core", instructions: "Kneel. Roll out keeping core tight. Don't let lower back sag." },
  "Plank": { name: "Plank", category: "Core", instructions: "Hold straight body position on elbows and toes." },
  "Crunches": { name: "Crunches", category: "Core", instructions: "Lye on back. Contract abs to lift shoulders off ground." },
  "Back Extensions": { name: "Back Extensions", category: "Core", instructions: "Hinge at hips. Lower torso then raise to straight line. Squeeze glutes/lower back." },
  "Abs": { name: "Abs", category: "Core", instructions: "Generic abdominal exercise of choice." }
};

export const ASSISTANCE_CATEGORIES = {
  [LiftType.Squat]: ["Legs", "Core"],
  [LiftType.Deadlift]: ["Legs", "Core"],
  [LiftType.Bench]: ["Push", "Pull"],
  [LiftType.Overhead]: ["Push", "Pull"]
};

export const DEFAULT_ASSISTANCE: Record<LiftType, string[]> = {
    [LiftType.Squat]: ["Leg Press", "Leg Curls", "Abs"],
    [LiftType.Bench]: ["Dumbbell Row", "Tricep Pushdowns", "Face Pulls"],
    [LiftType.Deadlift]: ["Good Mornings", "Hanging Leg Raise", "Back Extensions"],
    [LiftType.Overhead]: ["Chin-ups", "Dips", "Lateral Raises"]
};

export const ASSISTANCE_TEMPLATES: Record<string, Record<LiftType, string[]>> = {
  'Balanced': DEFAULT_ASSISTANCE,
  'Bodyweight': {
    [LiftType.Squat]: ["Lunges", "Plank"],
    [LiftType.Bench]: ["Push-ups", "Pull-ups"],
    [LiftType.Deadlift]: ["Back Extensions", "Hanging Leg Raise"],
    [LiftType.Overhead]: ["Chin-ups", "Dips"]
  },
  'Minimalist': {
    [LiftType.Squat]: ["Abs"],
    [LiftType.Bench]: ["Barbell Row"],
    [LiftType.Deadlift]: ["Abs"],
    [LiftType.Overhead]: ["Chin-ups"]
  },
  'Bodybuilder': {
    [LiftType.Squat]: ["Leg Press", "Leg Curls", "Bulgarian Split Squat", "Abs"],
    [LiftType.Bench]: ["Incline Dumbbell Press", "Dumbbell Row", "Tricep Pushdowns", "Bicep Curls"],
    [LiftType.Deadlift]: ["Good Mornings", "Lunges", "Lat Pulldowns", "Back Extensions"],
    [LiftType.Overhead]: ["Dips", "Lateral Raises", "Face Pulls", "Tricep Pushdowns"]
  }
};

// --- Achievements ---

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    threshold?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_blood', name: 'First Blood', description: 'Complete your first workout', icon: '🩸' },
    { id: 'consistency', name: 'Consistency', description: 'Complete 10 workouts', icon: '📅' },
    { id: 'committed', name: 'Committed', description: 'Complete 50 workouts', icon: '🏋️' },
    { id: 'squat_225', name: '2 Plate Squat', description: 'Squat 225lbs (100kg)', icon: '🦵', threshold: 225 },
    { id: 'bench_135', name: '1 Plate Bench', description: 'Bench 135lbs (60kg)', icon: '💪', threshold: 135 },
    { id: 'deadlift_315', name: '3 Plate Pull', description: 'Deadlift 315lbs (140kg)', icon: '🦍', threshold: 315 },
    { id: 'cycle_complete', name: 'Cycle Master', description: 'Finish a full training cycle', icon: '🔄' },
    { id: 'heavy_hitter', name: '1000lb Club', description: 'Total 1RM over 1000lbs', icon: '🏆' },
];
