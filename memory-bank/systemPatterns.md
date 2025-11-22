# System Patterns: Titan 5/3/1

## Architecture Overview

Titan 5/3/1 follows a **client-side, feature-based architecture** with clear separation of concerns and a service-oriented design pattern.

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  (Root Component, View Routing, Theme)          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              UIProvider (Context)                │
│     (Toast, Modal, Install Prompt State)        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           useAppController (Hook)                │
│  (Central State Management & Business Logic)    │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌──────────────┐           ┌──────────────┐
│   Services   │           │  Components  │
│  (Logic)     │           │  (UI)        │
└──────────────┘           └──────────────┘
        ↓                           ↓
┌──────────────┐           ┌──────────────┐
│ localStorage │           │    Layout    │
│  (Persist)   │           │   Features   │
└──────────────┘           └──────────────┘
```

## Project Structure

### Directory Organization

```
titan-531/
├── components/          # Shared UI components
│   ├── Button.tsx
│   ├── ErrorBoundary.tsx
│   ├── Layout.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── ...
├── context/            # React Context providers
│   └── UIContext.tsx
├── features/           # Feature modules (domain-driven)
│   ├── coaching/
│   ├── history/
│   ├── settings/
│   ├── shared/
│   ├── tools/
│   └── workout/
├── hooks/              # Custom React hooks
│   ├── useAppController.ts
│   ├── useLocalStorage.ts
│   └── useRestTimer.ts
├── services/           # Business logic & utilities
│   ├── analytics/
│   ├── api/
│   ├── core/
│   └── platform/
├── types/              # TypeScript type definitions
│   ├── common.ts
│   ├── index.ts
│   ├── user.ts
│   └── workout.ts
├── utils/              # Pure utility functions
│   ├── imageUtils.ts
│   └── plateMath.ts
├── App.tsx             # Root component
├── constants.ts        # App-wide constants
├── index.tsx          # Entry point
├── translations.ts    # i18n strings
└── ...
```

### Design Pattern: Feature-Based Organization

Each feature is self-contained with its own components, organized by domain:

```
features/
├── coaching/           # AI coach, form checks
├── history/           # Workout history, calendar
├── settings/          # Profile, preferences, export/import
├── shared/            # Cross-feature components (Dashboard, Onboarding)
├── tools/             # Calculators, timers, utilities
└── workout/           # Active workout, cycle management
```

**Benefits**:

- Clear domain boundaries
- Easy to locate related code
- Scalable as features grow
- Reduces merge conflicts

## State Management Strategy

### Three-Tier State Architecture

#### 1. Application State (useAppController)

Central hook managing all core application data:

```typescript
// hooks/useAppController.ts
export const useAppController = () => {
  // Profile Management
  const [rootProfile, setRootProfile] = useLocalStorage<UserProfile>(
    "titan_profile",
    defaultProfile
  );
  const [viewingProfileId, setViewingProfileId] = useLocalStorage<string>(
    "viewing_profile",
    "root"
  );

  // Workout State
  const [activeSession, setActiveSession] =
    useLocalStorage<WorkoutSession | null>("active_session", null);

  // History
  const [history, setHistory] = useLocalStorage<WorkoutSession[]>(
    "workout_history",
    []
  );

  // UI State
  const [view, setView] = useState<AppView>(AppView.Dashboard);
  const [showCycleTransition, setShowCycleTransition] = useState(false);
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<
    string | null
  >(null);

  // Computed State
  const activeProfile = useMemo(() => {
    /* calculate active profile */
  }, [rootProfile, viewingProfileId]);
  const activeHistory = useMemo(() => {
    /* filter history */
  }, [history, viewingProfileId]);

  // Business Logic Methods
  const startWorkout = (lift: LiftType) => {
    /* ... */
  };
  const completeWorkout = () => {
    /* ... */
  };
  const confirmCycleTransition = () => {
    /* ... */
  };

  return {
    /* all state & methods */
  };
};
```

**Responsibilities**:

- Manage user profiles (root + clients)
- Handle active workout session
- Maintain workout history
- Control view navigation
- Execute business logic via service calls
- Synchronize state with localStorage

**Pattern**: Centralized state management without external library (Redux, Zustand)

#### 2. UI Context State (UIContext)

Manages ephemeral UI state shared across components:

```typescript
// context/UIContext.tsx
interface UIContextType {
  toast: { message: string; type: string } | null;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  installPrompt: any;
  setInstallPrompt: (prompt: any) => void;
}
```

**Responsibilities**:

- Toast notifications
- PWA install prompt state
- Global UI flags

**Pattern**: React Context API for cross-cutting UI concerns

#### 3. Local Component State

Individual components manage their own transient state:

```typescript
// Example: ActiveWorkout.tsx
const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
const [isResting, setIsResting] = useState(false);
const [showPlateCalc, setShowPlateCalc] = useState(false);
```

**Pattern**: useState for component-scoped state

### State Persistence Pattern

All critical data persists to localStorage via custom hook:

```typescript
// hooks/useLocalStorage.ts
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}
```

**Key localStorage Keys**:

- `titan_profile`: Root profile (includes clients array)
- `titan_profile_<clientId>`: Individual client profiles
- `workout_history`: All workout sessions
- `active_session`: Current in-progress workout
- `viewing_profile`: Current active profile ID
- `titan_version`: App version for update detection

## Service Layer Architecture

Services encapsulate business logic, keeping components thin and focused on rendering.

### Service Categories

#### 1. Core Services (`services/core/`)

**workoutLogic.ts**

- Generates workout sessions from profile data
- Calculates working weights based on training maxes
- Applies program-specific supplemental schemes
- Handles AMRAP calculations

```typescript
export const generateWorkoutSession = (
  profile: UserProfile,
  lift: LiftType
): WorkoutSession => {
  const tm = profile.trainingMaxes[lift];
  const week = profile.currentWeek;
  const percentages = WEEK_MULTIPLIERS[week];

  // Generate warmup sets
  const warmupSets = generateWarmupSets(tm, profile.warmupSettings);

  // Generate main work sets
  const mainSets = generateMainSets(tm, week, percentages);

  // Generate supplemental sets based on program
  const supplementalSets = generateSupplementalSets(
    profile.selectedProgram,
    tm,
    week
  );

  // Add assistance work
  const assistanceExercises = generateAssistance(
    lift,
    profile.customAssistance
  );

  return {
    /* constructed session */
  };
};
```

**profileLogic.ts**

- Calculates suggested training max increases
- Validates profile data
- Generates default configurations

**scheduleService.ts**

- Determines training schedule
- Calculates next workout date
- Manages rest day logic

#### 2. Analytics Services (`services/analytics/`)

**analyticsLogic.ts**

- Computes volume metrics (sets × reps × weight)
- Calculates intensity averages
- Tracks PR achievements
- Generates trend data for charts

**achievementLogic.ts**

- Checks achievement unlock conditions
- Manages achievement state
- Triggers unlock notifications

#### 3. API Services (`services/api/`)

**geminiService.ts**

- Interfaces with Google Gemini API
- Sends workout data for analysis
- Processes form check images
- Handles AI chat interactions

```typescript
export const analyzeFormCheck = async (
  imageData: string,
  lift: LiftType,
  apiKey: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this ${lift} form. Provide specific technique feedback...`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: imageData } },
  ]);

  return result.response.text();
};
```

#### 4. Platform Services (`services/platform/`)

**audioService.ts**

- Text-to-speech announcements
- Sound effects (rest timer end, achievement unlock)
- Voice coaching cues

**notificationService.ts**

- Browser notifications
- Service worker integration
- Timer completion alerts

**shareService.ts**

- Web Share API integration
- Screenshot generation
- Social sharing capabilities

### Service Design Principles

1. **Pure Functions**: Services should be stateless, taking inputs and returning outputs
2. **No Side Effects**: Services don't directly modify global state
3. **Testable**: Easy to unit test in isolation
4. **Composable**: Services can call other services
5. **Type-Safe**: Full TypeScript coverage

## Component Patterns

### Component Hierarchy

```
App (Root)
└─ ErrorBoundary
   └─ UIProvider
      └─ Layout
         ├─ Navigation (Bottom Tabs)
         └─ View Content
            ├─ Dashboard
            ├─ ActiveWorkout
            ├─ History
            ├─ Profile
            ├─ Tools
            ├─ Settings
            └─ AICoach
```

### Component Types

#### 1. Container Components (Features)

Handle data fetching and business logic, pass props to presentational components:

```typescript
// features/workout/ActiveWorkout.tsx
export const ActiveWorkout: React.FC<Props> = ({ session, onComplete, ... }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const timer = useRestTimer(defaultRestTime);

  const handleSetComplete = (exerciseIndex: number, setIndex: number) => {
    // Business logic
    const updatedSession = { ...session };
    updatedSession.exercises[exerciseIndex].sets[setIndex].completed = true;
    onUpdateSession(updatedSession);

    // Start rest timer
    timer.start(getRestTimeForExercise(exercise.type));
  };

  return (
    <div>
      <ExerciseDisplay exercise={currentExercise} />
      <SetRow sets={currentSets} onComplete={handleSetComplete} />
      <RestTimer {...timer} />
    </div>
  );
};
```

#### 2. Presentational Components (Shared)

Pure UI components receiving all data via props:

```typescript
// components/Button.tsx
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  onClick,
  disabled,
  children,
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold";
  const variantClasses = {
    primary: "bg-theme text-white hover:bg-theme-secondary",
    secondary: "bg-slate-700 text-white hover:bg-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### 3. Layout Components

Structure and navigation:

```typescript
// components/Layout.tsx
export const Layout: React.FC<Props> = ({
  currentView,
  onChangeView,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <main className="pb-20">{children}</main>
      <BottomNav currentView={currentView} onChangeView={onChangeView} />
    </div>
  );
};
```

### Performance Optimizations

#### 1. Lazy Loading

Major views are lazy-loaded to reduce initial bundle size:

```typescript
// App.tsx
const ActiveWorkout = React.lazy(() =>
  import("./features/workout/ActiveWorkout").then((m) => ({
    default: m.ActiveWorkout,
  }))
);

// Usage with Suspense
<Suspense fallback={<Loader />}>
  {view === AppView.Workout && <ActiveWorkout {...props} />}
</Suspense>;
```

**Views Lazy Loaded**:

- ActiveWorkout
- Dashboard
- History
- Profile
- Settings
- Tools
- AI Coach
- Nutrition
- Conditioning

**Result**: Initial bundle ~200KB, lazy chunks load on demand

#### 2. Memoization

Expensive computations are memoized:

```typescript
const activeProfile = useMemo(() => {
  return viewingProfileId === "root"
    ? rootProfile
    : rootProfile.clients?.find((c) => c.id === viewingProfileId) ||
        rootProfile;
}, [rootProfile, viewingProfileId]);

const activeHistory = useMemo(() => {
  return history.filter(
    (s) =>
      s.profileId === viewingProfileId ||
      (!s.profileId && viewingProfileId === "root")
  );
}, [history, viewingProfileId]);
```

#### 3. Component Splitting

Large components split into sub-components:

```typescript
// features/workout/ActiveWorkout.tsx
// Main component delegates to specialized sub-components
<ActiveWorkout>
  <WorkoutHeader />
  <ExerciseList>
    <ExerciseCard>
      <SetRow />
      <SetRow />
    </ExerciseCard>
  </ExerciseList>
  <RestTimer />
  <WorkoutControls />
</ActiveWorkout>
```

## Data Flow Patterns

### Unidirectional Data Flow

```
User Action
    ↓
Event Handler (Component)
    ↓
useAppController Method
    ↓
Service Function (Business Logic)
    ↓
State Update (localStorage sync)
    ↓
Re-render (React)
    ↓
UI Update
```

**Example: Completing a Set**

```typescript
// 1. User clicks "Complete Set" button
<Button onClick={() => handleSetComplete(exerciseIdx, setIdx)} />;

// 2. Event handler in ActiveWorkout component
const handleSetComplete = (exerciseIdx: number, setIdx: number) => {
  const updatedSession = { ...session };
  updatedSession.exercises[exerciseIdx].sets[setIdx].completed = true;

  // 3. Call parent handler from useAppController
  onUpdateSession(updatedSession);

  // 4. Start rest timer
  restTimer.start(restTimeForExercise);
};

// 5. In useAppController
const updateSession = (session: WorkoutSession) => {
  setActiveSession(session); // Syncs to localStorage automatically
};

// 6. React re-renders with new session state
// 7. UI updates: checkmark appears, timer starts
```

### Event Flow Patterns

#### 1. Completion Events

Workout completion triggers multiple side effects:

```typescript
const completeWorkout = () => {
  if (!activeSession) return;

  // 1. Add to history
  const completedSession = {
    ...activeSession,
    completed: true,
    durationSeconds: calculateDuration(),
  };
  setHistory([...history, completedSession]);

  // 2. Update profile stats
  const updatedProfile = updateProfileAfterWorkout(
    activeProfile,
    completedSession
  );
  saveProfile(updatedProfile);

  // 3. Check achievements
  const newAchievements = checkAchievements(updatedProfile, history);
  if (newAchievements.length > 0) {
    setNewUnlockedAchievement(newAchievements[0]);
    updatedProfile.achievements.push(...newAchievements);
  }

  // 4. Clear active session
  setActiveSession(null);

  // 5. Navigate to dashboard
  setView(AppView.Dashboard);

  // 6. Show toast
  showToast("Workout completed!", "success");
};
```

#### 2. Cycle Transition

End of cycle triggers modal with transition logic:

```typescript
// User clicks "Finish Cycle" on Dashboard
<Button onClick={() => setShowCycleTransition(true)} />

// Modal appears with cycle summary
<CycleTransition
  isOpen={showCycleTransition}
  profile={activeProfile}
  history={activeHistory}
  onConfirm={confirmCycleTransition}
  onCancel={() => setShowCycleTransition(false)}
/>

// User confirms transition
const confirmCycleTransition = (adjustedTMs: Record<LiftType, number>) => {
  const updatedProfile = {
    ...activeProfile,
    currentCycle: activeProfile.currentCycle + 1,
    currentWeek: 1,
    trainingMaxes: adjustedTMs
  };
  saveProfile(updatedProfile);
  setShowCycleTransition(false);
  showToast("New cycle started!", "success");
};
```

## Error Handling Strategy

### Layered Error Handling

#### 1. Error Boundary (Top Level)

Catches render errors and provides fallback UI:

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Could log to external service in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### 2. Service Level Error Handling

Services handle API errors gracefully:

```typescript
// services/api/geminiService.ts
export const getWorkoutInsights = async (profile, history, apiKey) => {
  try {
    const response = await model.generateContent(prompt);
    return response.text();
  } catch (error) {
    if (error.message.includes("API_KEY")) {
      throw new Error("Invalid API key. Please check your settings.");
    } else if (error.message.includes("RATE_LIMIT")) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else {
      throw new Error("Failed to get AI insights. Please try again.");
    }
  }
};
```

#### 3. Component Level Error Handling

Components show user-friendly error states:

```typescript
const AICoachView = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeWorkout(profile, history, apiKey);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      {loading && <Spinner />}
      {/* ... */}
    </div>
  );
};
```

#### 4. localStorage Error Handling

Graceful degradation if localStorage fails:

```typescript
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue; // Fall back to initial value
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      // Still update state even if persistence fails
      setStoredValue(value);
      // Show toast to user
      showToast("Storage limit reached. Consider exporting data.", "error");
    }
  };

  return [storedValue, setValue];
};
```

## Type System Patterns

### Discriminated Unions

Used for type-safe state management:

```typescript
// types/common.ts
export enum AppView {
  Dashboard = "dashboard",
  Workout = "workout",
  History = "history",
  Profile = "profile",
  // ...
}

