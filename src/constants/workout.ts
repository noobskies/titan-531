export const WORKOUT_CONSTANTS = {
  // 5/3/1 Percentages by Week (1-based index)
  // Week 1: 65%, 75%, 85%
  // Week 2: 70%, 80%, 90%
  // Week 3: 75%, 85%, 95%
  // Week 4 (Deload): 40%, 50%, 60%
  PERCENTAGES: [
    [0.65, 0.75, 0.85],
    [0.7, 0.8, 0.9],
    [0.75, 0.85, 0.95],
    [0.4, 0.5, 0.6],
  ],

  // 5/3/1 Rep Schemes by Week
  // Week 1: 5, 5, 5+
  // Week 2: 3, 3, 3+
  // Week 3: 5, 3, 1+
  // Week 4: 5, 5, 5 (Deload)
  REPS: [
    [5, 5, 5],
    [3, 3, 3],
    [5, 3, 1],
    [5, 5, 5],
  ],

  // Warmup percentages of TM (standard)
  WARMUP_PERCENTAGES: [0.4, 0.5, 0.6],
  WARMUP_REPS: [5, 5, 3],

  // Default rounding increment (lbs/kg)
  DEFAULT_ROUNDING: 2.5,

  // Max possible reps to log (sanity check)
  MAX_REPS: 30,

  // Rest timer defaults (seconds)
  REST_TIMER_MAIN: 180,
  REST_TIMER_SUPPLEMENTAL: 120,
  REST_TIMER_ASSISTANCE: 60,
} as const;
