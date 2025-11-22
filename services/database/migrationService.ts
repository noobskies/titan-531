import { supabase } from "./supabaseClient";
import { UserProfile, WorkoutSession, NutritionLog } from "../../types";

// Migration result type
interface MigrationResult {
  success: boolean;
  error?: string;
  details?: {
    profileMigrated: boolean;
    workoutsMigrated: number;
    nutritionDaysMigrated: number;
    clientsMigrated: number;
  };
}

// Check if migration has already been completed for this user
export const checkMigrationStatus = (userId: string): boolean => {
  try {
    const flagKey = `titan_migration_${userId}`;
    const flag = localStorage.getItem(flagKey);
    if (!flag) return false;

    const migrationData = JSON.parse(flag);
    return migrationData.completed === true;
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
};

// Mark migration as complete for this user
export const markMigrationComplete = (userId: string): void => {
  try {
    const flagKey = `titan_migration_${userId}`;
    const migrationData = {
      completed: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(flagKey, JSON.stringify(migrationData));
  } catch (error) {
    console.error("Error marking migration complete:", error);
  }
};

// Main migration orchestrator
export const migrateGuestDataToCloud = async (
  userId: string
): Promise<MigrationResult> => {
  try {
    // Check if already migrated
    if (checkMigrationStatus(userId)) {
      return {
        success: true,
        details: {
          profileMigrated: false,
          workoutsMigrated: 0,
          nutritionDaysMigrated: 0,
          clientsMigrated: 0,
        },
      };
    }

    // Load data from localStorage
    const profileData = localStorage.getItem("titan_profile");
    const historyData = localStorage.getItem("titan_history");

    // Initialize result tracking
    const result: MigrationResult = {
      success: true,
      details: {
        profileMigrated: false,
        workoutsMigrated: 0,
        nutritionDaysMigrated: 0,
        clientsMigrated: 0,
      },
    };

    // If no data exists, just mark migration complete (new user)
    if (!profileData) {
      markMigrationComplete(userId);
      return result;
    }

    // Parse profile data
    const profile: UserProfile = JSON.parse(profileData);
    const history: WorkoutSession[] = historyData
      ? JSON.parse(historyData)
      : [];

    // Migrate profile (excluding clients array)
    const profileResult = await migrateProfile(profile, userId);
    if (!profileResult.success) {
      return { success: false, error: profileResult.error };
    }
    result.details!.profileMigrated = true;

    // Migrate workout history
    const historyResult = await migrateWorkoutHistory(history, userId);
    if (!historyResult.success) {
      return { success: false, error: historyResult.error };
    }
    result.details!.workoutsMigrated = historyResult.count || 0;

    // Migrate nutrition data if exists
    if (profile.nutritionLog && Object.keys(profile.nutritionLog).length > 0) {
      const nutritionResult = await migrateNutritionData(
        profile.nutritionLog,
        userId
      );
      if (!nutritionResult.success) {
        console.warn("Nutrition migration failed:", nutritionResult.error);
        // Don't fail entire migration for nutrition
      } else {
        result.details!.nutritionDaysMigrated = nutritionResult.count || 0;
      }
    }

    // Migrate client profiles if coach mode
    if (profile.isCoach && profile.clients && profile.clients.length > 0) {
      const clientsResult = await migrateClientProfiles(
        profile.clients,
        userId
      );
      if (!clientsResult.success) {
        console.warn("Client migration failed:", clientsResult.error);
        // Don't fail entire migration for clients
      } else {
        result.details!.clientsMigrated = clientsResult.count || 0;
      }
    }

    // Mark migration complete
    markMigrationComplete(userId);

    return result;
  } catch (error) {
    console.error("Migration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Migrate user profile data
export const migrateProfile = async (
  profile: UserProfile,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Transform profile to match database schema
    const profileData = {
      user_id: userId,
      name: profile.name,
      gender: profile.gender,
      body_weight: profile.bodyWeight,
      unit: profile.unit,
      rounding: profile.rounding,
      training_maxes: profile.trainingMaxes,
      one_rep_maxes: profile.oneRepMaxes,
      current_cycle: profile.currentCycle,
      current_week: profile.currentWeek,
      selected_program: profile.selectedProgram,
      progression_scheme: profile.progressionScheme,
      theme: profile.theme,
      theme_color: profile.themeColor,
      onboarding_complete: profile.onboardingComplete,
      default_rest_timer: profile.defaultRestTimer,
      timer_settings: profile.timerSettings,
      assistance_settings: profile.assistanceSettings,
      warmup_settings: profile.warmupSettings || null,
      lift_order: profile.liftOrder || null,
      custom_assistance: profile.customAssistance,
      achievements: profile.achievements,
      is_premium: profile.isPremium,
      sound_enabled: profile.soundEnabled,
      voice_enabled: profile.voiceEnabled,
      notifications_enabled: profile.notificationsEnabled,
      language: profile.language,
      training_days: profile.trainingDays,
      custom_bar_weight: profile.customBarWeight || null,
      plate_inventory: profile.plateInventory || null,
      is_coach: profile.isCoach,
      custom_percentages: profile.customPercentages || null,
      custom_reps: profile.customReps || null,
      custom_exercises: profile.customExercises,
      nutrition_targets: profile.nutritionTargets || null,
      body_weight_history: profile.bodyWeightHistory || [],
      measurements: profile.measurements || null,
      progress_photos: profile.progressPhotos || null,
    };

    // UPSERT (insert or update if exists)
    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (error) {
      console.error("Profile migration error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Profile migration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Migrate workout history (with batching for large histories)
export const migrateWorkoutHistory = async (
  history: WorkoutSession[],
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    if (history.length === 0) {
      return { success: true, count: 0 };
    }

    // Transform sessions to match database schema
    const sessions = history.map((session) => ({
      user_id: userId,
      date: session.date,
      title: session.title,
      cycle: session.cycle,
      week: session.week,
      lift: session.lift,
      type: session.type,
      exercises: session.exercises,
      conditioning_data: session.conditioningData || null,
      completed: session.completed,
      duration_seconds: session.durationSeconds,
      notes: session.notes || null,
      program_type: session.programType,
      profile_id: session.profileId || null,
    }));

    // Batch insert in chunks of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < sessions.length; i += BATCH_SIZE) {
      const batch = sessions.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("workout_sessions").insert(batch);

      if (error) {
        console.error(`Batch insert error (${i}-${i + batch.length}):`, error);
        return { success: false, error: error.message };
      }

      totalInserted += batch.length;
    }

    return { success: true, count: totalInserted };
  } catch (error) {
    console.error("Workout history migration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Migrate nutrition log data
export const migrateNutritionData = async (
  nutritionLog: NutritionLog,
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const dates = Object.keys(nutritionLog);
    if (dates.length === 0) {
      return { success: true, count: 0 };
    }

    // Transform nutrition log to rows
    const nutritionRows = dates.map((date) => ({
      user_id: userId,
      date: date,
      meals: nutritionLog[date],
    }));

    // Insert all nutrition rows
    const { error } = await supabase
      .from("nutrition_logs")
      .insert(nutritionRows);

    if (error) {
      console.error("Nutrition migration error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: nutritionRows.length };
  } catch (error) {
    console.error("Nutrition migration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Migrate client profiles (for coach mode)
export const migrateClientProfiles = async (
  clients: UserProfile[],
  coachId: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    if (clients.length === 0) {
      return { success: true, count: 0 };
    }

    // Transform clients to match database schema
    const clientRows = clients.map((client) => ({
      coach_id: coachId,
      client_id: client.id,
      profile_data: client, // Store entire profile as JSONB
    }));

    // Insert all client profiles
    const { error } = await supabase.from("client_profiles").insert(clientRows);

    if (error) {
      console.error("Client profiles migration error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: clientRows.length };
  } catch (error) {
    console.error("Client profiles migration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Helper: Reset migration status (for testing/debugging)
export const resetMigrationStatus = (userId: string): void => {
  try {
    const flagKey = `titan_migration_${userId}`;
    localStorage.removeItem(flagKey);
  } catch (error) {
    console.error("Error resetting migration status:", error);
  }
};
