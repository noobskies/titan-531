# System Patterns - Titan 531

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  (React Components, MUI, Pages, Routing)            │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              State Management Layer                  │
│  (React Context: Auth, Program, Settings)           │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│               Business Logic Layer                   │
│  (Services: programGenerator, calculations)         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                Data Persistence Layer                │
│  localStorage → SQLite (future) → Supabase (premium)│
└─────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              Native Platform Layer                   │
│  (Capacitor APIs: Haptics, Notifications, Camera)  │
└─────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (Theme, Auth Provider)
├── Router
    ├── Login Page
    ├── Register Page
    ├── Layout (Protected)
    │   ├── AppBar
    │   ├── BottomNavigation (future)
    │   ├── Outlet
    │   │   ├── Home/Dashboard
    │   │   ├── Onboarding Wizard
    │   │   ├── Workout Interface
    │   │   ├── History
    │   │   ├── Profile/Settings
```

## Key Design Patterns

### 1. Context Provider Pattern (State Management)

**AuthContext Pattern:**

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Provider wraps app, consumers use hook
const { user, signIn } = useAuth();
```

**ProgramContext Pattern (to be implemented):**

```typescript
interface ProgramContextType {
  trainingMaxes: TrainingMax[];
  currentCycle: Cycle | null;
  activeWorkout: Workout | null;
  updateTM: (lift: Lift, weight: number) => void;
  startWorkout: (workoutId: string) => void;
  logSet: (exerciseId: string, reps: number, weight: number) => void;
  completeWorkout: () => void;
}

// Encapsulates all program-related state and actions
const { currentCycle, startWorkout } = useProgram();
```

**Benefits:**

- Centralized state management
- Easy to test business logic
- Prevents prop drilling
- Clear data flow

### 2. Service Layer Pattern (Business Logic)

**Separation of Concerns:**

```typescript
// services/programGenerator.ts
export function generate531Cycle(tms: TrainingMax[]): Cycle {
  // Pure function: TMs in, Cycle out
  // Contains all 5/3/1 calculation logic
  // Zero UI dependencies
  // Easily testable
}

export function calculateWorkingWeight(tm: number, percentage: number): number {
  // Calculation logic isolated
  // Consistent rounding rules
  // Can be reused anywhere
}
```

**Benefits:**

- Business logic testable without UI
- Reusable across components
- Easy to verify calculations
- Single source of truth for 5/3/1 math

### 3. Compound Component Pattern (Complex UI)

**Onboarding Wizard Structure:**

```typescript
<OnboardingWizard>
  <OnboardingWizard.Welcome />
  <OnboardingWizard.TMInput />
  <OnboardingWizard.Schedule />
  <OnboardingWizard.Preview />
</OnboardingWizard>

// Parent manages state, children are presentational
// Stepper component shows progress
// Each step is isolated and testable
```

**Benefits:**

- Clear step boundaries
- Easy to add/remove/reorder steps
- Shared state via parent
- Clean component hierarchy

### 4. Protected Route Pattern (Authorization)

**Route Protection:**

```typescript
// RequireAuth wrapper checks auth state
<Route element={<Layout />}>
  <Route
    path="/"
    element={
      <RequireAuth>
        <Home />
      </RequireAuth>
    }
  />
</Route>

// Redirects to /login if not authenticated
// Shows loading state during check
// Prevents flash of protected content
```

### 5. Custom Hook Pattern (Reusable Logic)

**Examples:**

```typescript
// useWorkoutTimer.ts
function useWorkoutTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Returns: { elapsed, start, pause, reset }
}

// useRestTimer.ts
function useRestTimer(duration: number) {
  const [remaining, setRemaining] = useState(duration);
  // Handles countdown, notifications, haptics
  // Returns: { remaining, start, pause, reset, isComplete }
}

// usePlateCalculator.ts
function usePlateCalculator(targetWeight: number, barWeight: number) {
  // Calculates optimal plate loading
  // Returns: { plates, difference }
}
```

**Benefits:**

- Logic reuse across components
- Easier testing
- Clear responsibilities
- Composable functionality

## Data Flow Patterns

### 1. Unidirectional Data Flow

```
User Action
    ↓
Component calls Context method
    ↓
Context calls Service function
    ↓
Service returns new data
    ↓
Context updates state
    ↓
Components re-render
    ↓
Context persists to storage
```

**Example: Logging a Set**