export enum LiftType {
  Squat = "Squat",
  Bench = "Bench",
  Deadlift = "Deadlift",
  Overhead = "Overhead Press",
}

export type ProgramType =
  | "Original"
  | "BBB"
  | "FSL"
  | "Beginner"
  | "BBS"
  | "Monolith";
```

### Conditional Types

Workout sessions have different shapes based on type:

```typescript
interface WorkoutSession {
  id: string;
  date: string;
  type: "Strength" | "Conditioning";
  lift: LiftType | "Conditioning";

  // Strength-specific
  exercises: Exercise[];

  // Conditioning-specific
  conditioningData?: ConditioningData;
}
```

### Generic Utility Types

Reusable type transformations:

```typescript
type RequiredProfile = Required<UserProfile>; // All fields required
type PartialUpdate = Partial<UserProfile>; // All fields optional
type ProfileKeys = keyof UserProfile; // Union of all keys
type TrainingMaxRecord = Record<LiftType, number>; // Map of lifts to numbers
```

## Critical Implementation Paths

### Path 1: Workout Generation

```
User clicks "Start Squat Workout"
    ↓
useAppController.startWorkout(LiftType.Squat)
    ↓
workoutLogic.generateWorkoutSession(profile, 'Squat')
    ↓
├─ Generate warmup sets (40%, 50%, 60%)
├─ Generate main work sets (week-specific percentages)
├─ Generate supplemental sets (program-specific)
└─ Add assistance exercises (from customAssistance)
    ↓
