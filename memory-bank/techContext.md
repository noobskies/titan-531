# Technology Context: Titan 5/3/1

## Technology Stack

### Core Framework & Libraries

#### React 19.2.0

- **Purpose**: UI framework
- **Why Chosen**:
  - Component-based architecture fits feature-based organization
  - Rich ecosystem and tooling
  - Excellent performance with virtual DOM
  - Strong TypeScript support
  - New features in v19: improved concurrent rendering, automatic batching

#### TypeScript 5.8.2

- **Purpose**: Type safety and developer experience
- **Why Chosen**:
  - Catches errors at compile time
  - Better IDE autocomplete and refactoring
  - Self-documenting code through types
  - Essential for large codebase maintainability

#### Vite 6.2.0

- **Purpose**: Build tool and dev server
- **Why Chosen**:
  - Extremely fast HMR (Hot Module Replacement)
  - Native ES modules in dev
  - Optimized production builds with Rollup
  - Simple configuration
  - Built-in TypeScript support
- **Build Output**: Optimized, code-split bundles

### UI & Styling

#### TailwindCSS 4.1.17

- **Version**: v4 (migrated from CDN in November 2025)
- **Integration**: @tailwindcss/postcss plugin with PostCSS
- **Usage**: Utility-first CSS classes
- **Pattern**: Inline className strings with Tailwind utilities
- **Theme System**: @theme directive with CSS custom properties

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #ef4444;
  --color-dark: #0f172a;
  --color-darker: #020617;
  --color-card: #1e293b;

  --font-family-sans: "Inter", sans-serif;
}
```

**Configuration**:

- `postcss.config.js`: PostCSS configuration with @tailwindcss/postcss
- `tailwind.config.js`: Content paths for file scanning
- Build process integrated with Vite

**Migration Notes**:

- Migrated from CDN to build process for production readiness
- Tailwind v4 uses modern @theme directive instead of JavaScript config
- Cleaner CSS with single @import statement
- Better performance and smaller bundle size

#### Lucide React 0.554.0

- **Purpose**: Icon library
- **Why Chosen**:
  - Consistent, modern icon design
  - Tree-shakeable (only imports used icons)
  - React-optimized components
  - Large icon set covering all app needs

### Data Visualization

#### Recharts 3.4.1

- **Purpose**: Charts and analytics visualization
- **Usage**:
  - Line charts for strength progression
  - Bar charts for volume tracking
  - Area charts for body metrics
- **Why Chosen**:
  - React-native approach (components)
  - Responsive by default
  - Good TypeScript support
  - Customizable and themeable

### AI Integration

#### Google Generative AI SDK 1.30.0 (@google/genai)

- **Purpose**: Gemini API integration
- **Features Used**:
  - Text generation (workout insights, programming advice)
  - Vision API (form check analysis)
  - Chat conversations (follow-up questions)
- **Model**: gemini-1.5-flash (fast, cost-effective)
- **Authentication**: User-provided API key stored in localStorage

### Cloud Sync Integration (Optional)

#### Supabase 2.84.0 (@supabase/supabase-js)

- **Purpose**: Optional cloud sync for cross-device data access
- **Why Chosen**:
  - No backend code needed (client-only architecture maintained)
  - Built-in authentication (email/password + OAuth)
  - Row-level security at database level
  - PostgreSQL database (can self-host)
  - Real-time subscriptions available (future feature)
  - Generous free tier (50k MAU, 500MB database)
- **Integration Status**: Phase 3 Complete (Data Migration Service)
- **Architecture**: Hybrid approach (guest mode localStorage, authenticated mode Supabase)

#### Supabase Auth UI 0.4.7 (@supabase/auth-ui-react)

- **Purpose**: Pre-built authentication UI components
- **Features**:
  - Email/password forms
  - OAuth provider buttons (Google, GitHub, etc.)
  - Themed components matching app design
  - Automatic form validation
- **Usage**: Integrated in `components/AuthModal.tsx`

#### Supabase Auth UI Shared 0.1.8 (@supabase/auth-ui-shared)

- **Purpose**: Shared utilities and themes for auth UI
- **Features**: Theme system (ThemeSupa), common auth utilities

### Development Dependencies

#### @vitejs/plugin-react 5.0.0

- **Purpose**: Vite plugin for React support
- **Features**: Fast Refresh, JSX transform

#### @types/node 22.14.0

- **Purpose**: Node.js type definitions for build scripts

## Development Environment

### Setup Requirements

#### Prerequisites

```bash
Node.js: v18+ (ES modules, modern JavaScript features)
npm: v9+ (or pnpm, yarn, bun)
Modern browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
```

#### Installation

```bash
# Clone repository
git clone git@github.com:noobskies/titan-531.git
cd titan-531