```typescript
// User taps "5 reps" button
<Button onClick={() => logSet(exerciseId, 5, weight)}>
  Hit Target: 5 reps
</Button>;

// Component uses context hook
const { logSet } = useProgram();

// Context method
function logSet(exerciseId: string, reps: number, weight: number) {
  // 1. Update local state
  const updatedWorkout = addSetToWorkout(
    activeWorkout,
    exerciseId,
    reps,
    weight
  );
  setActiveWorkout(updatedWorkout);

  // 2. Persist to storage
  saveWorkoutToStorage(updatedWorkout);

  // 3. Check for PRs (service function)
  const isPR = checkForPR(exerciseId, reps, weight, history);
  if (isPR) {
    showPRCelebration();
  }

  // 4. Start rest timer (side effect)
  startRestTimer(getRestDuration(exerciseId));
}
```

### 2. Lazy Loading Pattern

**Route-Based Code Splitting:**

```typescript
// Lazy load heavy components
const WorkoutInterface = lazy(() => import("./pages/WorkoutInterface"));
const Analytics = lazy(() => import("./pages/Analytics"));

// Wrap in Suspense
<Suspense fallback={<LoadingScreen />}>
  <Route path="/workout" element={<WorkoutInterface />} />
</Suspense>;
```

**Benefits:**

- Faster initial load
- Smaller bundle size
- Load features on demand

### 3. Optimistic UI Updates

**For Premium Tier (Cloud Sync):**

```typescript
async function updateTrainingMax(lift: Lift, newTM: number) {
  // 1. Update UI immediately (optimistic)
  setTrainingMaxes((prev) => updateTM(prev, lift, newTM));

  try {
    // 2. Sync to cloud in background
    await supabase.from("training_maxes").update({ weight: newTM });
  } catch (error) {
    // 3. Rollback on failure
    setTrainingMaxes((prev) => revertTM(prev, lift));
    showError("Failed to sync. Changes saved locally.");
  }
}
```

## Component Patterns

### 1. Presentational vs Container Components

**Presentational (Dumb) Components:**

```typescript
// Just render props, no business logic
interface WorkoutCardProps {
  workoutName: string;
  exercises: Exercise[];
  onStart: () => void;
}

function WorkoutCard({ workoutName, exercises, onStart }: WorkoutCardProps) {
  return (
    <Card>
      <CardHeader title={workoutName} />
      <CardContent>
        <ExerciseList exercises={exercises} />
      </CardContent>
      <CardActions>
        <Button onClick={onStart}>Start Workout</Button>
      </CardActions>
    </Card>
  );
}
```

**Container (Smart) Components:**

```typescript
// Fetches data, manages state, contains logic
function WorkoutDashboard() {
  const { currentCycle, activeWorkout, startWorkout } = useProgram();
  const nextWorkout = getNextWorkout(currentCycle);

  const handleStart = () => {
    startWorkout(nextWorkout.id);
    navigate("/workout");
  };

  return <WorkoutCard {...nextWorkout} onStart={handleStart} />;
}
```

### 2. Compound Props Pattern (MUI Integration)

**Leveraging MUI Props:**

```typescript
<Button
  variant="contained"
  size="large"
  fullWidth
  sx={{
    height: 64, // Gym-optimized height
    fontSize: "1.25rem", // Large text
    fontWeight: "bold",
  }}
>
  Start Workout
</Button>

// Theme overrides set defaults, sx for one-offs
// Consistent styling across app
```

### 3. Error Boundary Pattern

**Graceful Error Handling:**

```typescript
class WorkoutErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen message="Something went wrong. Your data is safe." />;
    }
    return this.props.children;
  }
}

// Wrap critical sections
<WorkoutErrorBoundary>
  <WorkoutInterface />
</WorkoutErrorBoundary>;
```

## Data Persistence Patterns

### 1. Storage Abstraction Layer

**Future-Proof Storage:**

```typescript
// src/services/storage.ts
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

// Easy to swap for SQLite later
class SQLiteAdapter implements StorageAdapter {
  // Implementation using Capacitor SQLite plugin
}

// Usage
const storage: StorageAdapter = new LocalStorageAdapter();
await storage.set("trainingMaxes", tms);
```

### 2. Data Sync Pattern (Premium Feature)

**Local-First with Cloud Sync:**

```typescript
class SyncManager {
  // 1. Always write to local storage first
  async saveWorkout(workout: Workout) {
    await localDB.save(workout);
    await this.queueSync(workout);
  }

  // 2. Sync to cloud in background
  private async queueSync(data: any) {
    if (isPremium && isOnline) {
      await supabase.from("workouts").upsert(data);
    } else {
      // Queue for later sync
      await localDB.savePendingSync(data);
    }
  }

  // 3. Sync queue on connectivity change
  async processSyncQueue() {
    const pending = await localDB.getPendingSync();
    for (const item of pending) {
      await supabase.from(item.table).upsert(item.data);
      await localDB.removePendingSync(item.id);
    }
  }
}
```

### 3. Data Migration Pattern

**Versioned Data Structures:**

