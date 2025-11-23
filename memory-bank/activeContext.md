# Active Context - Titan 531

## Current Focus

**Phase Status:** Phase 3a (Database & Sync Foundation) Complete → Phase 3b (Analytics) Next

**Immediate Priority:** Build the Analytics service and dashboard for Premium users.

**Active Work Stream:** Implementing Premium Features (Phase 3).

## Recent Changes

### Phase 3a: Database & Sync Foundation (✅ Complete)

**What Was Built:**

1. **Supabase Schema Design** (`memory-bank/techContext.md` & `supabase_schema.sql`)

   - Comprehensive SQL schema for user data
   - Tables: profiles, training_maxes, cycles, workouts, workout_exercises, sets, personal_records, settings
   - Row Level Security (RLS) policies for data protection

2. **Sync Service** (`src/services/syncService.ts`)

   - **Offline-First Architecture:** Local storage queue for offline operations
   - **Bidirectional Sync:** Logic to push local changes and pull cloud data
   - **Premium Gating:** Checks premium status before syncing
   - **Queue Management:** Retries failed operations when back online

3. **Program Context Integration** (`src/context/ProgramContext.tsx`)
   - **Auto-Sync:** Triggers sync on TMs update, cycle creation, and workout completion
   - **Cloud Pull:** Fetches and merges cloud data on app initialization
   - **Seamless UX:** Sync happens in background without blocking UI

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

## Next Steps

### Phase 3b: Analytics (Upcoming)

**1. Analytics Service**

- Implement `calculateE1RM` (Estimated 1-Rep Max) logic
- Implement volume progression calculation
- Implement PR history tracking

**2. Visualization Components**

- Integrate `recharts` library
- Create `E1RMChart` component
- Create `VolumeChart` component
- Create `PRHistoryList` component

**3. Analytics Dashboard**

- Create `src/pages/Analytics.tsx`
- Connect to `ProgramContext` / `SyncService` for data
- Implement date range filtering

### Phase 3c: Customization & Premium UI (Follow-up)

**1. Customization**

- Allow editing exercises (swap main/assistance)
- Custom plate inventory for calculator
- Dark/Light mode toggle

**2. Premium Feature Gating**

- Implement paywall UI for non-premium users
- Create "Upgrade to Premium" screen

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

### From Phase 3a Implementation

**1. Offline-First Sync is Complex:**

- Handling the queue for offline operations requires careful state management.
- Bidirectional sync needs a clear "source of truth" strategy (we chose Cloud wins for TMs, Local wins for unsynced new data).

**2. Type Safety:**

- Sharing types between frontend and backend (via Supabase interface mirroring) is crucial to prevent bugs.

### From Phase 2b Implementation

**1. Context State Management:**

- Deep cloning is essential when updating complex nested state (Cycles -> Weeks -> Workouts -> Exercises -> Sets)
- Separating "Active Workout" state from "Cycle" state helps prevent UI glitches during updates

**2. Timer Logic:**

- `useRestTimer` hook cleanly separates logic from UI
- `setInterval` needs careful cleanup in `useEffect`

## Open Questions

**For Phase 3b:**

- Chart Library: Recharts vs Victory? (Leaning Recharts for React 19 compatibility)
- Performance: How much historical data should we load at once for analytics?

## Context for Next Session

**When resuming work, remember:**

1. Phase 3a is complete. The app now has a database schema and basic sync capability.
2. Next step is Phase 3b (Analytics).
3. Start by installing `recharts` (checking docs first!) and building the analytics service.
