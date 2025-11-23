# Tech Context - Titan 531

## Technology Stack

### Frontend Framework

**React 19.2.0**

- Latest stable version with improved performance
- Server Components support (not using initially)
- Concurrent rendering features
- Better TypeScript integration
- Automatic batching improvements

**TypeScript 5.9.3**

- Type safety across entire codebase
- Better IDE support and autocomplete
- Catch errors at compile time
- Self-documenting code through interfaces

### Build Tool

**Vite 7.2.4**

- Lightning-fast HMR during development
- Optimized production builds
- Native ES modules support
- Plugin ecosystem for extensions
- Built-in TypeScript support

**Why Vite over Create React App:**

- 10-100x faster cold starts
- Instant hot module replacement
- Better tree-shaking and code splitting
- Active development and modern architecture
- First-class TypeScript support

### UI Framework

**Material-UI (MUI) v7.3.5**

- Components: `@mui/material`
- Icons: `@mui/icons-material`
- Emotion styling: `@emotion/react`, `@emotion/styled`

**Features We Use:**

- Theme customization with gym-optimized overrides
- Comprehensive component library
- Responsive design utilities
- Built-in accessibility
- sx prop for quick styling

**Key Components:**

- Navigation: AppBar, BottomNavigation, Drawer
- Forms: TextField, Button, Select, Slider, Switch
- Feedback: Snackbar, Dialog, Alert, CircularProgress
- Data Display: Card, List, Chip, Badge, Divider
- Layout: Container, Grid, Stack, Box

### Cross-Platform Runtime

**Capacitor v7.4.4**

- Core: `@capacitor/core`
- CLI: `@capacitor/cli`
- Android: `@capacitor/android`

**Official Plugins to Add:**

- `@capacitor/app` - App lifecycle
- `@capacitor/camera` - Progress photos
- `@capacitor/filesystem` - Local backups
- `@capacitor/haptics` - Vibration feedback
- `@capacitor/local-notifications` - Workout reminders
- `@capacitor/network` - Connectivity detection
- `@capacitor/share` - Share workouts
- `@capacitor/status-bar` - UI customization
- `@capacitor/splash-screen` - Launch screen
- `@capacitor/preferences` - Settings storage

**Community Plugins to Add:**

- `@capacitor-community/sqlite` - Local database
- `@capacitor-community/keep-awake` - Screen on during workouts

### Backend & Authentication

**Supabase 2.84.0**

- `@supabase/supabase-js`

**Services Used:**

- Authentication (email/password, OAuth)
- PostgreSQL database (for premium cloud sync)
- Realtime subscriptions (for premium features)
- Storage (for progress photos)
- Row Level Security (data protection)

**Configuration:**

- Project URL: Stored in `.env`
- Anon Key: Stored in `.env`
- Database schema managed via Supabase dashboard

### Routing

**React Router v7.9.6**

- `react-router-dom`

**Features:**

- Declarative routing
- Nested routes
- Protected routes with authentication
- URL parameters for dynamic routes
- Programmatic navigation

### Form Management

**React Hook Form v7.66.1**

- `react-hook-form`

**Why React Hook Form:**

- Minimal re-renders (better performance)
- Built-in validation
- TypeScript support
- Small bundle size (9KB)
- Works great with MUI