```typescript
interface DataVersion {
  version: number;
  data: any;
}

async function migrateData() {
  const stored = await storage.get<DataVersion>("appData");

  if (!stored) {
    // First time user
    await storage.set("appData", { version: 1, data: getDefaultData() });
    return;
  }

  // Migrate through versions
  let { version, data } = stored;

  if (version < 2) {
    data = migrateV1toV2(data);
    version = 2;
  }

  if (version < 3) {
    data = migrateV2toV3(data);
    version = 3;
  }

  await storage.set("appData", { version, data });
}
```

## Performance Patterns

### 1. Memoization Pattern

**Expensive Calculations:**

```typescript
// Memoize workout generation
const generatedCycle = useMemo(() => {
  return generate531Cycle(trainingMaxes);
}, [trainingMaxes]);

// Memoize filtered data
const filteredWorkouts = useMemo(() => {
  return workouts.filter((w) => w.completed);
}, [workouts]);

// Memoize callbacks passed to children
const handleStartWorkout = useCallback(
  (id: string) => {
    startWorkout(id);
    navigate("/workout");
  },
  [startWorkout, navigate]
);
```

### 2. Virtual Scrolling (Future)

**For Long Lists:**

```typescript
// When workout history grows large
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={workoutHistory.length} itemSize={80}>
  {({ index, style }) => (
    <div style={style}>
      <WorkoutHistoryItem workout={workoutHistory[index]} />
    </div>
  )}
</FixedSizeList>;
```

### 3. Debouncing User Input

**Search and Filter:**

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Native Integration Patterns

### 1. Capacitor Plugin Pattern

**Haptic Feedback:**

```typescript
// src/utils/haptics.ts
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export async function vibrateSuccess() {
  if (isPlatform("capacitor")) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
}

export async function vibrateError() {
  if (isPlatform("capacitor")) {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }
}

// Usage in components
async function handleSetComplete() {
  logSet(reps, weight);
  await vibrateSuccess();
  showSnackbar("Set logged!");
}
```

### 2. Platform Detection Pattern

**Conditional Features:**

```typescript
import { Capacitor } from "@capacitor/core";

function isPlatform(platform: "web" | "android" | "ios"): boolean {
  return Capacitor.getPlatform() === platform;
}

// Conditional rendering
{
  isPlatform("android") && <AndroidSpecificFeature />;
}

// Conditional logic
if (isPlatform("capacitor")) {
  // Use native camera
} else {
  // Use web file input
}
```

## Testing Patterns

### 1. Service Testing (Pure Functions)

**Easy to Test:**

```typescript
// programGenerator.test.ts
describe("generate531Cycle", () => {
  it("generates correct Week 1 percentages", () => {
    const tms = [{ lift: "Squat", weight: 300, date: "2024-01-01" }];

    const cycle = generate531Cycle(tms);
    const week1 = cycle.weeks[0];

    expect(week1[0].exercises[0].weight).toBe(195); // 65% of 300
    expect(week1[0].exercises[1].weight).toBe(225); // 75% of 300
    expect(week1[0].exercises[2].weight).toBe(255); // 85% of 300
  });
});
```

### 2. Component Testing (React Testing Library)

**Integration-Style Tests:**

```typescript
// WorkoutCard.test.tsx
test("starts workout when button clicked", () => {
  const handleStart = jest.fn();

  render(
    <WorkoutCard
      workoutName="Week 1 Day 1: Squat"
      exercises={mockExercises}
      onStart={handleStart}
    />
  );

  const button = screen.getByText(/Start Workout/i);
  fireEvent.click(button);

  expect(handleStart).toHaveBeenCalled();
});
```

## Critical Implementation Paths

### 1. Workout Execution Flow

```
Home Dashboard → "Start Workout" →
Pre-Workout Screen (review exercises) → "Begin" →
Full-Screen Workout Mode →
  Display current exercise →
  User completes set →
  Log set (reps, weight) →
  Vibrate + Visual feedback →
  Auto-start rest timer →
  Timer completes (notification) →
  Next set or Next exercise →
Complete final set →
Workout summary (volume, PRs, duration) →
Save to history →
Return to dashboard with updated stats
```

### 2. Onboarding Flow

```
New User (no TMs saved) →
Redirect to /onboarding →
Step 1: Welcome (skip option) →
Step 2: TM Input
  - Direct entry OR
  - 1RM calculator OR
  - Recent lift estimator →
Step 3: Schedule (optional, has defaults) →
Step 4: Preview first workout →
Save data to context + storage →
Navigate to dashboard →
Show "First workout ready!" →
User taps "Start Workout"
```

### 3. PR Detection Flow