Create WorkoutSession object with unique ID
    ↓
setActiveSession(newSession) // Saves to localStorage
    ↓
setView(AppView.Workout) // Navigate to workout
    ↓
ActiveWorkout component renders with session data
```

### Path 2: Weight Calculation

```
Training Max (TM) = 225 lbs
Week = 1 (5/5/5+ week)
Percentages = [0.65, 0.75, 0.85]
    ↓
Set 1: 225 × 0.65 = 146.25 → Round to 145 lbs (5 reps)
Set 2: 225 × 0.75 = 168.75 → Round to 170 lbs (5 reps)
Set 3: 225 × 0.85 = 191.25 → Round to 190 lbs (5+ reps AMRAP)
    ↓
Rounding respects profile.rounding setting (2.5 or 5)
    ↓
Sets created with correct weight, reps, isAmrap flag
```

### Path 3: Cycle Progression Logic

```
User completes Week 4 (Deload)
    ↓
Dashboard shows "Finish Cycle" button
    ↓
User clicks → CycleTransition modal opens
    ↓
Modal calculates suggested TM increases:
    ├─ If AMRAP reps ≥ 10: Increase TM by 10 lbs (lower) or 5 lbs (upper)
    ├─ If AMRAP reps 5-9: Keep TM same
    └─ If AMRAP reps < 5: Decrease TM by 10%
    ↓