**Usage Pattern:**

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
```

### State Management

**React Context API (Built-in)**

- No external library needed for MVP
- AuthContext for user state
- ProgramContext for workout data

**Future Consideration:**

- Zustand if Context becomes complex
- React Query for server state caching (Premium tier)

## Available MCP Tools

### Context7 (Upstash) - **CRITICAL: USE FIRST FOR DOCUMENTATION**

**Purpose:** Fetch up-to-date library documentation before implementation

**⚠️ MANDATORY WORKFLOW:**

```
BEFORE implementing ANY library feature:
1. Use Context7 to fetch current documentation
2. Review the fetched docs for latest API patterns
3. Only then implement using current best practices
```

**Available Libraries:**

- **React** - Component patterns, hooks, concurrent features
- **Material-UI (MUI)** - Components, theming, sx prop patterns
- **Supabase** - Auth, database, realtime, storage
- **Capacitor** - Native plugins, platform APIs
- **React Router** - v7 routing patterns, loaders, actions
- **React Hook Form** - Form handling, validation patterns

**MCP Tool: `resolve-library-id`**

```typescript
// First, resolve the library name to get Context7 ID
use_mcp_tool(
  server_name: "github.com/upstash/context7-mcp",
  tool_name: "resolve-library-id",
  arguments: {
    "libraryName": "Material-UI"
  }
)
// Returns library ID like "/mui/material-ui"
```

**MCP Tool: `get-library-docs`**

```typescript
// Then fetch docs for specific topic
use_mcp_tool(
  server_name: "github.com/upstash/context7-mcp",
  tool_name: "get-library-docs",
  arguments: {
    "context7CompatibleLibraryID": "/mui/material-ui",
    "topic": "Dialog component usage",
    "page": 1  // Increase if more context needed
  }
)
```

**Usage Examples:**

**Example 1: Before implementing MUI Dialog**

```typescript
// ❌ WRONG - Implementing without checking docs
function MyDialog() {
  return <Dialog>...</Dialog>; // Might use deprecated API
}

// ✅ CORRECT - Check docs first
// 1. Resolve library ID for MUI
// 2. Fetch Dialog documentation
// 3. Review current API patterns
// 4. Implement using latest patterns
function MyDialog() {
  // Now using correct v7 API
  return (
    <Dialog open={open} onClose={handleClose}>
      ...
    </Dialog>
  );
}
```

**Example 2: Before implementing Supabase auth**

```typescript
// ❌ WRONG - Using outdated auth pattern
supabase.auth.signIn({ email, password });

// ✅ CORRECT - Check Supabase docs via Context7
// Discover current API is signInWithPassword
supabase.auth.signInWithPassword({ email, password });
```

**Example 3: Before implementing React Hook Form validation**

```typescript
// 1. Fetch React Hook Form docs
// 2. Review validation patterns
// 3. Use current best practices for MUI integration
const {
  register,
  formState: { errors },
} = useForm();
```

**When to Use Context7:**

- ✅ Before implementing any MUI component you haven't used yet
- ✅ When error messages suggest deprecated API usage
- ✅ Before adding new Capacitor plugin functionality
- ✅ When implementing complex patterns (forms, routing, etc.)
- ✅ After library updates (check for breaking changes)

**Context7 Workflow Pattern:**

```
User: "Add a dialog for editing workout"
↓
AI:
1. Use resolve-library-id for MUI
2. Use get-library-docs for "Dialog component"
3. Review fetched documentation
4. Implement using current API patterns
5. Reference any specific constraints from docs
```

### Next DevTools MCP - Next.js Development Tools

**Purpose:** Next.js specific tools (not applicable for this Capacitor project)

- Available but not used in this React + Capacitor project
- Would be relevant if building with Next.js instead

### Sentry MCP - Error Tracking & Monitoring

**Purpose:** Production error tracking and monitoring (Phase 3+)

**Available Tools:**

- `whoami` - Identify authenticated user
- `find_organizations` - List Sentry organizations
- `search_issues` - Search error issues
- `get_issue_details` - Detailed error information
- `analyze_issue_with_seer` - AI-powered error analysis

**When to Use:**

- **Phase 3:** Set up error tracking for production
- **Phase 4:** Monitor beta testing errors
- **Phase 5:** Production error monitoring

**Usage Pattern:**

```typescript
// After deploying to production
// 1. Search for critical errors
use_mcp_tool(
  server_name: "Sentry",
  tool_name: "search_issues",
  arguments: {
    "organizationSlug": "titan531",
    "naturalLanguageQuery": "critical errors from last 24 hours"
  }
)