```
User logs AMRAP set →
Service compares to history →
  Check rep PRs (new 5RM, 10RM, etc.) →
  Check estimated 1RM PR →
  Check volume PR for this exercise →
If PR detected:
  Update PR records →
  Trigger celebration (vibrate + animation + snackbar) →
  Show updated stats →
  Suggest TM increase (if appropriate)
```

## DRY Principles (Don't Repeat Yourself)

### Core Philosophy

**"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."**

### Code Reuse Hierarchy

**1. Constants (Highest Priority)**

```typescript
// src/constants/workout.ts
export const WORKOUT_CONSTANTS = {
  MAX_REPS: 20,
  MIN_REPS: 1,
  DEFAULT_REST_TIME_MAIN: 300, // 5 minutes
  DEFAULT_REST_TIME_SUPPLEMENTAL: 180, // 3 minutes
  DEFAULT_REST_TIME_ASSISTANCE: 90, // 90 seconds
} as const;

// src/constants/storage.ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: "titan531_auth",
  TRAINING_MAXES: "titan531_training_maxes",
  CURRENT_CYCLE: "titan531_current_cycle",
  WORKOUT_HISTORY: "titan531_workout_history",
  USER_SETTINGS: "titan531_settings",
} as const;

// Usage
if (reps > WORKOUT_CONSTANTS.MAX_REPS) {
  throw new Error("Too many reps");
}
```

**2. Utility Functions (Pure Functions)**

```typescript
// src/utils/calculations.ts
export function calculateTM(oneRepMax: number): number {
  return Math.round(oneRepMax * 0.9);
}

export function roundToNearest(weight: number, increment: number): number {
  return Math.round(weight / increment) * increment;
}

export function calculateWorkingWeight(
  tm: number,
  percentage: number,
  roundTo: number = 2.5
): number {
  const raw = tm * percentage;
  return roundToNearest(raw, roundTo);
}

// ✅ Reusable across entire app
// ✅ Easy to test
// ✅ No side effects
```

**3. Custom Hooks (Reusable Logic)**

```typescript
// src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**4. Service Layer (Business Logic)**

```typescript
// src/services/programGenerator.ts
// ALL 5/3/1 calculation logic lives here
// Never duplicate these calculations in components

export class ProgramGenerator {
  static generate531Cycle(tms: TrainingMax[]): Cycle {
    // Single source of truth for cycle generation
  }

  static calculateWarmupSets(workingWeight: number): Exercise[] {
    // Single source of truth for warmup calculation
  }
}
```

**5. Component Composition (UI Reuse)**

```typescript
// src/components/common/ExerciseCard.tsx
export function ExerciseCard({ exercise, onEdit, onDelete }: Props) {
  // Reusable card component
}

// src/components/workout/WorkoutExerciseList.tsx
export function WorkoutExerciseList({ exercises }: Props) {
  return (
    <Stack spacing={2}>
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  );
}

// ✅ ExerciseCard reused everywhere
// ✅ No duplication of card logic
```

### DRY Red Flags (When to Refactor)

**🚩 Copy-Pasted Code**

```typescript
// ❌ BAD - Duplicated logic
function WorkoutCard1() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // ... repeated in 10 components
}

// ✅ GOOD - Extract to hook
function useDialog() {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  return { open, handleOpen, handleClose };
}
```

**🚩 Similar Functions with Variations**

```typescript
// ❌ BAD - Multiple similar functions
function calculateSquatWeight(tm: number, week: number): number { ... }
function calculateBenchWeight(tm: number, week: number): number { ... }
function calculateDeadliftWeight(tm: number, week: number): number { ... }

// ✅ GOOD - Single parameterized function
function calculateWeight(lift: Lift, tm: number, week: number): number {
  const percentages = LIFT_PERCENTAGES[lift][week];
  return calculateWorkingWeight(tm, percentages);
}
```

**🚩 Repeated Validation Logic**

```typescript
// ❌ BAD - Validation duplicated
function LoginForm() {
  if (!email.includes("@")) { ... }
}
function RegisterForm() {
  if (!email.includes("@")) { ... }
}

// ✅ GOOD - Centralized validation
// src/utils/validation.ts
export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (pwd: string) => pwd.length >= 8,
};
```

### DRY Guidelines

1. **Three Strikes Rule:** If you write something three times, extract it
2. **No Magic Numbers:** Always use named constants
3. **Single Source of Truth:** One place for each piece of logic
4. **Compose, Don't Duplicate:** Build complex from simple
5. **Test Once:** If logic is shared, test it once in isolation

## SOLID Principles

### S - Single Responsibility Principle

**"A component/function should have one, and only one, reason to change."**

**✅ Good Example:**

```typescript
// Each component has ONE job

