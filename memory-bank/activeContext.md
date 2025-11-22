# Active Context: Titan 5/3/1

## Current Status

**Project State**: Feature-complete MVP at v1.2.1 + Cloud Sync Development  
**Last Major Update**: November 2025  
**Focus**: Supabase Integration for Optional Cloud Sync

## Recent Work

### Android APK Implementation (November 2025 - Phases 1-6 Complete)

**Goal**: Package Titan 5/3/1 PWA as a native Android APK for Google Play Store distribution using Capacitor.

**Status**: Core implementation complete. Ready for device testing.

**Implementation Complete (November 2025):**

1. **Phase 1: Environment Setup** ✅

   - Installed Capacitor v7.4.4 (@capacitor/core, @capacitor/cli, @capacitor/android)
   - Initialized Capacitor with app ID: `com.titan.workout`
   - Created Android platform project in `android/` directory
   - Verified Android project structure (gradle, build files, manifests)

2. **Phase 2: Tailwind CSS Migration** ✅

   - Migrated from Tailwind CDN to build process
   - Installed Tailwind v4 with @tailwindcss/postcss plugin
   - Created `tailwind.config.js` and `postcss.config.js`
   - Created `src/index.css` with @import "tailwindcss" and @theme directive
   - Removed CDN script tags from index.html
   - Removed AI Studio import maps (app uses npm packages)
   - Successfully tested build with proper Tailwind processing

3. **Phase 3: Capacitor Configuration** ✅

   - Configured `capacitor.config.ts`:
     - androidScheme: 'https' for secure contexts
     - SplashScreen settings (2s duration, dark background)
     - StatusBar settings (dark style, matches app theme)
   - Added Capacitor scripts to package.json:
     - `android:dev` - Live reload on device
     - `android:build` - Build + sync + open Android Studio
     - `android:sync` - Sync web assets to Android
   - Updated `vite.config.ts`:
     - base: '' for Capacitor compatibility
     - Code splitting optimizations (vendor, charts, icons chunks)
     - Disabled sourcemaps for production
   - Updated `.gitignore` for Android build artifacts

4. **Phase 4: Platform Detection Utility** ✅

   - Created `src/utils/platformDetection.ts` with functions:
     - `isNativeApp()` - Check if in Capacitor
     - `isAndroid()` - Check if on Android
     - `isWeb()` - Check if in web browser
     - `getPlatform()` - Get platform name
   - Updated service worker registration to be conditional:
     - Only registers on web (protocol !== "capacitor:")
     - Capacitor handles offline functionality natively
   - Made test connection import conditional (dev only)

5. **Phase 5: Asset Preparation** ✅

   - Created `resources/` directory for app assets
   - Installed optional Capacitor plugins:
     - @capacitor/splash-screen@7.0.3
     - @capacitor/status-bar@7.0.3
     - @capacitor/keyboard@7.0.3
   - Plugin configuration in capacitor.config.ts
   - Ready for icon/splash screen generation (awaiting source images)

6. **Phase 6: Build and Test** ✅
   - Successfully built production bundle: `npm run build`
     - Main bundle: 461.88 KB (116.25 KB gzipped)
     - Charts chunk: 355.83 KB (105.06 KB gzipped)
     - Lazy-loaded feature chunks working correctly
   - Successfully synced to Android: `npx cap sync android`
     - Web assets copied to android/app/src/main/assets/public
     - All 3 plugins detected and configured
     - Android project ready for build

**What Works:**

- ✅ Dual deployment: PWA (web) and native Android APK
- ✅ Tailwind CSS fully integrated in build process
- ✅ Service worker conditional (web only)
- ✅ Platform detection available throughout app
- ✅ localStorage persists in both web and Capacitor
- ✅ All existing features preserved (workout tracking, AI coach, etc.)
- ✅ Offline functionality in both environments
- ✅ Production build optimized with code splitting

**Pending:**

- Production signing key generation
- Play Store listing preparation

**Key Technical Decisions:**

1. **Capacitor over React Native**

   - Wraps existing PWA without code changes
   - Minimal configuration required
   - Maintains web version perfectly
   - Official Google Play support

2. **Tailwind v4 over v3**

   - Modern @theme directive instead of config
   - Cleaner CSS with @import "tailwindcss"
   - Better performance and smaller bundle