// 2. Get detailed error info
use_mcp_tool(
  server_name: "Sentry",
  tool_name: "get_issue_details",
  arguments: {
    "issueUrl": "https://sentry.io/issues/..."
  }
)

// 3. AI-powered analysis for complex errors
use_mcp_tool(
  server_name: "Sentry",
  tool_name: "analyze_issue_with_seer",
  arguments: {
    "issueUrl": "https://sentry.io/issues/..."
  }
)
```

### MCP Tool Priority Matrix

**Phase 1-2 (Current):**

- **Context7**: ⭐⭐⭐⭐⭐ CRITICAL - Use before every feature implementation
- **Sentry**: Not yet applicable

**Phase 3 (Premium Features):**

- **Context7**: ⭐⭐⭐⭐⭐ Still critical for new library features
- **Sentry**: ⭐⭐⭐ Setup for error tracking

**Phase 4 (Testing & Polish):**

- **Context7**: ⭐⭐⭐ As needed for bug fixes
- **Sentry**: ⭐⭐⭐⭐⭐ Critical for monitoring beta

**Phase 5 (Launch & Production):**

- **Context7**: ⭐⭐⭐ For new features post-launch
- **Sentry**: ⭐⭐⭐⭐⭐ Essential for production monitoring

### Documentation-First Development Process

**Required Workflow:**

1. **Understand Requirement**

   ```
   User: "Add workout dialog with form validation"
   ```

2. **Identify Libraries Needed**

   ```
   - MUI Dialog component
   - React Hook Form for validation
   ```

3. **Fetch Documentation (MANDATORY)**

   ```typescript
   // Step 1: Get MUI Dialog docs
   resolve-library-id → get-library-docs("Dialog")

   // Step 2: Get React Hook Form docs
   resolve-library-id → get-library-docs("validation patterns")
   ```

4. **Review Documentation**

   ```
   - Note current API patterns
   - Check for MUI + React Hook Form integration
   - Identify best practices
   ```

5. **Implement Using Current Patterns**

   ```typescript
   // Now implement with confidence using latest APIs
   function WorkoutDialog() {
     const { register, handleSubmit, formState } = useForm();
     // ... implementation using patterns from docs
   }
   ```

6. **Reference Documentation in Code**
   ```typescript
   // Good practice: Add comment referencing doc pattern used
   // Using MUI Dialog v7 controlled pattern (Context7: 2024-01-15)
   <Dialog open={open} onClose={handleClose}>
   ```

### Why Context7 is Critical

**Problem Without Context7:**

```typescript
// Might use deprecated MUI v5 patterns
<Dialog open={open}>
  {" "}
  // Missing onClose - v7 requires it
  <DialogTitle>Edit Workout</DialogTitle>
  // Old pattern that causes warnings
</Dialog>;

// Might use old Supabase auth API
supabase.auth.signIn(); // Deprecated, should be signInWithPassword

// Might miss new React 19 features
// Not using concurrent features that would improve UX
```

**With Context7:**

```typescript
// ✅ Using current MUI v7 patterns
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Edit Workout</DialogTitle>
  <DialogContent>...</DialogContent>
</Dialog>;

// ✅ Using current Supabase API
supabase.auth.signInWithPassword({ email, password });

// ✅ Leveraging React 19 features discovered in docs
const [isPending, startTransition] = useTransition();
```

**Time Saved:**

- ❌ Without Context7: 30-60 min debugging deprecated APIs
- ✅ With Context7: 2-5 min fetching docs + correct implementation

## Development Environment

### Required Software

**Node.js 18+ (LTS)**

- Current: v20+ recommended
- npm comes bundled (v9+)
- Check: `node --version`

**Git**

- Version control
- Check: `git --version`

**Android Studio (for Android development)**

- Android SDK Platform 26+
- Android Build Tools
- Android SDK Tools
- Emulator or physical device

**VS Code (Recommended IDE)**

- Extensions:
  - ESLint
  - Prettier
  - TypeScript
  - React code snippets
  - Material Icon Theme
  - GitLens

### Project Setup

**Initial Setup:**

```bash
# Clone repository
git clone <repo-url>
cd titan-531

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with Supabase credentials