# Install dependencies
npm install

# Set up environment (optional - only needed for AI features)
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

### Development Server

**Command**: `npm run dev`

**Vite Configuration** (vite.config.ts):

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

**Features**:

- Hot Module Replacement (HMR) - instant updates without losing state
- Fast startup (~200ms)
- Port: 5173 (default)
- Automatic browser opening

### Build & Deployment

#### Build Process

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

**Build Output**:

- Location: `dist/` directory
- Entry: `index.html`
- Assets: Chunked, hashed JavaScript/CSS files
- PWA: Service worker and manifest included
- Size: ~200KB initial bundle + lazy-loaded chunks

#### Deployment Strategy

**Static Hosting** (compatible with):

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- Any static file server

**Deployment Steps**:

1. Build: `npm run build`
2. Upload `dist/` folder to hosting provider
3. Configure: Serve `index.html` for all routes (SPA routing)

**No Backend Required**: Entire app runs client-side

### Browser Compatibility

#### Target Browsers

```json
{
  "browserslist": ["defaults", "not IE 11", "maintained node versions"]
}
```

#### Supported Browsers

- **Chrome/Edge**: 90+ (Chromium)
- **Firefox**: 88+
- **Safari**: 14+ (iOS 14+)
- **Samsung Internet**: 14+

#### Required Features

- ES Modules
- localStorage (5-10MB available)
- Service Workers (for PWA)
- Web Share API (optional - for sharing)
- Speech Synthesis API (optional - for voice)
- IndexedDB (not currently used, but available)

#### Progressive Enhancement

- **Core Features**: Work on all supported browsers
- **PWA Install**: Works on Chrome, Edge, Safari (limited), Firefox (limited)
- **Web Share**: Falls back to copy-to-clipboard
- **Voice Announcements**: Gracefully disabled if not supported

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Key Settings**:

- **strict**: true - Maximum type safety
- **jsx**: react-jsx - New JSX transform (no React import needed)
- **moduleResolution**: bundler - Vite-optimized resolution
- **noUnusedLocals/Parameters**: Enforce clean code

## Data Storage Architecture

### localStorage Strategy

#### Storage Keys & Structure

**Profile Storage**:

```typescript
// Root profile (includes coach data and clients array)
localStorage.setItem("titan_profile", JSON.stringify(rootProfile));

// Individual client profiles (if coach mode)
localStorage.setItem("titan_profile_<clientId>", JSON.stringify(clientProfile));
```

**Session Storage**:

```typescript
// Active workout in progress
localStorage.setItem('active_session', JSON.stringify(workoutSession));

// All completed workouts
localStorage.setItem('workout_history', JSON.stringify(sessions[]));
```

**UI State**:

```typescript
// Currently viewing profile
localStorage.setItem("viewing_profile", "root" | clientId);

// App version for update detection
localStorage.setItem("titan_version", "1.2.1");
```

#### Storage Limits

**Typical Limits**:

- Chrome/Edge: 10MB
- Firefox: 10MB
- Safari: 5MB (iOS stricter)

**Size Considerations**:

- Profile JSON: ~5-15KB
- Workout history (100 sessions): ~50-100KB
- Progress photos (base64): ~100-500KB per photo
- Nutrition logs: ~10-50KB

**Mitigation Strategies**:

- Export/import functionality
- Consider image compression for photos
- Periodic cleanup of old data (not implemented)
- User education about storage limits

#### localStorage Best Practices

1. **Serialization**: All data JSON.stringify/parse
2. **Error Handling**: Try/catch on all operations
3. **Validation**: Parse and validate on load
4. **Atomic Updates**: Full object replacement (no partial updates)
5. **Backup**: Export feature for user-initiated backup

### No Backend Architecture

**Implications**:

- **Pros**:
  - Zero hosting costs
  - Perfect privacy (no data leaves device)
  - Works 100% offline
  - No authentication needed
  - Instant deployment
- **Cons**:
  - No cross-device sync
  - Data loss if localStorage cleared
  - Storage limits
  - No server-side features (email, push notifications)

**Future Consideration**: Optional cloud sync could be added via:

- Firebase Realtime Database
- Supabase
- Custom backend
- **Approach**: Keep localStorage primary, add sync as optional feature

## API Integration

### Google Gemini API

#### Configuration

**API Key Management**:

