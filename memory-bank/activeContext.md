# Active Context - Titan 531

## Current Focus

**Phase Status:** Phase 2a (Setup & Structure) Complete → Phase 2b (Workout Interface) Complete → Phase 3 (Premium Features) Next

**Immediate Priority:** Verify the workout flow and prepare for data persistence improvements or premium features.

**Active Work Stream:** Completed Phase 2b implementation.

## Recent Changes

### Phase 2b Completion (✅ Complete)

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

   - `RestTimer.tsx`: Visual countdown with CircularProgress, add/skip controls
   - `SetLogger.tsx`: Interface for logging regular and AMRAP sets, weight adjustment
   - `useRestTimer.ts`: Custom hook for timer logic

4. **Integration**
   - Updated `Home.tsx` to navigate to PreWorkout/ActiveWorkout
   - Updated `App.tsx` with new routes
   - Defined `WORKOUT_UI_CONSTANTS` for consistent styling

**Current State:**

- Users can start a workout from the dashboard
- Navigate through exercises and sets
- Log sets (mock implementation for now, logs to console)
- Use rest timer between sets
- Complete workout and return to dashboard

### Phase 2a Completion (✅ Complete)

**What Was Built:**

1. **Core Data Structure**

   - Defined `TrainingMax`, `Cycle`, `Workout`, `Exercise` types
   - Extended UserProfile

2. **Program Logic Engine**

   - Implemented `programGenerator.ts` with 5/3/1 calculations
   - Defined constants in `src/constants/workout.ts`

3. **State Management**

   - Created `ProgramContext` with localStorage persistence
   - Implemented `useProgram` hook

4. **UI Implementation**
   - **Onboarding:** Multi-step wizard
   - **Dashboard:** Next workout card, cycle progress

## Next Steps

### Immediate (Phase 3 Preparation)

**1. Workout Completion & History**

- Implement `WorkoutComplete.tsx` summary screen (currently redirects to Home)
- Save completed workout data to `ProgramContext` (currently mostly mocked)
- Update cycle progress based on completed workouts

**2. Data Persistence**

- Ensure set data is actually saved to `currentCycle` in `ProgramContext`
- Implement `updateSet` method in context

### Phase 3: Premium Features (Upcoming)

**1. Cloud Sync**

- Connect `ProgramContext` to Supabase database
- Sync TMs and history

**2. Analytics**

- Visualize progress over time (e1RM graphs)

**3. Customization**

- Allow editing exercises
- Custom plates for calculator

## Active Patterns & Preferences

### 🔴 CRITICAL: Documentation-First Development

**MANDATORY BEFORE ANY FEATURE IMPLEMENTATION:**

1. **Use Context7 MCP Tool** to fetch current library docs
2. **Review documentation** for latest API patterns
3. **Implement using current patterns** (not from memory)

### 🔴 CRITICAL: DRY/SOLID Principles