# Initialize Capacitor (already done)
npx cap init

# Add Android platform (already done)
npx cap add android
```

**Development Commands:**

```bash
# Start dev server (web)
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npm run build # Also type checks
```

**Capacitor Commands:**

```bash
# Sync web app with native project
npx cap sync

# Open Android Studio
npx cap open android

# Run on Android device/emulator
npx cap run android

# Copy web build to native project
npx cap copy

# Update Capacitor plugins
npx cap update
```

### Environment Variables

**`.env` File:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=Titan 531
VITE_APP_VERSION=0.0.0
```

**Important:**

- Prefix with `VITE_` to expose to client
- Never commit `.env` to git (already in `.gitignore`)
- Use `.env.example` as template

### Code Quality Tools

**ESLint 9.39.1**

- Configuration: `eslint.config.js`
- Extends: `@eslint/js`, TypeScript ESLint
- Plugins: React hooks, React refresh
- Auto-fix on save (VS Code setting)

**TypeScript Compiler**

- Strict mode enabled
- Separate configs:
  - `tsconfig.json` - Base config
  - `tsconfig.app.json` - App-specific
  - `tsconfig.node.json` - Node tooling

**Prettier (Recommended)**

- Auto-formatting on save
- Integrates with ESLint
- Consistent code style

## Dependencies

### Current Production Dependencies

```json
{
  "@capacitor/android": "^7.4.4",
  "@capacitor/cli": "^7.4.4",
  "@capacitor/core": "^7.4.4",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/icons-material": "^7.3.5",
  "@mui/material": "^7.3.5",
  "@supabase/supabase-js": "^2.84.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-hook-form": "^7.66.1",
  "react-router-dom": "^7.9.6"
}
```

### Current Dev Dependencies

```json
{
  "@eslint/js": "^9.39.1",
  "@types/node": "^24.10.1",
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "eslint": "^9.39.1",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-react-refresh": "^0.4.24",
  "globals": "^16.5.0",
  "typescript": "~5.9.3",
  "typescript-eslint": "^8.46.4",
  "vite": "^7.2.4"
}
```

### Dependencies to Add (Phase 2+)

**Capacitor Plugins:**

```bash
npm install @capacitor/haptics
npm install @capacitor/local-notifications
npm install @capacitor/camera
npm install @capacitor/filesystem
npm install @capacitor/share
npm install @capacitor/network
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/app
npm install @capacitor-community/sqlite
npm install @capacitor-community/keep-awake
```

**Data Visualization (Phase 3):**

```bash
npm install recharts
# OR
npm install victory
# OR
npm install @mui/x-charts
```

**Utilities (As Needed):**

```bash
npm install date-fns  # Date manipulation
npm install uuid      # Unique IDs
npm install zod       # Runtime validation
```

**Testing (Future):**

```bash
npm install --save-dev vitest
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

## Build & Deployment

### Web Build

**Build Process:**

```bash
npm run build
# Output: dist/
```

**Build Output:**

- Optimized JavaScript bundles
- Minified CSS
- Source maps (optional)
- Static assets copied

**Hosting Options:**

- Vercel (recommended for web)
- Netlify
- Firebase Hosting
- GitHub Pages
- Own server with Nginx

### Android Build

**Debug Build:**

```bash
npx cap sync
npx cap open android
# Build in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

**Release Build:**

```bash
# 1. Update version in package.json and capacitor.config.ts
# 2. Sync changes
npx cap sync

# 3. Open Android Studio
npx cap open android

# 4. Generate signed APK/AAB
# Build > Generate Signed Bundle / APK
# Follow wizard with keystore
```

**Google Play Release:**

