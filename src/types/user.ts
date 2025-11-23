import type { WeightUnit, ProgramId } from "./workout";

export interface UserPreferences {
  defaultUnit: WeightUnit;
  roundTo: number; // e.g., 2.5 or 5
  theme: "light" | "dark" | "system";
  restTimerDuration: {
    main: number;
    supplemental: number;
    assistance: number;
  };
}

export interface TrainingPreferences {
  programId: ProgramId;
  trainingDays: number[]; // 0-6 (Sun-Sat)
  warmupSetsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  email: string | undefined;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  preferences?: UserPreferences;
  training?: TrainingPreferences;
  onboardingCompleted?: boolean;
}

export interface AuthError {
  message: string;
}
