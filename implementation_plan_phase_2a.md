# Implementation Plan - Titan 531 (Phase 2a: Setup & Structure)

[Overview]
Implement the core data structures, onboarding flow, and program generation logic for the Original 5/3/1 program.
This phase focuses on getting the user set up with their Training Maxes (TMs) and generating their first training cycle.
This establishes the foundation for the actual workout execution in Phase 2b.

[Types]
Define the core data models for the workout program.

- `Lift`: Enum/Type ('Squat', 'Bench', 'Deadlift', 'Overhead Press').
- `TrainingMax`: Interface `{ lift: Lift, weight: number, date: string }`.
- `Exercise`: Interface `{ name: string, sets: number, reps: number, weight?: number, type: 'main' | 'supplemental' | 'assistance' }`.
- `Workout`: Interface `{ id: string, name: string, week: number, day: number, exercises: Exercise[], completed: boolean }`.
- `Cycle`: Interface `{ id: string, startDate: string, weeks: Workout[][] }`.
- `UserProfile` (Extended): Add `experienceLevel`, `trainingDays`, `currentCycleId`.

[Files]
Create files for data management and onboarding UI.

**New Files:**

- `src/types/workout.ts`: Definition of workout-related types.
- `src/services/programGenerator.ts`: Logic to generate 5/3/1 cycles based on TMs.
- `src/context/ProgramContext.tsx`: Context to manage TMs, current cycle, and workout history.
- `src/pages/Onboarding.tsx`: Main container for the onboarding wizard.
- `src/components/onboarding/WelcomeStep.tsx`: Intro screen.
- `src/components/onboarding/TMInputStep.tsx`: Form to input or estimate 1RM/TM.
- `src/components/onboarding/ScheduleStep.tsx`: Selection of training days.
- `src/components/onboarding/ProgramPreviewStep.tsx`: Summary of the generated program.

**Modified Files:**

- `src/App.tsx`: Add route for `/onboarding`.
- `src/pages/Home.tsx`: Update to display the "Current Workout" or "Next Workout" based on `ProgramContext`.
- `src/components/Layout.tsx`: Hide navigation during onboarding if needed.

[Functions]
Implement business logic for 5/3/1.

- `calculateTM(oneRepMax: number)`: Returns 90% of 1RM.
- `generate531Cycle(tms: TrainingMax[])`: Generates a 4-week cycle (3 weeks + deload) with specific exercises and weights.
- `saveProgramData(data)`: Persist data (Local Storage / Supabase).

[Classes]
Functional components and hooks will be used.

[Dependencies]
No new external dependencies required (using existing `react-hook-form`, `mui`).

[Implementation Order]

1.  **Types & Services**: Define `src/types/workout.ts` and implement `src/services/programGenerator.ts` (core 5/3/1 math).
2.  **Program Context**: Create `ProgramContext` to hold the state.
3.  **Onboarding UI**: Build the `Onboarding` page and its steps (`Welcome`, `TMInput`, `Schedule`, `Preview`).
4.  **Integration**: Connect Onboarding to `ProgramContext` to save data and generate the first cycle.
5.  **Home Dashboard**: Update `Home.tsx` to reflect the active program state (e.g., "Week 1, Day 1: Squat").
