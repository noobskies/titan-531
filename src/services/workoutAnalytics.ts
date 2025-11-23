import { v4 as uuidv4 } from "uuid";
import type { Workout, Cycle, LiftType } from "../types/workout";
import type {
  VolumeDataPoint,
  E1RMDataPoint,
  PersonalRecord,
  ProgressSummary,
} from "../types/analytics";

/**
 * Calculates the total volume (weight * reps) for a workout
 * Only includes completed sets
 */
export function calculateTotalVolume(workout: Workout): number {
  if (!workout.exercises) return 0;

  return workout.exercises.reduce((totalVolume, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setVolume, set) => {
      // Use actualReps if available, otherwise target reps
      const reps = set.actualReps !== undefined ? set.actualReps : set.reps;

      // Only count completed sets
      if (set.completed) {
        return setVolume + reps * set.weight;
      }
      return setVolume;
    }, 0);

    return totalVolume + exerciseVolume;
  }, 0);
}

/**
 * Calculates workout duration in seconds
 */
export function calculateWorkoutDuration(
  startTime: string | number,
  endTime: string | number
): number {
  const start =
    typeof startTime === "string" ? new Date(startTime).getTime() : startTime;
  const end =
    typeof endTime === "string" ? new Date(endTime).getTime() : endTime;

  if (isNaN(start) || isNaN(end)) return 0;

  // Return duration in seconds
  return Math.max(0, Math.floor((end - start) / 1000));
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
}

/**
 * Calculates the completion percentage of a workout
 */
export function calculateCompletionRate(workout: Workout): number {
  if (!workout.exercises || workout.exercises.length === 0) return 0;

  let totalSets = 0;
  let completedSets = 0;

  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      totalSets++;
      if (set.completed) {
        completedSets++;
      }
    });
  });

  if (totalSets === 0) return 0;
  return Math.round((completedSets / totalSets) * 100);
}

/**
 * Detects basic PRs (Personal Records) in a workout based on AMRAP sets
 * Note: This is a basic implementation. A full implementation would check history.
 * Currently it just identifies AMRAP sets that exceeded target reps.
 */
export function detectBasicPRs(workout: Workout): string[] {
  const prs: string[] = [];

  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (
        set.isAmrap &&
        set.completed &&
        set.actualReps &&
        set.actualReps > set.reps
      ) {
        prs.push(
          `${exercise.name}: ${set.actualReps} reps @ ${set.weight} lbs (Target: ${set.reps})`
        );
      }
    });
  });

  return prs;
}

/**
 * Calculates Estimated 1RM using Epley Formula
 * E1RM = Weight * (1 + Reps/30)
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Extracts volume history from a cycle for charting
 */
export function getVolumeHistory(cycle: Cycle): VolumeDataPoint[] {
  const history: VolumeDataPoint[] = [];

  cycle.weeks.forEach((week) => {
    week.forEach((workout) => {
      if (workout.completed && workout.completedAt) {
        const volume = calculateTotalVolume(workout);
        history.push({
          date: workout.completedAt,
          totalVolume: volume,
          lift: workout.mainLift,
          workoutName: workout.name,
        });
      }
    });
  });

  // Sort by date
  return history.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Extracts E1RM history for a specific lift from a cycle
 */
export function getE1RMHistory(cycle: Cycle, lift: LiftType): E1RMDataPoint[] {
  const history: E1RMDataPoint[] = [];

  cycle.weeks.forEach((week) => {
    week.forEach((workout) => {
      if (
        workout.completed &&
        workout.completedAt &&
        workout.mainLift === lift
      ) {
        // Find the main lift exercise and its AMRAP set (usually last set)
        const mainExercise = workout.exercises.find(
          (ex) =>
            ex.type === "Main" && (ex.lift === lift || ex.name.includes(lift))
        );

        if (mainExercise) {
          // Look for AMRAP set first, or heaviest set
          const amrapSet = mainExercise.sets.find(
            (s) => s.isAmrap && s.completed
          );

          if (amrapSet && amrapSet.actualReps) {
            history.push({
              date: workout.completedAt,
              estimatedMax: calculateE1RM(amrapSet.weight, amrapSet.actualReps),
              lift,
              actualReps: amrapSet.actualReps,
              weight: amrapSet.weight,
            });
          }
        }
      }
    });
  });

  return history.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Generates comprehensive PR history from cycle data
 * Identifies E1RM records and Rep Max records
 */
export function getPRHistory(cycle: Cycle): PersonalRecord[] {
  const prs: PersonalRecord[] = [];
  const maxesByLift: Record<string, number> = {};

  // Process workouts chronologically
  const allWorkouts = cycle.weeks
    .flat()
    .filter((w) => w.completed && w.completedAt)
    .sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
    );

  allWorkouts.forEach((workout) => {
    const lift = workout.mainLift;
    if (!lift) return;

    const mainExercise = workout.exercises.find(
      (ex) => ex.type === "Main" && (ex.lift === lift || ex.name.includes(lift))
    );

    if (mainExercise) {
      const amrapSet = mainExercise.sets.find((s) => s.isAmrap && s.completed);

      if (amrapSet && amrapSet.actualReps) {
        const e1rm = calculateE1RM(amrapSet.weight, amrapSet.actualReps);

        // Check if this is a new E1RM PR
        if (!maxesByLift[lift] || e1rm > maxesByLift[lift]) {
          maxesByLift[lift] = e1rm;

          prs.push({
            id: uuidv4(),
            date: workout.completedAt!,
            lift,
            exercise: mainExercise.name,
            recordType: "e1rm",
            value: e1rm,
            reps: amrapSet.actualReps,
            weight: amrapSet.weight,
            workoutId: workout.id,
          });
        }
      }
    }
  });

  return prs.reverse(); // Newest first
}

/**
 * Calculates overall progress summary
 */
export function getProgressSummary(cycle: Cycle): ProgressSummary {
  let totalWorkouts = 0;
  let completedWorkouts = 0;
  let totalVolume = 0;
  let totalDuration = 0;
  let currentStreak = 0;

  // Flatten weeks into chronological list of workouts
  const flatWorkouts = cycle.weeks.flat();
  totalWorkouts = flatWorkouts.length;

  // Sort by date (if completed) or by order
  const sortedWorkouts = [...flatWorkouts].sort((a, b) => {
    if (a.completedAt && b.completedAt) {
      return (
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      ); // Descending
    }
    return 0;
  });

  // Calculate stats
  sortedWorkouts.forEach((workout) => {
    if (workout.completed) {
      completedWorkouts++;
      totalVolume += calculateTotalVolume(workout);
      if (workout.duration) {
        totalDuration += workout.duration;
      }
    }
  });

  // Calculate streak (consecutive weeks with at least one workout)
  // Simple implementation: consecutive completed workouts
  for (const workout of sortedWorkouts) {
    if (workout.completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  const prs = getPRHistory(cycle);

  return {
    totalWorkouts,
    completedWorkouts,
    totalVolume,
    averageVolume:
      completedWorkouts > 0 ? Math.round(totalVolume / completedWorkouts) : 0,
    prsAchieved: prs.length,
    currentStreak,
    durationMinutes: Math.round(totalDuration / 60),
  };
}