// Fetches and manages data
function WorkoutDataProvider({ children }: Props) {
  const { data, loading, error } = useWorkouts();
  return (
    <WorkoutContext.Provider value={{ data, loading, error }}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Displays data (no data management)
function WorkoutList({ workouts }: Props) {
  return (
    <List>
      {workouts.map((w) => (
        <WorkoutListItem key={w.id} workout={w} />
      ))}
    </List>
  );
}

// Handles one workout item
function WorkoutListItem({ workout }: Props) {
  return (
    <ListItem>
      <ListItemText primary={workout.name} secondary={workout.date} />
    </ListItem>
  );
}
```

**❌ Bad Example:**

```typescript
// Component doing TOO MUCH
function WorkoutPage() {
  // Data fetching
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(setData);
  }, []);

  // Filtering
  const [filter, setFilter] = useState("");
  const filtered = data.filter((w) => w.name.includes(filter));

  // Sorting
  const [sort, setSort] = useState("date");
  const sorted = filtered.sort((a, b) => a[sort] > b[sort]);

  // Rendering
  return <>{/* Complex UI mixing concerns */}</>;
}

// Should be split into: DataProvider, FilterControls, SortControls, WorkoutList
```

### O - Open/Closed Principle

**"Software entities should be open for extension, but closed for modification."**

**✅ Extend through composition:**

```typescript
// Base button (closed for modification)
function Button({ children, ...props }: ButtonProps) {
  return <MuiButton {...props}>{children}</MuiButton>;
}

// Extend through composition (not modification)
function PrimaryButton(props: ButtonProps) {
  return <Button variant="contained" color="primary" {...props} />;
}

function LargeActionButton(props: ButtonProps) {
  return (
    <PrimaryButton
      size="large"
      sx={{ height: 64, fontSize: "1.25rem" }}
      {...props}
    />
  );
}

// ✅ Base Button never modified
// ✅ New variants added through composition
```

**✅ Extend through configuration:**

```typescript
// src/config/programs.ts
export const PROGRAM_CONFIGS = {
  original531: {
    name: "Original 5/3/1",
    weeks: 4,
    percentages: [
      [0.65, 0.75, 0.85],
      [0.7, 0.8, 0.9],
      [0.75, 0.85, 0.95],
    ],
    supplemental: null,
  },
  bbb: {
    name: "Boring But Big",
    weeks: 4,
    percentages: [
      [0.65, 0.75, 0.85],
      [0.7, 0.8, 0.9],
      [0.75, 0.85, 0.95],
    ],
    supplemental: { sets: 5, reps: 10, percentage: 0.5 },
  },
};

// Add new programs by adding config (no code changes)
```

### L - Liskov Substitution Principle

**"Objects should be replaceable with instances of their subtypes without altering correctness."**

```typescript
// Base interface
interface Storage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

// Implementations are interchangeable
class LocalStorageAdapter implements Storage {
  async get<T>(key: string): Promise<T | null> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

class SQLiteAdapter implements Storage {
  async get<T>(key: string): Promise<T | null> {
    // SQLite implementation
  }
  async set<T>(key: string, value: T): Promise<void> {
    // SQLite implementation
  }
}

// Consumer doesn't care which implementation
function useStorage(storage: Storage) {
  // Works with ANY Storage implementation
  const data = await storage.get("key");
  await storage.set("key", newData);
}

// ✅ Can swap LocalStorage for SQLite without changing consumers
```

### I - Interface Segregation Principle

**"No client should be forced to depend on methods it does not use."**

**✅ Small, focused interfaces:**

```typescript
// ❌ BAD - Fat interface
interface WorkoutActions {
  startWorkout(): void;
  pauseWorkout(): void;
  resumeWorkout(): void;
  endWorkout(): void;
  logSet(reps: number, weight: number): void;
  deleteSet(id: string): void;
  addExercise(exercise: Exercise): void;
  deleteExercise(id: string): void;
  saveNotes(notes: string): void;
  // ... 10 more methods
}

// ✅ GOOD - Segregated interfaces
interface WorkoutLifecycle {
  start(): void;
  pause(): void;
  resume(): void;
  end(): void;
}

interface SetLogger {
  logSet(reps: number, weight: number): void;
  deleteSet(id: string): void;
}

interface ExerciseManager {
  addExercise(exercise: Exercise): void;
  deleteExercise(id: string): void;
}

// Components only depend on what they need
function WorkoutControls({ workout }: { workout: WorkoutLifecycle }) {
  return (
    <>
      <Button onClick={workout.start}>Start</Button>
      <Button onClick={workout.pause}>Pause</Button>
    </>
  );
}
```

**✅ Minimal component props:**

```typescript
// ❌ BAD - Component receives unnecessary props
function ExerciseCard({
  exercise,
  userProfile,
  appSettings,
  themeConfig,
  navigationState,
  onEdit,
  onDelete,
}: Props) {
  // Only uses exercise, onEdit, onDelete
}

// ✅ GOOD - Only necessary props
function ExerciseCard({ exercise, onEdit, onDelete }: Props) {
  // Receives only what it needs
}
```

### D - Dependency Inversion Principle

**"Depend upon abstractions, not concretions."**

**✅ Depend on interfaces, not implementations:**

```typescript
// ❌ BAD - Direct dependency on implementation
class WorkoutLogger {
  private storage = new LocalStorageAdapter(); // Concrete dependency