User reviews and can manually adjust
    ↓
User confirms → confirmCycleTransition()
    ↓
Update profile:
    ├─ currentCycle += 1
    ├─ currentWeek = 1
    └─ trainingMaxes = new values
    ↓
Save profile → localStorage updated
    ↓
Modal closes, dashboard refreshes with Cycle 2, Week 1
```

### Path 4: AI Form Check

```
User navigates to AI Coach → Form Check
    ↓
User uploads photo of squat
    ↓
Image converted to base64 dataURL
    ↓
geminiService.analyzeFormCheck(imageData, 'Squat', apiKey)
    ↓
Construct prompt: "Analyze squat form. Check: bar path, depth, knee tracking, back angle..."
    ↓
Send to Gemini Vision API with image
    ↓
API returns analysis text
    ↓
Display in chat interface
    ↓
User can ask follow-up questions in conversation
```

## Progressive Web App (PWA) Architecture

### Service Worker Strategy

```typescript
// service-worker.js
const CACHE_NAME = "titan-531-v1.2.1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  // Static assets cached during install
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Offline Strategy

- **Core UI**: Fully cached, works offline
- **Static Assets**: Cached on install
- **Dynamic Data**: Stored in localStorage (always available)
- **AI Features**: Gracefully degrade when offline (show error message)
- **Images**: Base64-encoded in localStorage (limited by storage)

