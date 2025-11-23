# Active Context - Titan 531

## Current Focus

**Phase Status:** Phase 1 (Foundation) Complete → Phase 2a (Setup & Structure) Next

**Immediate Priority:** Implement onboarding flow and training max setup to get users into their first workout quickly.

**Active Work Stream:** None currently in progress - ready to begin Phase 2a implementation.

## Recent Changes

### Phase 1 Completion (✅ Complete)

**What Was Built:**

1. **Project Infrastructure**

   - Vite + React 19 + TypeScript setup
   - Material-UI v7 theme configuration
   - Capacitor v7 Android platform integration
   - React Router v7 for navigation

2. **Authentication System**

   - Supabase client initialization
   - AuthContext with sign up, sign in, sign out, password reset
   - Login and Register pages with form validation
   - RequireAuth wrapper for protected routes
   - Session persistence

3. **Base UI Components**

   - Layout component with AppBar structure
   - Theme with gym-optimized customization (large touch targets, bold typography)
   - Dark mode by default
   - Home page placeholder

4. **Configuration Files**
   - package.json with all core dependencies
   - capacitor.config.ts for Android build
   - TypeScript configurations
   - ESLint setup

**Key Files Created:**

- `src/theme.ts` - MUI theme with custom overrides
- `src/supabaseClient.ts` - Backend client
- `src/context/AuthContext.tsx` - Auth state management
- `src/components/Layout.tsx` - App shell
- `src/components/RequireAuth.tsx` - Route protection
- `src/pages/Login.tsx` - Login screen
- `src/pages/Register.tsx` - Registration screen
- `src/pages/Home.tsx` - Dashboard placeholder

**Current State:**

- Users can create accounts and authenticate
- Protected routing works correctly
- Basic app shell exists with navigation
- Ready for feature development

## Next Steps

### Immediate (Phase 2a Start)

**1. Define Core Data Types** (Priority: High)

- Create `src/types/workout.ts` with:
  - `Lift` type for four main lifts
  - `TrainingMax` interface
  - `Exercise`, `Workout`, `Cycle` interfaces
  - Extended `UserProfile` with training preferences

**2. Build Program Generation Logic** (Priority: High)

- Create `src/services/programGenerator.ts`
- Implement 5/3/1 percentage calculations
- Function to generate 4-week cycle (3 work weeks + deload)
- Calculate weights for each set based on TM

**3. Create Program Context** (Priority: High)

- Build `src/context/ProgramContext.tsx`
- Manage training maxes state
- Track current cycle and active workout
- Persist data to local storage initially

**4. Build Onboarding Flow** (Priority: High)

- Create multi-step wizard
- Steps:
  1. Welcome & program introduction
  2. Training max input (with 1RM calculator option)
  3. Schedule preferences
  4. Program preview and confirmation
- Route at `/onboarding`
- Redirect new users from home page

**5. Update Home Dashboard** (Priority: Medium)

- Display current/next workout
- Show cycle progress
- Quick action: "Start Workout" button

### Short-Term (Phase 2b Next)

**Active Workout Interface:**

- Pre-workout screen with exercise list
- Full-screen workout mode
- Set logging interface with large buttons
- AMRAP set handling
- Rest timer integration

**Exercise Database:**

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
- Large touch targets (64px) for gym optimization

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
- High contrast colors for visibility
- Extra-large touch targets (64px) for primary actions
- Bold typography (minimum 16px base, larger for key UI)

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

**For Phase 2a:**

- Should we support multiple concurrent cycles? (Decision: No for MVP, one active cycle only)
- How many assistance exercise templates to include? (Decision: 3-4 pre-built templates)
- Allow editing TM mid-cycle? (Decision: Yes, but warn about implications)

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
2. Phase 1 is complete - authentication and routing work
3. Phase 2a is next - focus on onboarding and program setup
4. Start with data types, then service layer, then UI
5. All 5/3/1 calculations should be in programGenerator service
6. Keep it simple - one active cycle, basic assistance templates
7. Test calculations against known 5/3/1 values