  async save(workout: Workout) {
    await this.storage.set("workout", workout);
  }
}

// ✅ GOOD - Dependency on abstraction
interface Storage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

class WorkoutLogger {
  constructor(private storage: Storage) {} // Abstract dependency

  async save(workout: Workout) {
    await this.storage.set("workout", workout);
  }
}

// Can inject ANY storage implementation
const logger1 = new WorkoutLogger(new LocalStorageAdapter());
const logger2 = new WorkoutLogger(new SQLiteAdapter());
const logger3 = new WorkoutLogger(new SupabaseAdapter());
```

**✅ Service layer abstracts implementation:**

```typescript
// Components depend on service interface, not Supabase directly
interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

// Implementation hidden
class SupabaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return data.user;
  }
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }
}

// Can swap to different auth provider later
class FirebaseAuthService implements AuthService {
  // Different implementation, same interface
}
```

## Architectural Decisions

### ✅ Decided

1. **Context API over Redux:** Simpler for our scale, less boilerplate
2. **localStorage First:** Faster MVP, migrate to SQLite later
3. **Service Layer:** All calculations in pure functions, testable
4. **MUI Components:** Leverage comprehensive component library
5. **Dark Mode Default:** Better for gym environment
6. **Local-First:** App works offline, sync when online (premium)
7. **DRY/SOLID First:** All code must follow these principles
8. **Feature-Based Organization:** Group by feature when complexity warrants

### 🤔 To Be Decided

1. **State Management Growth:** When to introduce Zustand/Redux?
2. **SQLite Migration:** When does localStorage become limiting?
3. **Caching Strategy:** React Query vs custom implementation?
4. **Animation Library:** Framer Motion vs MUI built-in?

### ❌ Rejected

1. **Native Mobile Apps:** Capacitor is sufficient
2. **GraphQL:** REST/Supabase SDK is simpler
3. **Class Components:** Functional components only
4. **Styled Components:** MUI theming + sx prop is enough
5. **Monolithic Files:** Split into focused, single-purpose files
6. **God Objects:** No components/services with >5 responsibilities

## File Organization Standards

### Strict Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/             # Generic components (Button, Card, Input)
│   ├── forms/              # Form-specific components
│   ├── layout/             # Layout components (Header, Footer, Nav)
│   ├── workout/            # Workout-specific components
│   └── index.ts            # Public exports
├── pages/                  # Route-level components (one per route)
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   └── index.ts
├── features/               # Feature modules (for complex features)
│   └── onboarding/
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── services/       # Feature-specific services
│       ├── types.ts        # Feature types
│       └── index.ts        # Public API
├── context/                # React Context providers
│   ├── AuthContext.tsx
│   ├── ProgramContext.tsx
│   └── index.ts
├── hooks/                  # Reusable custom hooks
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useWorkoutTimer.ts
│   └── index.ts
├── services/               # Business logic layer (pure functions)
│   ├── programGenerator.ts
│   ├── calculations.ts
│   ├── storage.ts
│   └── index.ts
├── utils/                  # Pure utility functions
│   ├── calculations.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── index.ts
├── types/                  # TypeScript type definitions
│   ├── workout.ts
│   ├── user.ts
│   └── index.ts
├── constants/              # App-wide constants
│   ├── workout.ts
│   ├── storage.ts
│   ├── routes.ts
│   └── index.ts
├── config/                 # Configuration files
│   ├── programs.ts
│   └── theme.ts
└── assets/                 # Static assets
    ├── images/
    └── icons/
```

### File Naming Conventions

**Components:**

- Format: `PascalCase.tsx`
- Examples: `WorkoutCard.tsx`, `ExerciseList.tsx`, `TMInputStep.tsx`
- One component per file (unless tightly coupled helper components)

**Hooks:**

- Format: `camelCase.ts` with `use` prefix
- Examples: `useWorkoutTimer.ts`, `useDebounce.ts`, `useLocalStorage.ts`
- One hook per file

**Services:**

- Format: `camelCase.ts`
- Examples: `programGenerator.ts`, `calculations.ts`, `storageService.ts`
- Group related functions in same file

**Utils:**

- Format: `camelCase.ts`
- Examples: `calculations.ts`, `validation.ts`, `dateFormatting.ts`
- Pure functions only

**Types:**

