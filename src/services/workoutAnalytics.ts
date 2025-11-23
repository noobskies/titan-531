import type { Workout } from "../types/workout";

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
