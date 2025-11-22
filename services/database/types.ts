// Supabase Database Types
// Generated from database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          gender: string | null;
          unit: string;
          theme: string;
          language: string;
          training_maxes: Json;
          current_cycle: number;
          current_week: number;
          selected_program: string;
          custom_assistance: Json | null;
          achievements: string[];
          is_coach: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          gender?: string | null;
          unit?: string;
          theme?: string;
          language?: string;
          training_maxes: Json;
          current_cycle?: number;
          current_week?: number;
          selected_program?: string;
          custom_assistance?: Json | null;
          achievements?: string[];
          is_coach?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          gender?: string | null;
          unit?: string;
          theme?: string;
          language?: string;
          training_maxes?: Json;
          current_cycle?: number;
          current_week?: number;
          selected_program?: string;
          custom_assistance?: Json | null;
          achievements?: string[];
          is_coach?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          date: string;
          lift: string;
          type: string;
          exercises: Json;
          completed: boolean;
          duration_seconds: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          date: string;
          lift: string;
          type: string;
          exercises: Json;
          completed?: boolean;
          duration_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string | null;
          date?: string;
          lift?: string;
          type?: string;
          exercises?: Json;
          completed?: boolean;
          duration_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meals: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          meals: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          meals?: Json;
          created_at?: string;
        };
      };
      client_profiles: {
        Row: {
          id: string;
          coach_id: string;
          name: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          name: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          name?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
