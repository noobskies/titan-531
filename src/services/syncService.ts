import { supabase } from "../supabaseClient";
import type {
  TrainingMax,
  Cycle,
  Workout,
  Exercise,
  Program,
  Lift,
} from "../types/workout";

// Define the shape of data stored in Supabase
// This matches the SQL schema we designed
interface SupabaseTrainingMax {
  id: string;
  user_id: string;
  lift: string;
  weight: number;
  unit: string;
  date: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseCycle {
  id: string;
  user_id: string;
  program_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseWorkout {
  id: string;
  user_id: string;
  cycle_id: string | null;
  name: string;
  week: number;
  day: number;
  main_lift: string;
  completed: boolean;
  completed_at: string | null;
  duration_seconds: number | null;
  total_volume_lbs: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SyncOperation {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: "training_maxes" | "cycles" | "workouts";
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = "titan531_sync_queue";

export class SyncService {
  private static instance: SyncService;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async isPremiumUser(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("profiles")
        .select("premium_status")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data?.premium_status || false;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }

  // --- Queue Management ---

  private async getSyncQueue(): Promise<SyncOperation[]> {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  private async addToQueue(operation: SyncOperation) {
    const queue = await this.getSyncQueue();
    queue.push(operation);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  private async processSyncQueue() {
    if (!this.isOnline) return;

    const isPremium = await this.isPremiumUser();
    if (!isPremium) return;

    const queue = await this.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline operations...`);

    const failedOps: SyncOperation[] = [];

    for (const op of queue) {
      try {
        if (op.type === "INSERT" || op.type === "UPDATE") {
          await supabase.from(op.table).upsert(op.data);
        } else if (op.type === "DELETE") {
          await supabase.from(op.table).delete().match({ id: op.data.id });
        }
      } catch (error) {
        console.error("Sync operation failed:", error);
        failedOps.push(op);
      }
    }

    // Update queue with failed operations only
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedOps));
  }

  // --- Sync Actions ---

  async syncTrainingMax(tm: TrainingMax) {
    const isPremium = await this.isPremiumUser();
    if (!isPremium) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      lift: tm.lift,
      weight: tm.weight,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      const { error } = await supabase
        .from("training_maxes")
        .upsert(payload, { onConflict: "user_id,lift,date" });

      if (error) {
        console.error("Error syncing TM:", error);
        await this.addToQueue({
          type: "INSERT",
          table: "training_maxes",
          data: payload,
          timestamp: Date.now(),
        });
      }
    } else {
      await this.addToQueue({
        type: "INSERT",
        table: "training_maxes",
        data: payload,
        timestamp: Date.now(),
      });
    }
  }

  async syncCycle(cycle: Cycle) {
    const isPremium = await this.isPremiumUser();
    if (!isPremium) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: cycle.id,
      user_id: user.id,
      program_name: "Original 5/3/1", // Default for now
      start_date: cycle.startDate,
      status: "active",
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      const { error } = await supabase.from("cycles").upsert(payload);
      if (error) {
        console.error("Error syncing cycle:", error);
        await this.addToQueue({
          type: "INSERT",
          table: "cycles",
          data: payload,
          timestamp: Date.now(),
        });
      }
    } else {
      await this.addToQueue({
        type: "INSERT",
        table: "cycles",
        data: payload,
        timestamp: Date.now(),
      });
    }
  }

  async syncWorkout(workout: Workout, cycleId: string) {
    const isPremium = await this.isPremiumUser();
    if (!isPremium) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Helper to extract main lift from workout name or exercises
    const mainLift = workout.name.includes("Squat")
      ? "Squat"
      : workout.name.includes("Bench")
      ? "Bench"
      : workout.name.includes("Deadlift")
      ? "Deadlift"
      : workout.name.includes("Press")
      ? "Press"
      : "Other";

    const payload = {
      id: workout.id,
      user_id: user.id,
      cycle_id: cycleId,
      name: workout.name,
      week: workout.week,
      day: workout.day,
      main_lift: mainLift,
      completed: workout.completed,
      completed_at: workout.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (this.isOnline) {
      const { error } = await supabase.from("workouts").upsert(payload);
      if (error) {
        console.error("Error syncing workout:", error);
        await this.addToQueue({
          type: "INSERT",
          table: "workouts",
          data: payload,
          timestamp: Date.now(),
        });
      }
    } else {
      await this.addToQueue({
        type: "INSERT",
        table: "workouts",
        data: payload,
        timestamp: Date.now(),
      });
    }
  }

  // --- Initial Data Pull ---

  async pullFromCloud(): Promise<{
    trainingMaxes: TrainingMax[];
    cycles: Cycle[]; // Note: Full reconstruction of cycles structure needed
  } | null> {
    const isPremium = await this.isPremiumUser();
    if (!isPremium || !this.isOnline) return null;

    try {
      const { data: tmData, error: tmError } = await supabase
        .from("training_maxes")
        .select("*")
        .order("date", { ascending: false });

      if (tmError) throw tmError;

      // Transform Supabase TMs to App TMs
      // We only want the latest unique TM per lift
      const uniqueTMs = new Map<string, TrainingMax>();
      tmData?.forEach((tm: SupabaseTrainingMax) => {
        if (!uniqueTMs.has(tm.lift)) {
          uniqueTMs.set(tm.lift, {
            lift: tm.lift as Lift,
            weight: Number(tm.weight),
            date: tm.date,
          });
        }
      });

      return {
        trainingMaxes: Array.from(uniqueTMs.values()),
        cycles: [], // Cycles reconstruction is complex, skipping for MVP sync
      };
    } catch (error) {
      console.error("Error pulling from cloud:", error);
      return null;
    }
  }
}

export const syncService = SyncService.getInstance();
