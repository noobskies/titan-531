
import { LiftType } from './common';

export type ProgramType = 'Original' | 'BBB' | 'Beginner' | 'BBS' | 'FSL' | 'Monolith';

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

export interface WarmupSetSetting {
    percentage: number; // 0.4 for 40%
    reps: number;
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
