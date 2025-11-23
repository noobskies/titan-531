# Active Context - Titan 531

## Current Focus

**Phase Status:** Phase 2b (Workout Interface) Complete → Phase 3 (Premium Features) Next

**Immediate Priority:** Begin planning and implementing Premium Features (Cloud Sync, Analytics, Customization).

**Active Work Stream:** Preparing for Phase 3.

## Recent Changes

### Phase 2b Polish & Completion (✅ Complete)

**What Was Built:**

1. **Workout Analytics Service** (`src/services/workoutAnalytics.ts`)

   - `calculateTotalVolume`: Sums (reps × weight) for completed sets
   - `calculateWorkoutDuration`: Calculates seconds between start/end
   - `formatDuration`: Converts seconds to MM:SS format
   - `detectBasicPRs`: Identifies AMRAP sets that exceeded targets

2. **Program Context Enhancements** (`src/context/ProgramContext.tsx`)

   - `updateSet`: Persists individual set data to both activeWorkout and currentCycle
   - `updateWorkoutNotes`: Saves workout notes
   - `completeWorkout`: Marks workout complete with timestamp and final stats
   - Ensured deep cloning for state updates to prevent mutation bugs

3. **Active Workout Updates** (`src/pages/ActiveWorkout.tsx`)

   - Now tracks workout start time
   - Uses `updateSet` to persist data immediately when logged
   - Calculates total duration on completion
   - Passes completed workout data to context before navigating

4. **Workout Complete Screen** (`src/pages/WorkoutComplete.tsx`)

   - Displays workout summary (name, duration, volume)
   - Lists completed exercises with checkmarks
   - Highlights PRs achieved
   - Provides notes field for workout reflection
   - Navigates back to home on finish

5. **Routing Updates** (`src/App.tsx`)
   - Added `/workout/active` and `/workout/complete` routes
   - Integrated new screens into the app flow

**Current State:**

- Full workout flow is operational:
  - Dashboard → Start Workout (PreWorkout)
  - PreWorkout → ActiveWorkout (starts timer)
  - ActiveWorkout → Log Sets (updates context)
  - ActiveWorkout → Complete → WorkoutComplete (shows stats)
  - WorkoutComplete → Finish → Home (updates cycle progress)

### Phase 2b Initial Implementation (✅ Complete)

**What Was Built:**

1. **Pre-Workout Screen** (`src/pages/PreWorkout.tsx`)

   - Workout overview with main lift, week, day
   - Exercise list preview
   - Navigation to active workout

2. **Active Workout Interface** (`src/pages/ActiveWorkout.tsx`)

   - Full-screen immersive UI
   - Exercise and set navigation logic
   - Integrated Rest Timer and Set Logger
   - Exit confirmation dialog

3. **Workout Components**
   - `RestTimer.tsx`: Visual countdown with CircularProgress
   - `SetLogger.tsx`: Interface for logging sets
   - `useRestTimer.ts`: Custom hook for timer logic

## Next Steps

### Phase 3: Premium Features (Upcoming)

**1. Cloud Sync**

- Connect `ProgramContext` to Supabase database
- Create database schema for TMs, Cycles, Workouts, Sets
- Implement sync logic (local-first with cloud backup)

**2. Analytics**

- Visualize progress over time (e1RM graphs)
- Volume progression charts
- PR history view

**3. Customization**

- Allow editing exercises (swap main/assistance)
- Custom plate inventory for calculator
- Dark/Light mode toggle (currently dark only)

## Active Patterns & Preferences

### 🔴 CRITICAL: Documentation-First Development

**MANDATORY BEFORE ANY FEATURE IMPLEMENTATION:**

1. **Use Context7 MCP Tool** to fetch current library docs
2. **Review documentation** for latest API patterns
3. **Implement using current patterns** (not from memory)

**Example Workflow:**

```
Task: "Add MUI Dialog component"
↓
1. resolve-library-id("Material-UI")
2. get-library-docs("/mui/material-ui", "Dialog")
3. Review fetched documentation
4. Implement using documented patterns
```

### 🔴 CRITICAL: DRY/SOLID Principles

**ALL code must follow DRY (Don't Repeat Yourself) and SOLID principles.**

**Quick Reference:**

- **DRY:** Extract repeated code into utils/hooks/services
- **Single Responsibility:** One component/function = one purpose
- **Open/Closed:** Extend through composition, not modification
- **Liskov Substitution:** Interface implementations are interchangeable
- **Interface Segregation:** Small, focused interfaces
- **Dependency Inversion:** Depend on abstractions, not implementations

### 🔴 CRITICAL: File Organization Standards

**Strict directory structure must be followed:**

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic (Button, Card)
│   ├── forms/          # Form-specific
│   ├── layout/         # Layout components
│   ├── workout/        # Workout-specific
│   └── index.ts        # Public API exports
├── pages/              # Route-level (one per route)
├── features/           # Complex features (3+ components)
├── context/            # React Context providers
├── hooks/              # Custom hooks
├── services/           # Business logic (pure functions)
├── utils/              # Pure utility functions
├── types/              # TypeScript definitions
├── constants/          # App-wide constants
└── config/             # Configuration files
```

**Component File Structure (REQUIRED ORDER):**

1. External imports
2. Internal imports
3. Types/Interfaces
4. Constants (UPPER_SNAKE_CASE)
5. Main component
6. Helper components
7. Helper functions
8. Type guards

## Key Learnings & Insights

### From Phase 2b Implementation

**1. Context State Management:**

- Deep cloning is essential when updating complex nested state (Cycles -> Weeks -> Workouts -> Exercises -> Sets)
- Separating "Active Workout" state from "Cycle" state helps prevent UI glitches during updates

**2. Timer Logic:**

- `useRestTimer` hook cleanly separates logic from UI
- `setInterval` needs careful cleanup in `useEffect`

**3. Navigation Flow:**

- `PreWorkout` -> `ActiveWorkout` -> `WorkoutComplete` -> `Home` loop works well
- Using `activeWorkout` state in context allows preserving session even if user navigates away temporarily

## Open Questions

**For Phase 3:**

- Database Schema: Should we use a relational structure (users -> cycles -> workouts) or a document-like structure (JSON columns)?
- Sync Strategy: Optimistic UI updates with background sync, or blocking sync on critical actions?

## Context for Next Session

**When resuming work, remember:**

1. Phase 2b is fully complete. The app is usable for tracking workouts locally.
2. Next major step is Phase 3 (Premium Features).
3. Start by designing the Supabase schema in `techContext.md` or a new design doc.