- Format: `camelCase.ts`
- Examples: `workout.ts`, `user.ts`, `common.ts`
- Group related types

**Constants:**

- Format: `UPPER_SNAKE_CASE.ts` or `camelCase.ts`
- Examples: `workout.ts`, `storage.ts`
- Export const objects with UPPER_SNAKE_CASE properties

### Component File Structure (Required Order)

```typescript
// 1. External imports (grouped and sorted)
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent } from "@mui/material";

// 2. Internal imports (grouped by type)
import { WorkoutCard } from "@/components/workout";
import { useProgram } from "@/context/ProgramContext";
import { calculateWeight } from "@/services/programGenerator";
import { WORKOUT_CONSTANTS } from "@/constants/workout";
import type { Workout, Exercise } from "@/types/workout";

// 3. Types/Interfaces (specific to this file)
interface WorkoutListProps {
  workouts: Workout[];
  onSelect: (id: string) => void;
}

interface WorkoutItemState {
  expanded: boolean;
  selected: boolean;
}

// 4. Constants (file-specific, use UPPER_SNAKE_CASE)
const MAX_VISIBLE_WORKOUTS = 10;
const ANIMATION_DURATION = 300;

// 5. Main component export
export function WorkoutList({ workouts, onSelect }: WorkoutListProps) {
  // 5a. Hooks (in standard order)
  // - State hooks first
  const [state, setState] = useState<WorkoutItemState>({
    expanded: false,
    selected: false,
  });

  // - Context hooks
  const { currentCycle } = useProgram();

  // - Router hooks
  const navigate = useNavigate();

  // - Custom hooks
  const { data, loading } = useWorkouts();

  // 5b. Derived values (useMemo, calculations)
  const visibleWorkouts = useMemo(() => {
    return workouts.slice(0, MAX_VISIBLE_WORKOUTS);
  }, [workouts]);

  const totalVolume = useMemo(() => {
    return calculateTotalVolume(workouts);
  }, [workouts]);

  // 5c. Event handlers (useCallback when passed as props)
  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      navigate(`/workout/${id}`);
    },
    [onSelect, navigate]
  );

  const handleExpand = useCallback(() => {
    setState((prev) => ({ ...prev, expanded: !prev.expanded }));
  }, []);

  // 5d. Effects (useEffect)
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, []);

  // 5e. Early returns (loading, error, empty states)
  if (loading) return <LoadingSpinner />;
  if (!workouts.length) return <EmptyState />;

  // 5f. Render
  return (
    <Card>
      <CardContent>
        {visibleWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onSelect={handleSelect}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// 6. Helper components (if small and tightly coupled)
function LoadingSpinner() {
  return <CircularProgress />;
}

function EmptyState() {
  return <Typography>No workouts yet</Typography>;
}

// 7. Helper functions (prefer utils/ for reusable ones)
function calculateTotalVolume(workouts: Workout[]): number {
  return workouts.reduce((sum, w) => sum + w.volume, 0);
}

// 8. Type guards (if needed)
function isValidWorkout(workout: unknown): workout is Workout {
  return (
    typeof workout === "object" &&
    workout !== null &&
    "id" in workout &&
    "name" in workout
  );
}
```

### Index Files (Public API Pattern)

**Purpose:** Control what's exported from a directory

```typescript
// src/components/workout/index.ts
export { WorkoutCard } from "./WorkoutCard";
export { WorkoutList } from "./WorkoutList";
export { ExerciseCard } from "./ExerciseCard";
// Do NOT export internal helper components

// src/services/index.ts
export { generate531Cycle, calculateWorkingWeight } from "./programGenerator";
export { calculateTM, roundToNearest } from "./calculations";
// Do NOT export internal helper functions

// src/hooks/index.ts
export { useWorkoutTimer } from "./useWorkoutTimer";
export { useLocalStorage } from "./useLocalStorage";
export { useDebounce } from "./useDebounce";
```

**Import Usage:**

```typescript
// ✅ GOOD - Import from index
import { WorkoutCard, WorkoutList } from "@/components/workout";
import { generate531Cycle } from "@/services";

// ❌ BAD - Import directly from file
import { WorkoutCard } from "@/components/workout/WorkoutCard";
```

### Code Organization Rules

**1. No Magic Numbers/Strings**

```typescript
// ❌ BAD
if (reps > 20) {
  return "Too many reps";
}
localStorage.setItem("titan531_tms", data);
navigate("/workout");

// ✅ GOOD
import { WORKOUT_CONSTANTS } from "@/constants/workout";
import { STORAGE_KEYS } from "@/constants/storage";
import { ROUTES } from "@/constants/routes";

if (reps > WORKOUT_CONSTANTS.MAX_REPS) {
  return "Too many reps";
}
localStorage.setItem(STORAGE_KEYS.TRAINING_MAXES, data);
navigate(ROUTES.WORKOUT);
```