**ALL code must follow DRY (Don't Repeat Yourself) and SOLID principles.**

- **DRY:** Extract repeated code into utils/hooks/services
- **Single Responsibility:** One component/function = one purpose
- **No Magic Numbers:** Use named constants

### 🔴 CRITICAL: File Organization Standards

**Strict directory structure must be followed:**

```
src/
├── components/
│   ├── workout/        # Workout-specific
│   └── index.ts
├── pages/
├── context/
├── hooks/
├── services/
├── constants/
└── config/
```

## Key Learnings & Insights

### From Phase 2b Implementation

**1. MUI Grid v2 vs v1:**

- Detected that `Grid` in MUI v7 uses `size` prop instead of `item` and `xs`
- Context7 docs helped identify correct component usage

**2. Timer Logic:**

- `useRestTimer` hook cleanly separates logic from UI
- `setInterval` needs careful cleanup in `useEffect`

**3. Navigation Flow:**

- `PreWorkout` -> `ActiveWorkout` -> `Home` loop works well
- `activeWorkout` state in context acts as the "session"

## Open Questions

**For Phase 3:**

- How detailed should the workout summary be?
- Should we store individual set logs in a separate table or nested JSON? (JSON for now in localStorage, relational in Supabase later)

## Context for Next Session

**When resuming work, remember:**

1. Phase 2b is largely complete, but data saving needs final wiring in Context
2. `ActiveWorkout.tsx` currently logs sets to console; needs `updateSet` context method
3. `WorkoutComplete` screen is skipped; consider adding it for better UX

- Define 4 main lifts + common assistance exercises
- Exercise details and instructions

**Workout Logging:**

- Save completed sets
- Calculate workout statistics
- Store in local database

### Considerations & Decisions Needed

**Data Storage Decision:**

- Start with localStorage for MVP speed
- Structure data for easy migration to SQLite later
- Keep Supabase integration ready for Premium tier

**Onboarding Philosophy:**

- Absolute minimum friction to first workout
- Advanced options collapsed/hidden
- Can skip and use defaults for everything except TMs

**Calculation Strategy:**

- All percentage calculations done in programGenerator service
- Round to nearest 2.5 lbs by default (configurable later)
- Warm-up sets calculated automatically (40%, 50%, 60% of working weight)

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

See `techContext.md > Available MCP Tools` for complete Context7 documentation.

### 🔴 CRITICAL: DRY/SOLID Principles

**ALL code must follow DRY (Don't Repeat Yourself) and SOLID principles.**

**Quick Reference:**

- **DRY:** Extract repeated code into utils/hooks/services
- **Single Responsibility:** One component/function = one purpose
- **Open/Closed:** Extend through composition, not modification
- **Liskov Substitution:** Interface implementations are interchangeable
- **Interface Segregation:** Small, focused interfaces
- **Dependency Inversion:** Depend on abstractions, not implementations

See `systemPatterns.md > DRY Principles` and `systemPatterns.md > SOLID Principles` for detailed examples and anti-patterns.

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

See `systemPatterns.md > File Organization Standards` for complete details.

### Component Structure

- Functional components with hooks (no class components)
- TypeScript interfaces for all props
- Co-locate related components in feature folders when 3+ components
- Components: 150-300 lines max (split if larger)
- Use index.ts for public API exports

### State Management

- React Context API for global state (Auth, Program)
- Local state for component-specific data
- Consider React Query for caching later if needed
- No Redux (decided against for this scale)

### Styling Approach

- MUI components as primary UI building blocks
- Use `sx` prop for one-off styles
- Theme overrides for global component defaults
- Avoid CSS modules/styled-components unless necessary
- Standard touch targets (48px) for cleaner, professional UI

### Form Handling

- react-hook-form for all forms
- Validate on blur, submit
- Clear error messages
- Large input fields and buttons
- Check React Hook Form docs via Context7 before implementation

### Data Flow

- Context provides data + methods to update
- Services handle business logic (calculations, transformations)
- Components focus on presentation and user interaction
- Persist to storage layer from context
- Unidirectional data flow (see systemPatterns.md)

### Code Quality Rules

**No Magic Numbers/Strings:**

```typescript
// ❌ BAD
if (reps > 20) { ... }

// ✅ GOOD
import { WORKOUT_CONSTANTS } from "@/constants/workout";
if (reps > WORKOUT_CONSTANTS.MAX_REPS) { ... }
```

**Extract Repeated Logic:**

```typescript
// ❌ BAD - Duplicated in 5 components
const [open, setOpen] = useState(false);

// ✅ GOOD - Custom hook
const { open, handleOpen, handleClose } = useDialog();
```

### Naming Conventions

- Components: PascalCase (e.g., `WorkoutCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useWorkout.ts`)
- Services: camelCase (e.g., `programGenerator.ts`)
- Types: PascalCase interfaces (e.g., `TrainingMax`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_REPS`)
- Files: Match component/hook/service name

## Key Learnings & Insights

### From Phase 1 Implementation

**1. MUI v7 Differences:**

- Some components have new props/structure vs v5
- Theme customization is powerful for gym-optimized UI
- Default component sizes too small - need overrides

**2. Supabase Integration:**

- Session management is straightforward
- Email confirmation can be disabled for faster testing
- Need clear error handling for network issues

**3. React 19 Benefits:**

- Better performance out of the box
- Improved TypeScript integration
- No major breaking changes from 18

**4. Capacitor Setup:**

- Android platform integration is smooth
- Need to sync after major changes
- Web version works great for rapid development

### Design Decisions Made

**Theme Strategy:**

- Start with dark mode as default (gym lighting)
- Modern, attractive color palette (Slate/Blue/Pink)
- Standard touch targets (48px) for professional UI
- Refined typography and spacing

**Authentication Flow:**

- Email/password for MVP (Google Sign-In later)
- No email verification required initially (reduce friction)
- Guest mode not in Phase 1 (can add later)

**Navigation Structure:**

- Bottom navigation for main tabs (when implemented)
- AppBar for contextual actions
- Minimize navigation during active workout

### Technical Constraints Discovered

**Performance Considerations:**

- Keep calculation logic in services, not components
- Memoize expensive computations
- Lazy load routes as app grows

**Mobile Considerations:**

- Test on actual Android device regularly
- Consider screen size variations (320px minimum)
- One-handed operation critical

## Open Questions

**For Phase 2b:**

- How to handle "failed" sets vs just logging reps? (Decision: Just log actual reps, let algorithm decide if stall occurred)
- Should warm-up sets be skippable? (Decision: Yes, checkable list)
- How to handle screen wake lock? (Decision: Use `capacitor-community/keep-awake` plugin)

**For Later:**

- SQLite migration timing - when does localStorage become limiting?
- Offline sync strategy for Premium tier
- When to introduce analytics/graphs?

## Blockers & Risks

**Current Blockers:** None

**Potential Risks:**

1. **5/3/1 Logic Complexity:** Need to ensure calculations match book exactly
   - Mitigation: Test against known spreadsheet values
2. **Data Migration:** Moving from localStorage to SQLite later

   - Mitigation: Structure data with migration in mind from start

3. **User Onboarding Drop-off:** Users might quit before first workout
   - Mitigation: Minimize onboarding steps, make first workout instant

## Communication Notes

**Key Stakeholder Messages:**

- Phase 1 complete and working smoothly
- Ready to start core feature development
- Timeline on track for MVP in 16 weeks

**User Feedback to Incorporate:**

- (None yet - pre-launch)

## Context for Next Session

**When resuming work, remember:**

1. Read ALL Memory Bank files first
2. Phase 2a is complete - data models and program generation are working
3. Phase 2b is next - focus on the actual workout experience
4. Maintain gym-first design: Large buttons, high contrast, easy one-handed use
5. Keep state management simple in `ProgramContext`
6. Ensure `programGenerator` logic is used, not duplicated in UI
7. Test `activeWorkout` state transitions thoroughly