```typescript
// User provides key in Settings
// Stored in localStorage (encrypted would be better but requires backend)
const apiKey = localStorage.getItem("gemini_api_key");
```

**API Initialization**:

```typescript
import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

#### Usage Patterns

**Text Generation** (Workout Insights):

```typescript
const prompt = `
Analyze this 5/3/1 training data:
- Cycle: ${cycle}
- Recent AMRAP reps: ${amrapReps}
- Volume trend: ${volumeData}

Provide:
1. Performance assessment
2. Programming recommendations
3. Technique reminders for next cycle
`;

const result = await model.generateContent(prompt);
const analysis = result.response.text();
```

**Vision Analysis** (Form Checks):

```typescript
const prompt = `Analyze this ${liftType} form. Check:
- Bar path
- Depth (for squats)
- Back angle
- Knee tracking
- Any safety concerns

Provide specific, actionable feedback.`;

const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageData,
    },
  },
]);

const feedback = result.response.text();
```

**Conversational AI** (Follow-up Questions):

```typescript
// Maintain chat history
const chat = model.startChat({
  history: previousMessages,
  generationConfig: {
    maxOutputTokens: 1000,
  },
});

const result = await chat.sendMessage(userQuestion);
const response = result.response.text();
```

#### Rate Limits & Quotas

**Free Tier** (typical):

- 60 requests per minute
- 1500 requests per day
- Best for personal use

**Paid Tier**:

- Higher limits
- Better for coach mode with multiple clients

**Error Handling**:

```typescript
try {
  const result = await model.generateContent(prompt);
  return result.response.text();
} catch (error) {
  if (error.message.includes("RATE_LIMIT")) {
    throw new Error("Rate limit exceeded. Please wait and try again.");
  } else if (error.message.includes("API_KEY")) {
    throw new Error("Invalid API key. Please check your settings.");
  } else if (error.message.includes("QUOTA")) {
    throw new Error("Daily quota exceeded. Try again tomorrow.");
  }
  throw new Error("AI service unavailable. Please try again later.");
}
```

## Progressive Web App (PWA)

### Manifest Configuration

**manifest.json**:

```json
{
  "name": "Titan 5/3/1",
  "short_name": "Titan531",
  "description": "5/3/1 Strength Training Tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

**service-worker.js**:

```javascript
const CACHE_NAME = "titan-531-v1.2.1";
const urlsToCache = ["/", "/index.html", "/manifest.json"];

// Install - cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

**Strategy**: Network-first with cache fallback

- Always tries network (ensures latest version)
- Falls back to cache if offline
- Appropriate for frequently updated app

### PWA Installation

**Desktop** (Chrome, Edge):

1. Install button appears in address bar
2. Can also install from app menu
3. Creates desktop shortcut
4. Opens in app window (no browser UI)

**Mobile** (Chrome, Safari):

1. "Add to Home Screen" prompt
2. Icon on home screen
3. Full-screen experience
4. Splash screen on launch

**Installation Prompt Handling**:

```typescript
// Capture install prompt event
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  setInstallPrompt(e); // Save for later
});

// User-initiated install (from Settings)
const handleInstall = async () => {
  if (!installPrompt) return;

  installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;

  if (outcome === "accepted") {
    showToast("App installed!", "success");
  }

  setInstallPrompt(null);
};
```

## Platform-Specific Features

### Web APIs Used

#### Speech Synthesis API (Voice Announcements)

```typescript
const speak = (text: string) => {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

// Usage
speak("Rest period complete. Ready for next set.");
```

#### Web Share API

```typescript
const shareWorkout = async (session: WorkoutSession) => {
  if (!navigator.share) {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(workoutText);
    showToast("Copied to clipboard", "info");
    return;
  }

  try {
    await navigator.share({
      title: session.title,
      text: `Completed ${session.title}`,
      url: window.location.href,
    });
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Share failed:", error);
    }
  }
};
```

#### Notification API

```typescript
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

const showNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  }
};

