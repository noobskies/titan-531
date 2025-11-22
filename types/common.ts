
export enum LiftType {
  Squat = 'Squat',
  Bench = 'Bench Press',
  Deadlift = 'Deadlift',
  Overhead = 'Overhead Press'
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

export enum AppView {
  Dashboard = 'Dashboard',
  Workout = 'Workout',
  Conditioning = 'Conditioning',
  Nutrition = 'Nutrition',
  History = 'History',
  Profile = 'Profile',
  AICoach = 'AICoach',
  Tools = 'Tools',
  Settings = 'Settings',
  CoachDashboard = 'CoachDashboard',
  ExerciseManager = 'ExerciseManager'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