3. **Conditional Service Worker**

   - Service worker only on web platform
   - Capacitor handles caching natively
   - Prevents conflicts and redundancy

4. **Platform Detection Pattern**
   - Centralized utilities for platform checks
   - Enables conditional native feature usage
   - Future-proof for iOS if needed

**Impact:**

- App now supports both web and native Android deployment
- No changes to existing React components
- No changes to business logic or services
- localStorage-based architecture works in both environments
- Ready for Google Play Store distribution (pending testing)

**What Now Works:**

- ✅ Android Studio successfully loads project
- ✅ Emulator runs app without issues
- ✅ All features functional in Android environment
- ✅ App icons and splash screens display correctly
- ✅ localStorage persists in native app
- ✅ All UI renders properly with Tailwind CSS

**Next Actions (When Ready for Production):**

1. Generate signing key for production builds
2. Build release APK/AAB with signing
3. Test release build thoroughly
4. Prepare Play Store listing (screenshots, description, etc.)
5. Submit to Google Play Store

### Supabase Integration (In Progress - Phase 3 Complete)

**Goal**: Add optional cloud sync while maintaining localStorage as primary storage for guest mode.

**Phase 3 Complete (November 2025):**

1. **Data Migration Service Implementation**

   - Created `services/database/migrationService.ts` - Complete migration service
     - `migrateGuestDataToCloud()` - Main orchestrator with idempotency
     - `migrateProfile()` - Profile data with UPSERT
     - `migrateWorkoutHistory()` - Batch processing (50 per batch)
     - `migrateNutritionData()` - Nutrition logs
     - `migrateClientProfiles()` - Coach mode clients
     - Migration flag in localStorage prevents re-runs

2. **AuthContext Integration**

   - Modified `context/AuthContext.tsx` - Added migration triggers
     - Added `migrating` and `migrationError` state
     - Added `checkAndMigrate()` function
     - Triggers automatically on SIGNED_IN event
     - Exposes migration state globally via useAuth()

3. **Migration UI Implementation**

   - Modified `components/AuthModal.tsx` - Added migration states
     - Loading state: "Syncing your data to cloud..." with spinner
     - Success state: "Sync complete!" (auto-closes after 1.5s)
     - Error state: Shows error with "Retry" and "Continue Without Sync" options
     - Prevents modal close during migration

4. **Migration Strategy**
   - **Automatic**: Triggers on signup/signin (no user action needed)
   - **Idempotent**: Safe to run multiple times
   - **Graceful**: Partial failures don't block app usage
   - **Transparent**: Clear UI feedback at every step

**What Works Now:**

- New users: Account created → immediate success (no data to migrate)
- Guest users with data: Sign up → automatic migration → success confirmation
- Returning users: Sign in → no re-migration (flag checked)
- Migration errors: Clear error display with retry option
- Guest mode: Completely unaffected, still works perfectly

**Phase 2 Complete (November 2025):**

- Auth system with email/password + OAuth
- Guest mode detection and preservation
- Session persistence and management
- Clean UI integration in Settings

**Phase 1 Complete (November 2025):**

- Database schema designed and documented
- Supabase client configured
- TypeScript types defined
- Testing infrastructure created

**Next Steps**: Proceed to Phase 4 (Data Abstraction Layer).

### Gemini API Fix (November 2025)

**Critical Bug Fixed**: App was crashing on startup due to incorrect API key access.

**Problem**: Service used `process.env.API_KEY` which doesn't work in browser with Vite.

**Solution**:

- Changed to `import.meta.env.VITE_GEMINI_API_KEY` (Vite-compatible)
- Implemented lazy initialization (client created only when needed)
- Added proper error handling with helpful messages
- Made AI features optional (won't crash if no key provided)

**Impact**: App now starts successfully, AI features gracefully degrade if not configured.

### Latest Changes (v1.2.1)

1. **React 19 Upgrade**

   - Upgraded to React 19.2.0 for improved performance
   - Leveraging new concurrent rendering features
   - Updated all hooks and patterns for React 19 compatibility

2. **Enhanced UI Features**

   - Improved theme system with 5 color schemes (blue, purple, green, orange, red)
   - Better mobile responsiveness across all views
   - Enhanced loading states with Suspense boundaries
   - Toast notification system for user feedback

3. **Coach Mode Enhancements**

   - Multi-client management capability
   - Profile switching between coach and client views
   - Independent history tracking per client
   - Client dashboard with overview

4. **Nutrition Tracking**

   - Daily macro tracking (calories, protein, carbs, fats)
   - Meal logging with timestamps
   - Progress visualization
   - Photo attachment for meals

5. **Advanced Tools**
   - Custom plate inventory support
   - Improved plate calculator accuracy
   - Interval timer with audio cues
   - Warmup generator with custom sets

## Active Work Areas

### Current Focus: None (Maintenance Mode)

The app is feature-complete. Current focus is on:

- Bug fixes if reported
- Performance monitoring
- Dependency updates
- Security patches

### Potential Next Features (Not Started)

If development resumes, these areas were identified as enhancement opportunities:

1. **Cloud Sync** (High Priority)

   - Optional backend integration
   - Cross-device synchronization
   - Backup and restore from cloud
   - Keep localStorage as primary, cloud as optional

2. **Enhanced Analytics** (Medium Priority)

   - More detailed volume/intensity charts
   - PR tracking per lift
   - Estimated 1RM trends over time
   - Training load management

3. **Social Features** (Low Priority)

   - Share workouts to social media
   - Public workout logs
   - Community challenges
   - Leaderboards

4. **Advanced Programming** (Medium Priority)
   - Custom program builder
   - More program variants (Pervertor, Krypteia, etc.)
   - Periodization templates
   - Auto-regulation based on RPE

## Important Decisions & Rationale

### Architectural Decisions

1. **No Backend by Design**

   - **Decision**: Keep app 100% client-side
   - **Rationale**:
     - Zero hosting costs
     - Perfect privacy (data never leaves device)
     - Works completely offline
     - Instant deployment
   - **Trade-off**: No cross-device sync (acceptable for v1)

2. **localStorage Over IndexedDB**

   - **Decision**: Use localStorage as primary storage
   - **Rationale**:
     - Simpler API (synchronous)
     - Sufficient for typical usage (~1-2MB)
     - No migration complexity
   - **Trade-off**: 5-10MB storage limit
   - **Future**: Could migrate to IndexedDB if needed

3. **Feature-Based Organization**

   - **Decision**: Organize code by feature/domain
   - **Rationale**:
     - Clear boundaries
     - Easy to locate code
     - Scales well as app grows
   - **Example**: features/workout/, features/history/, features/settings/

4. **Centralized State (useAppController)**

   - **Decision**: Single hook for all application state
   - **Rationale**:
     - No external library needed
     - Simple mental model
     - Easy to debug
   - **Trade-off**: Could become large (currently manageable)

5. **Lazy Loading Strategy**
   - **Decision**: Lazy load all major views
   - **Rationale**:
     - Fast initial load (~200KB)
     - On-demand loading improves perceived performance
   - **Implementation**: React.lazy + Suspense

### UI/UX Decisions

1. **Bottom Navigation Pattern**

   - **Decision**: Fixed bottom nav with icons
   - **Rationale**:
     - Mobile-friendly (thumb zone)
     - Always accessible
     - Industry standard for fitness apps
   - **Views**: Dashboard, Workout, History, Profile, Tools

2. **No Account Required**

   - **Decision**: Zero authentication
   - **Rationale**:
     - Lower barrier to entry
     - Privacy-focused
     - Simplifies architecture
   - **Trade-off**: No cloud features (by design)

3. **AI Features Optional**

   - **Decision**: AI features require user-provided API key
   - **Rationale**:
     - No server/API key management needed
     - User controls costs
     - Privacy maintained
   - **Implementation**: Gemini API key stored in localStorage

4. **Premium Features Free**
   - **Decision**: "Premium" is demo-unlocked for all
   - **Rationale**:
     - No payment processing needed
     - MVP validation
     - Could add monetization later
   - **Current State**: All program variants free

### Technical Decisions

1. **TypeScript Strict Mode**

   - **Decision**: Enable all strict TypeScript checks
   - **Rationale**:
     - Catch errors at compile time
     - Better refactoring confidence
     - Self-documenting code
   - **Trade-off**: More upfront type work (worth it)

2. **Vite Over Create React App**

   - **Decision**: Use Vite as build tool
   - **Rationale**:
     - 10-100x faster HMR
     - Better dev experience
     - Modern architecture (ES modules)
     - CRA is deprecated

3. **Inline Styles Over CSS Modules**

   - **Decision**: Tailwind utilities in className
   - **Rationale**:
     - Co-location with components
     - No build step for CSS
     - Easier theme system with CSS vars
   - **Theme**: Dynamic colors via CSS custom properties

4. **No Testing Framework (Yet)**

   - **Decision**: No automated tests in v1
   - **Rationale**:
     - MVP speed priority
     - Manual testing sufficient for v1
   - **Future**: Add Jest + RTL when stability needed

5. **Supabase Over Prisma** (New - November 2025)
   - **Decision**: Use Supabase for optional cloud sync
   - **Rationale**:
     - No backend code needed (Prisma requires Node.js server)
     - Built-in authentication (email/password + OAuth)
     - Row-level security at database level
     - Real-time subscriptions available (future feature)
     - Generous free tier (50k MAU, 500MB database)
     - Client libraries handle everything
     - Still PostgreSQL underneath (can self-host later)
   - **Trade-off**: Vendor dependency (though data is exportable)
   - **Deployment**: Works with Vercel (first-class integration)

## Key Patterns & Preferences

### Code Patterns

1. **Service Layer Pattern**

   - Business logic lives in services/
   - Components stay thin (presentation)
   - Easy to test logic independently
   - Example: workoutLogic.ts, analyticsLogic.ts

2. **Custom Hook Pattern**

   - useAppController for app state
   - useLocalStorage for persistence
   - useRestTimer for timer logic
   - Composition over inheritance

3. **Error Handling Strategy**

   - Error boundary at top level (render errors)
   - Try/catch in services (API/logic errors)
   - User-friendly messages in UI
   - Graceful degradation (AI features)

4. **Type Safety Patterns**
   - Discriminated unions for state (AppView, LiftType)
   - Strict null checks
   - No 'any' types (use 'unknown' then narrow)
   - Generic utility types

### Naming Conventions

1. **Components**: PascalCase (Button.tsx, ActiveWorkout.tsx)
2. **Hooks**: camelCase with 'use' prefix (useAppController.ts)
3. **Types**: PascalCase (UserProfile, WorkoutSession)
4. **Services**: camelCase (workoutLogic.ts, geminiService.ts)
5. **Constants**: SCREAMING_SNAKE_CASE (WEEK_MULTIPLIERS)

### File Organization Preferences

- One component per file
- Co-locate types with usage (when file-specific)
- Shared types in types/ directory
- Index exports for public API
- Group related components in subdirectories

## Project Insights & Learnings

### What Works Well

1. **Feature-Based Architecture**

   - Easy to find code
   - Clear mental model
   - Scales nicely
   - Minimal coupling

2. **localStorage + React State**

   - Simple and effective
   - No backend complexity
   - Instant persistence
   - Works offline perfectly

3. **Lazy Loading**

   - Fast initial load
   - Users only load what they need
   - Vite makes this trivial
   - React.lazy + Suspense pattern

4. **Centralized State (useAppController)**

   - Single source of truth
   - Easy to reason about
   - No prop drilling issues
   - Context for UI-only state

5. **TypeScript Benefits**
   - Catches bugs early
   - Refactoring confidence
   - Better IDE experience
   - Self-documenting

### Challenges Faced

1. **localStorage Size Limits**

   - Safari especially strict (5MB)
   - Progress photos can fill quickly
   - **Solution**: Export/import for backup
   - **Future**: Consider image compression or IndexedDB

2. **PWA Installation Quirks**

   - iOS Safari has limited PWA support
   - Install prompt timing tricky
   - **Solution**: User-initiated install from Settings
   - **Trade-off**: Less discoverable than auto-prompt

3. **AI API Rate Limits**

   - Free tier constrains heavy users
   - Coaches with many clients hit limits
   - **Solution**: Clear error messages, user controls API key
   - **Future**: Could add retry logic or queueing

4. **No Real-time Sync**

   - Users want multi-device access
   - localStorage doesn't sync
   - **Solution**: Export/import workflow
   - **Future**: Optional cloud sync most requested feature

5. **Type Complexity**
   - Some types (WorkoutSession) quite complex
   - Discriminated unions need careful design
   - **Solution**: Keep types cohesive, document well
   - **Benefit**: Type safety prevents runtime bugs

### User Feedback Patterns

Common user requests (if development continues):

1. **Cloud Sync** (Most Requested)

   - "I want to use on phone and computer"
   - "Lost data when cleared browser"
   - Solution would be optional backend sync

2. **Apple Health Integration**

   - "Track workouts in Health app"
   - Would require native app or health API

3. **Rest Timer Notifications**

   - "Timer doesn't notify when phone locked"
   - PWA limitation - would need native app

4. **More Program Variants**

   - "Can you add Pervertor?"
   - "I want to customize percentages"
   - Could add custom program builder

5. **Video Form Checks**
   - "Can I upload videos?"
   - "Store videos in app"
   - Storage challenge - would need cloud solution

## Technical Debt

### Known Issues

1. **No Automated Tests**

   - Manual testing only
   - Refactoring carries risk
   - **Priority**: Medium
   - **Action**: Add Jest + RTL when time allows

2. **localStorage Quota Handling**

   - Could be more graceful
   - Users hit limits unexpectedly
   - **Priority**: Low
   - **Action**: Better warnings, compression

3. **Image Storage**

   - Base64 in localStorage inefficient
   - No compression
   - **Priority**: Low
   - **Action**: Implement compression or move to IndexedDB

4. **Error Logging**

   - Console logs only
   - No external error tracking
   - **Priority**: Low
   - **Action**: Add Sentry or similar (optional)

5. **Bundle Size Could Be Smaller**
   - Some unused Recharts code
   - Could tree-shake better
   - **Priority**: Low
   - **Action**: Audit bundle with analyzer

### Refactoring Opportunities

1. **Split useAppController**

   - Single hook getting large
   - Could split into domain hooks
   - **Impact**: Medium refactor
   - **Benefit**: Better organization

2. **Improve Type Coverage**

   - Some 'any' types remain
   - Could narrow unknown types
   - **Impact**: Low effort
   - **Benefit**: More type safety

3. **Consolidate Duplicate Logic**
   - Some calculation logic duplicated
   - Could extract more utilities
   - **Impact**: Low
   - **Benefit**: DRY principle

## Next Steps (If Development Resumes)

### Immediate Priorities

1. **User Testing**

   - Get app in hands of real users
   - Gather feedback on UX
   - Identify pain points
   - Validate feature priorities

2. **Performance Monitoring**

   - Add Web Vitals tracking
   - Monitor bundle sizes
   - Identify slow operations
   - Optimize based on data

3. **Accessibility Audit**
   - Test with screen readers
   - Improve keyboard navigation
   - Ensure color contrast
   - Add ARIA labels

### Medium-Term Enhancements

1. **Cloud Sync (Optional)**

   - Firebase or Supabase backend
   - Keep localStorage primary
   - Sync as opt-in feature
   - Handle conflicts gracefully

2. **Enhanced Analytics**

   - More chart types
   - PR tracking
   - Volume trends
   - Recovery metrics

3. **Testing Suite**
   - Jest for unit tests
   - React Testing Library for components
   - Playwright for E2E
   - CI/CD pipeline

### Long-Term Possibilities

1. **Native Mobile Apps**

   - React Native port
   - Better OS integration
   - Push notifications
   - Health app sync

2. **Advanced Programming**

   - Program builder UI
   - More 5/3/1 variants
   - Auto-regulation
   - Periodization templates

3. **Social Features**
   - Optional workout sharing
   - Community challenges
   - Coach-client communication
   - Workout templates library

## Environment & Context

### Development Environment

- **IDE**: VS Code with TypeScript, Prettier, ESLint extensions
- **Node**: v18+
- **Package Manager**: npm
- **OS**: Cross-platform development (works on macOS, Windows, Linux)

### Deployment Context

- **Hosting**: Static hosting (Vercel, Netlify, etc.)
- **Build**: `npm run build` → dist/
- **PWA**: Service worker caches for offline
- **URL**: Can be deployed to any domain

### User Context

- **Primary Users**: Individual strength athletes
- **Secondary Users**: Coaches managing clients
- **Device**: Mobile-first, but works on desktop
- **Usage**: Gym environment (potentially offline)

## Memory Bank Maintenance

### When to Update This File

Update activeContext.md when:

- Starting new feature work
- Making architectural decisions
- Discovering new patterns
- User feedback patterns emerge
- Technical debt identified
- Completing major milestones

### Related Files

- **projectbrief.md**: Core requirements and scope
- **systemPatterns.md**: Architecture and code patterns
- **progress.md**: What's done vs what remains
- **techContext.md**: Technology stack details