// Usage: Rest timer complete notification
showNotification("Rest Complete", "Ready for next set!");
```

#### Geolocation API (Gym Finder)

```typescript
const findNearbyGyms = async () => {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => reject(error),
      { timeout: 10000 }
    );
  });
};
```

## Development Tools

### IDE Setup (VS Code)

**Recommended Extensions**:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

**Workspace Settings** (.vscode/settings.json):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Version Control

**Git Repository**: git@github.com:noobskies/titan-531.git

**Branch Strategy**: Main branch deployment

**.gitignore**:

```
node_modules/
dist/
.env.local
*.log
.DS_Store
```

## Performance Optimization

### Build Optimizations

**Vite Optimizations**:

- Code splitting (lazy loaded routes)
- Tree shaking (unused code removed)
- Minification (Terser)
- Asset optimization (images, fonts)
- Chunk hashing for caching

**Bundle Analysis**:

```bash
npm run build -- --mode analyze
```

### Runtime Optimizations

**React Optimizations**:

- useMemo for expensive calculations
- React.lazy for code splitting
- Component memoization (React.memo)
- Avoid unnecessary re-renders

**localStorage Optimizations**:

- Batch updates when possible
- Async operations (non-blocking)
- Debounce frequent saves

## Testing Approach

### Current State

No automated tests implemented (MVP focus)

### Recommended Testing Strategy

**Unit Tests** (Jest + React Testing Library):

```typescript
// Example: utils/plateMath.test.ts
describe("calculatePlates", () => {
  it("calculates correct plates for 225lbs", () => {
    const plates = calculatePlates(225, "lbs", 5);
    expect(plates).toEqual([45, 45]); // 2x45 per side
  });
});
```

**Integration Tests**:

```typescript
// Example: useAppController workflow tests
describe("Workout completion flow", () => {
  it("adds session to history and clears active session", () => {
    // Test complete workflow
  });
});
```

**E2E Tests** (Playwright/Cypress):

```typescript
test("complete full workout", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Start Workout");
  await page.click("text=Squat");
  // ... complete workout flow
  await page.click("text=Complete Workout");
  await expect(page.locator("text=Workout completed!")).toBeVisible();
});
```

## Monitoring & Analytics

### Current State

- No external analytics (privacy-focused)
- No error tracking service
- No performance monitoring

### Console Logging Strategy

```typescript
// Development only
if (process.env.NODE_ENV === "development") {
  console.log("Workout started:", session);
}

// Production errors
console.error("Critical error:", error);
```

### Future Considerations

- Optional Sentry for error tracking
- Optional Plausible/Fathom for privacy-friendly analytics
- Performance monitoring with Web Vitals API

## Dependencies Management

### Update Strategy

- Regular security updates (npm audit)
- Breaking changes reviewed carefully
- Lock file committed (package-lock.json)

### Key Dependency Notes

**React 19**:

- Stable release, no breaking changes expected
- Excellent TypeScript support
- Active development and community

**Vite 6**:

- Latest stable version
- Actively maintained
- Great performance

**Google GenAI SDK**:

- Official Google library
- Well maintained
- Frequent updates for new models

## Environment Variables

### Development (.env.local)

```bash
# Optional - only for AI features
GEMINI_API_KEY=your_api_key_here
```

### Production

No environment variables needed (API key user-provided)

## Security Considerations

### XSS Prevention

- React auto-escapes by default
- No dangerouslySetInnerHTML usage
- User input sanitized

### API Key Security

- Stored in localStorage (client-side only)
- Not committed to git (.env.local in .gitignore)
- User-controlled (they provide their own key)

### Content Security Policy

```html
<!-- Could add CSP headers for enhanced security -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'"
/>
```

## Native Mobile Architecture (Capacitor)

### Capacitor 7.4.4

- **Purpose**: Native mobile wrapper for PWA
- **Why Chosen**:
  - Wraps existing PWA without code changes
  - Minimal configuration required
  - Official Google Play support via Trusted Web Activity
  - Better than Cordova (modern architecture)
  - No need for React Native rewrite
- **Platform**: Android (iOS support available but not implemented)

### Capacitor Integration

#### Core Dependencies

```json
{
  "dependencies": {
    "@capacitor/core": "^7.4.4",
    "@capacitor/android": "^7.4.4",
    "@capacitor/splash-screen": "^7.0.3",
    "@capacitor/status-bar": "^7.0.3",
    "@capacitor/keyboard": "^7.0.3"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.4.4"
  }
}
```

#### Configuration (capacitor.config.ts)

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.titan.workout",
  appName: "Titan 531",
  webDir: "dist",
  server: {
    androidScheme: "https", // Secure context for APIs
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#020617",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#020617",
    },
  },
};

export default config;
```

#### Platform Detection Utilities

```typescript
// src/utils/platformDetection.ts
import { Capacitor } from "@capacitor/core";

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === "android";
};

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === "web";
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
```

### Android Build Process

#### Development Workflow

```bash
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Or run with live reload
npm run android:dev
```