**2. Group Related Logic**

```typescript
// ✅ GOOD - Related logic together
// src/services/workoutCalculations.ts
export function calculateWorkingWeight(tm: number, percentage: number): number {
  const raw = tm * percentage;
  return roundToNearest(raw, 2.5);
}

export function calculateWarmupSets(workingWeight: number): Exercise[] {
  return [
    { weight: workingWeight * 0.4, reps: 5 },
    { weight: workingWeight * 0.5, reps: 5 },
    { weight: workingWeight * 0.6, reps: 3 },
  ];
}

export function calculateAMRAPTarget(week: number): number {
  return AMRAP_TARGETS[week];
}

// ❌ BAD - Scattered across multiple files
// calculateWorkingWeight in calculations.ts
// calculateWarmupSets in warmups.ts
// calculateAMRAPTarget in amrap.ts
```

**3. Feature-Based Organization (for complex features)**

```
src/features/onboarding/
├── components/
│   ├── WelcomeStep.tsx
│   ├── TMInputStep.tsx
│   ├── ScheduleStep.tsx
│   └── PreviewStep.tsx
├── hooks/
│   ├── useOnboardingState.ts
│   └── useTMCalculator.ts
├── services/
│   └── onboardingService.ts
├── types.ts
└── index.ts              # Exports: Onboarding component

// Consumer just imports the feature
import { Onboarding } from "@/features/onboarding";
```

**4. Consistent File Size Guidelines**

- **Components:** 150-300 lines max (split if larger)
- **Services:** 200-400 lines max (one responsibility)
- **Utils:** 100-200 lines max (related functions)
- **Hooks:** 50-150 lines max (single purpose)

**5. Import Order (Enforced by ESLint)**

```typescript
// 1. React and framework imports
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 2. Third-party libraries
import { Button, Card } from "@mui/material";
import { format } from "date-fns";

// 3. Internal absolute imports (grouped by type)
import { WorkoutCard } from "@/components/workout";
import { useProgram } from "@/context/ProgramContext";
import { generate531Cycle } from "@/services";
import { WORKOUT_CONSTANTS } from "@/constants/workout";
import type { Workout } from "@/types/workout";

// 4. Relative imports (if any, prefer absolute)
import { helperFunction } from "./utils";
```

### When to Create a New Directory

**Create `features/` directory when:**

- Feature has 3+ components
- Feature has custom hooks
- Feature has its own business logic
- Feature could be reused in other projects

**Keep in `components/` when:**

- Single, reusable component
- Simple presentational component
- No feature-specific logic

**Example Decision Tree:**

```
Onboarding Wizard (4 steps, custom hooks, validation)
→ Create: src/features/onboarding/

Exercise Card (displays exercise data)
→ Keep: src/components/workout/ExerciseCard.tsx

Rest Timer (stateful, but generic)
→ Keep: src/components/common/RestTimer.tsx
```

### File Organization Anti-Patterns

**❌ Don't:**

1. **Utils Dumping Ground**

```typescript
// ❌ BAD - utils/helpers.ts with 50 unrelated functions
export function formatDate() {}
export function calculateWeight() {}
export function validateEmail() {}
export function sortWorkouts() {}
// ... 46 more
```

2. **Component Folders Without Index**

```
components/workout/
├── WorkoutCard.tsx
├── WorkoutList.tsx
└── ExerciseCard.tsx
// ❌ No index.ts - consumers must import from individual files
```

3. **Mixed Concerns in Services**

```typescript
// ❌ BAD - service doing UI and business logic
export class WorkoutService {
  async loadWorkout() {
    const data = await api.get();
    showSnackbar("Loaded!"); // UI concern
    return data;
  }
}
```

4. **Nested Feature Directories**

```
features/
└── workout/
    └── features/        // ❌ No nested features
        └── timer/
```

**✅ Do:**

1. **Organized Utils**

```typescript
// utils/date.ts
export function formatDate() {}
export function parseDate() {}

// utils/calculations.ts
export function calculateWeight() {}
export function roundToNearest() {}

// utils/validation.ts
export function validateEmail() {}
export function validatePassword() {}
```

2. **Proper Exports**

```typescript
// components/workout/index.ts
export { WorkoutCard } from "./WorkoutCard";
export { WorkoutList } from "./WorkoutList";
```

3. **Separated Concerns**

```typescript
// services/workoutService.ts (pure logic)
export async function loadWorkout() {
  return await api.get();
}

// components/WorkoutLoader.tsx (UI concerns)
function WorkoutLoader() {
  const workout = await loadWorkout();
  showSnackbar("Loaded!");
  return <Workout data={workout} />;
}
```