- Format: Android App Bundle (.aab)
- Signing: Upload key
- Target SDK: 34+ (current requirement)
- Min SDK: 26 (Android 8.0)

### Environment-Specific Builds

**Development:**

- Source maps enabled
- Hot reload active
- Debug logging
- Test data

**Production:**

- Minified code
- Tree shaking
- Code splitting
- Error tracking
- Analytics enabled

## Database Schema

### Local Storage Structure (Phase 1-2)

**localStorage Keys:**

```typescript
'titan531_auth' - Authentication token
'titan531_user' - User profile
'titan531_training_maxes' - Current TMs
'titan531_current_cycle' - Active cycle data
'titan531_workout_history' - Completed workouts (last 30 days for free)
'titan531_settings' - User preferences
'titan531_onboarding_complete' - Boolean flag
```

### SQLite Schema (Phase 3 - Future)

**Tables:**

```sql
-- Users table (minimal, most from Supabase Auth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Maxes
CREATE TABLE training_maxes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lift TEXT NOT NULL, -- 'Squat', 'Bench', 'Deadlift', 'Press'
  weight REAL NOT NULL,
  unit TEXT DEFAULT 'lbs',
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cycles
CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Workouts
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cycle_id TEXT,
  name TEXT NOT NULL,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  duration INTEGER, -- seconds
  total_volume REAL, -- lbs
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id)
);

-- Exercises
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- 'main', 'supplemental', 'assistance'
  muscle_groups TEXT, -- JSON array
  equipment TEXT, -- JSON array
  custom BOOLEAN DEFAULT FALSE,
  user_id TEXT, -- NULL for default exercises
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sets
CREATE TABLE sets (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps INTEGER,
  actual_reps INTEGER,
  weight REAL,
  rpe INTEGER, -- Premium feature
  is_amrap BOOLEAN DEFAULT FALSE,
  is_warmup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Personal Records
CREATE TABLE personal_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  record_type TEXT NOT NULL, -- '1RM', '5RM', '10RM', 'volume'
  value REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Settings
CREATE TABLE settings (
  user_id TEXT PRIMARY KEY,
  unit_system TEXT DEFAULT 'imperial',
  bar_weight REAL DEFAULT 45,
  available_plates TEXT, -- JSON array
  rounding_preference TEXT DEFAULT '2.5',
  theme TEXT DEFAULT 'dark',
  rest_timer_main INTEGER DEFAULT 300,
  rest_timer_supplemental INTEGER DEFAULT 180,
  rest_timer_assistance INTEGER DEFAULT 90,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Supabase Schema (Premium - Cloud Sync)

**Same structure as SQLite, with:**

- Row Level Security policies
- Automatic timestamps
- Foreign key constraints
- Indexes on frequently queried columns
- Realtime subscriptions for multi-device sync

## Performance Optimization

### Bundle Size Targets

**Initial Load:**

- Target: <500KB gzipped JavaScript
- Target: <100KB gzipped CSS
- Target: <2s load time on 3G

**Code Splitting:**

- Route-based splitting (lazy loading)
- Vendor chunk separation
- Dynamic imports for heavy features

**Asset Optimization:**

- Image optimization (WebP format)
- Icon sprite sheets
- Font subsetting
- Lazy loading images

### Runtime Performance

**React Optimization:**

- Use `memo` for expensive components
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- Virtual scrolling for long lists (future)

**Rendering:**

- Avoid unnecessary re-renders
- Debounce user input
- Throttle scroll events
- Optimize list rendering

### Storage Performance

**localStorage:**

- Single parse on app load
- Batch writes
- Async reads when possible
- Size limit awareness (5-10MB typically)

**SQLite (future):**

- Indexed columns for fast queries
- Prepared statements
- Batch inserts
- Transaction management

## Development Workflow

### Git Workflow

**Branches:**

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `release/*` - Release preparation

**Commit Convention:**

```
type(scope): message

Types: feat, fix, docs, style, refactor, test, chore
Examples:
- feat(workout): add rest timer
- fix(auth): resolve token refresh issue
- docs(readme): update setup instructions
```

### Development Process

**Starting New Feature:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/workout-timer
# ... make changes ...
git add .
git commit -m "feat(workout): implement rest timer"
git push origin feature/workout-timer
# Create PR to develop
```

**Before Commit:**

1. Run linter: `npm run lint`
2. Type check: `npm run build`
3. Test manually in browser
4. Test on Android (if native changes)

### Testing Strategy

**Manual Testing (Current):**

- Test in Chrome DevTools mobile view
- Test on actual Android device
- Test different screen sizes
- Test network conditions (throttle)

**Automated Testing (Future):**

- Unit tests for services/utilities
- Integration tests for components
- E2E tests for critical paths
- Visual regression tests

## Deployment Pipeline

### Web Deployment (Vercel)

**Auto-Deploy on Push:**

```bash
git push origin main
# Vercel auto-builds and deploys
```

**Environment:**

- Production: main branch
- Preview: feature branches
- Environment variables in Vercel dashboard

### Android Deployment

**Manual Process (MVP):**

1. Update version in `package.json` and `capacitor.config.ts`
2. `npx cap sync`
3. Open Android Studio
4. Generate signed AAB
5. Upload to Google Play Console
6. Fill release notes
7. Submit for review

**Future: CI/CD with GitHub Actions**

- Automated builds on tag push
- Automated testing
- Upload to Play Store internal track

## Monitoring & Analytics

### Error Tracking (Future)

**Options:**

- Sentry (recommended)
- LogRocket
- Bugsnag

**What to Track:**

- JavaScript errors
- API failures
- Performance metrics
- User flows

### Analytics (Future)

**Options:**

- Google Analytics 4
- Mixpanel
- Amplitude

**Events to Track:**

- Workout completed
- PR achieved
- Premium upgrade
- Feature usage
- User retention

## Security Considerations

### Authentication

**Current:**

- Supabase handles auth
- JWTs stored in localStorage
- HTTPS only in production
- No sensitive data in URLs

**Future:**

- Biometric authentication
- 2FA for premium
- Session management
- Account recovery

### Data Protection

**Local Data:**

- No PII beyond email
- Workout data is not sensitive
- Local storage encryption (future)

**Cloud Data:**

- Supabase Row Level Security
- User can only access own data
- No data selling
- GDPR compliant export

### API Security

**Supabase:**

- Anon key is safe for client use
- RLS policies enforce access control
- Service key never in client
- Rate limiting enabled

## Troubleshooting

### Common Issues

**"Module not found" errors:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Capacitor sync issues:**

```bash
npx cap sync
# If Android specific:
cd android && ./gradlew clean && cd ..
npx cap sync
```

**Build errors:**

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Android build fails:**

- Check Android Studio SDK versions
- Check Gradle version compatibility
- Clean build in Android Studio
- Invalidate caches and restart

### Development Tips

**Fast Refresh:**

- Edit files while dev server running
- See changes instantly
- No manual refresh needed

**TypeScript Errors:**

- Fix them! They're warnings of real issues
- Use `any` sparingly
- Define interfaces for all data shapes

**Console Warnings:**

- Address React warnings
- Fix key prop warnings
- Resolve dependency warnings

**Performance:**

- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Monitor network tab for API calls
- Test on slower devices

## Future Technical Considerations

### Scalability

**When localStorage isn't enough:**

- User has >100 workouts
- Complex queries needed
- Multi-device sync required
- Migrate to SQLite

**When to optimize:**

- App launch > 2s
- Bundle size > 500KB
- Render time > 16ms
- User reports slowness

### Technology Upgrades

**Keep Updated:**

- React (minor versions safe)
- MUI (check breaking changes)
- Capacitor (major versions carefully)
- Dependencies (use `npm outdated`)

**Be Cautious With:**

- Major version upgrades
- Breaking changes in Capacitor
- New experimental features
- Unproven libraries