#### Project Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── assets/
│   │       │   └── public/  # Web assets copied here
│   │       ├── java/com/titan/workout/
│   │       └── res/         # Android resources
│   ├── build.gradle         # App-level build config
│   └── capacitor.build.gradle
├── gradle/
├── build.gradle             # Project-level build config
├── settings.gradle
└── variables.gradle
```

#### Build Configuration

**Vite Config for Capacitor**:

```typescript
export default defineConfig(({ mode }) => {
  return {
    base: "", // Important: Empty base for Capacitor
    build: {
      outDir: "dist",
      sourcemap: false, // Disable for production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            charts: ["recharts"],
            icons: ["lucide-react"],
          },
        },
      },
    },
  };
});
```

#### Conditional Service Worker

Service worker registration is conditional to avoid conflicts:

```typescript
// index.html
if ("serviceWorker" in navigator && window.location.protocol !== "capacitor:") {
  // Only register on web, not in Capacitor
  navigator.serviceWorker.register("/service-worker.js");
}
```

### Android Build Commands

```bash
# Development
npm run android:dev          # Live reload on device
npx cap run android          # Run on connected device

# Build & Test
npm run build                # Build web assets
npm run android:sync         # Sync to Android
npm run android:build        # Build + sync + open Android Studio

# Production
cd android
./gradlew assembleRelease    # Build APK
./gradlew bundleRelease      # Build AAB for Play Store
```

### Android Studio Requirements

- **Android Studio**: Latest stable version
- **Android SDK**: API 24+ (Android 7.0+)
- **Java**: JDK 17+
- **Gradle**: 8.x (included)

### Capacitor Plugins

#### Splash Screen Plugin

```typescript
import { SplashScreen } from "@capacitor/splash-screen";

// Show splash
await SplashScreen.show();

// Hide splash
await SplashScreen.hide();
```

#### Status Bar Plugin

```typescript
import { StatusBar, Style } from "@capacitor/status-bar";

// Set style
await StatusBar.setStyle({ style: Style.Dark });

// Set background color
await StatusBar.setBackgroundColor({ color: "#020617" });
```

#### Keyboard Plugin

```typescript
import { Keyboard } from "@capacitor/keyboard";

// Listen to keyboard events
Keyboard.addListener("keyboardWillShow", (info) => {
  console.log("Keyboard height:", info.keyboardHeight);
});

// Hide keyboard
await Keyboard.hide();
```

### Deployment Targets

#### Web Deployment

- **Build**: `npm run build`
- **Output**: `dist/` directory
- **Hosting**: Vercel, Netlify, etc.
- **Features**: Full PWA capabilities

#### Android Deployment

- **Build**: `npm run android:build`
- **Output**: `android/app/build/outputs/`
- **Format**: APK or AAB (App Bundle)
- **Target**: Google Play Store

### Dual Deployment Architecture

The app supports both web and native Android simultaneously:

1. **Shared Codebase**: Same React components and logic
2. **Platform Detection**: Runtime checks for native features
3. **Conditional Features**:
   - Service worker: Web only
   - Native plugins: Android only
4. **Storage**: localStorage works in both environments
5. **APIs**: All external APIs (Gemini, Supabase) work in both

### Build Output Sizes

**Web Build**:

- Initial bundle: ~200KB
- Main chunk: 461.88 KB (116.25 KB gzipped)
- Charts chunk: 355.83 KB (105.06 KB gzipped)
- Lazy-loaded features: ~4-22KB each

**Android APK** (estimated):

- Debug APK: ~50-60MB
- Release APK: ~40-50MB (with ProGuard/R8)
- AAB (App Bundle): ~30-40MB

## Known Technical Limitations

1. **localStorage Size**: 5-10MB limit (especially tight on Safari)
2. **No Sync**: Data doesn't sync across devices
3. **Browser-Dependent**: Some PWA features limited on iOS
4. **API Costs**: Gemini API has usage limits/costs
5. **Image Storage**: Base64 in localStorage is storage-intensive
6. **No Offline AI**: AI features require internet connection
7. **Android Studio Required**: Full Android development needs Android Studio
8. **Play Store Submission**: Requires Google Play Developer account ($25 one-time)

## Future Technical Considerations

### Potential Enhancements

- IndexedDB migration for larger storage
- Optional backend for cloud sync
- Image compression for photos
- Service worker background sync
- Push notifications (requires backend)
- Native mobile apps (React Native port)
- Desktop app (Electron/Tauri)

### Scalability Notes

Current architecture supports:

- Single user: Excellent
- Coach with 5-10 clients: Good
- Coach with 50+ clients: May hit storage limits
- High-frequency usage: Excellent (all local)