### Install Prompt Handling

```typescript
// App.tsx
useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    setInstallPrompt(e); // Store for later use
  };
  window.addEventListener("beforeinstallprompt", handler);
  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);

// User can trigger install from Settings
const handleInstall = () => {
  if (installPrompt) {
    installPrompt.prompt();
    installPrompt.userChoice.then((result) => {
      if (result.outcome === "accepted") {
        showToast("App installed!", "success");
      }
      setInstallPrompt(null);
    });
  }
};
```

## Testing Strategy (Conceptual)

While not implemented, the architecture supports:

### Unit Tests

- Service functions (pure, testable)
- Utility functions (plateMath, imageUtils)
- Custom hooks (useLocalStorage, useRestTimer)

### Integration Tests

- useAppController workflows
- Complete user flows (start workout → complete → save)

### E2E Tests

- Full user journeys
- PWA installation
- Offline functionality

## Performance Considerations

### Bundle Size Management

- Lazy loading reduces initial bundle
- Tree-shaking removes unused code
- Vite optimizes production builds

### Runtime Performance

- Memoization prevents unnecessary recalculations
- LocalStorage operations are synchronous but fast
- Lazy components only load when needed

### Memory Management

- No memory leaks: cleanup in useEffect hooks
- Large histories could grow localStorage
- Images stored as base64 (consider compression)

## Security Considerations

### Data Privacy

- No backend, no data leaves device
- API key stored in localStorage (user-controlled)
- No analytics or tracking (except version check)

### Input Validation

- Weight calculations validated
- File uploads checked for size/type
- localStorage quota errors handled

### XSS Prevention

- React escapes all strings automatically
- User-generated content sanitized
- No eval() or innerHTML usage
