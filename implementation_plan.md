# Implementation Plan: Android APK for Google Play Store

## [Overview]

Convert Titan 5/3/1 from a Progressive Web App to an Android APK using Capacitor for Google Play Store distribution.

The implementation will integrate Capacitor into the existing Vite + React + TypeScript PWA, creating a hybrid mobile application that wraps the web app in a native Android container. The current codebase requires minimal changes - primarily configuration and build setup adjustments. The app will retain full offline functionality, localStorage persistence, and all current features while gaining native Android capabilities like better splash screens, native status bar, and Play Store distribution readiness.

**Recommended Solution:** Capacitor by Ionic

- PWA-first design wraps existing web app without code changes
- Official Google Play Support via Trusted Web Activity (TWA)
- Minimal configuration, works with Vite + React out-of-the-box
- Active maintenance by Ionic team
- Better than Cordova (modern architecture) and React Native (no rewrite needed)

## [Types]

No new TypeScript types required for basic Capacitor integration.

The existing type system in `types/` directory will remain unchanged. Capacitor provides its own type definitions through `@capacitor/core` which will be available globally after installation. If native plugins are added later (e.g., `@capacitor/camera`, `@capacitor/filesystem`), their types will be automatically included.

Optional future enhancement: Create a `types/capacitor.d.ts` for custom native plugin type definitions if developing custom Android plugins.

## [Files]

Configuration and build files will be created and modified to support Android app generation.

### New Files to Create:

1. **`capacitor.config.ts`** (root directory)

   - Main Capacitor configuration
   - App ID: `com.titan.workout` (or user-preferred reverse domain)
   - App name: "Titan 531"
   - Web directory: `dist` (Vite build output)
   - Android-specific configuration (splash screen, status bar)

2. **`android/` directory** (created by Capacitor CLI)

   - Complete Android Studio project structure
   - Native Android code and resources
   - Gradle build files
   - AndroidManifest.xml with permissions
   - App icons and splash screens

3. **`resources/` directory** (root directory)

   - `icon.png` (1024x1024) - App icon source image
   - `splash.png` (2732x2732) - Splash screen source image
   - Optional: adaptive icons, notification icons

4. **`tailwind.config.js`** (root directory)

   - Tailwind CSS configuration (migrated from inline config in index.html)
   - Theme colors, fonts, custom utilities

5. **`postcss.config.js`** (root directory)

   - PostCSS configuration for Tailwind processing
   - Autoprefixer settings

6. **`src/index.css`** (new file)

   - Tailwind directives: @tailwind base, components, utilities
   - Custom CSS that was in index.html style tags

7. **`src/utils/platformDetection.ts`** (new file)
   - Helper functions: isNativeApp(), isAndroid(), isWeb()
   - Used for conditional native feature usage

### Files to Modify:

1. **`package.json`**

   - Add dependencies: @capacitor/core, @capacitor/cli, @capacitor/android
   - Add devDependencies: tailwindcss, postcss, autoprefixer
   - Add optional dependencies: @capacitor/splash-screen, @capacitor/status-bar, @capacitor/keyboard
   - Add scripts:
     ```json
     "android:dev": "cap run android",
     "android:build": "npm run build && cap sync android && cap open android",
     "android:sync": "cap sync android"
     ```

2. **`vite.config.ts`**

   - Ensure base path is set correctly for Capacitor
   - Configure build optimizations for mobile (chunk size limits)
   - Verify build output directory is `dist`
   - Add build options for production mobile optimization

3. **`index.html`**

   - **REMOVE:** CDN-based Tailwind script tag
   - **REMOVE:** AI Studio import maps (use npm packages instead)
   - **VERIFY:** Viewport meta tags are mobile-optimized
   - **KEEP:** PWA manifest link, theme-color meta tags
   - **MODIFY:** Service worker registration to be conditional on platform

4. **`index.tsx`**

   - Import new `src/index.css` file at the top
   - Conditionally import test connection only in development
   - Add platform detection for service worker registration
   - No other changes needed

5. **`tsconfig.json`**

   - Add Capacitor types to compilerOptions.types array: ["node", "@capacitor/core"]
   - Verify other settings remain compatible

6. **`manifest.json`**

   - Update to align with Capacitor requirements
   - Ensure app name matches Android app name
   - Verify icon paths are correct
   - Keep existing PWA configuration

7. **`.gitignore`**

   - Add Android-specific entries:
     ```
     android/app/build/
     android/.gradle/
     android/app/release/
     android/app/debug/
     android/.idea/
     android/local.properties
     *.keystore
     ```

8. **`.env.local`** (optional)
   - Document usage for Android builds
   - Add any Android-specific environment variables if needed

### Files to Keep with Conditional Logic:

1. **`service-worker.js`**
   - Keep for PWA web version
   - Register conditionally (only on web platform, not in Capacitor)
   - Capacitor handles offline functionality natively

## [Functions]

Minimal function modifications required since Capacitor wraps existing code.

### New Functions to Add:

1. **`src/utils/platformDetection.ts`** (entire new file)

   ```typescript
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

   - Purpose: Detect runtime environment
   - Used for conditional native feature usage throughout app

### Modified Functions:

1. **Service worker registration** in `index.html` (inline script modification)

   - Current: Unconditionally registers service worker
   - Modified: Only register on web platform
   - Implementation:
     ```javascript
     if (
       "serviceWorker" in navigator &&
       window.location.protocol !== "capacitor:"
     ) {
       // Only register on web, not in Capacitor app
       navigator.serviceWorker.register("/service-worker.js");
     }
     ```

2. **`index.tsx`** entry point

   - Remove unconditional test connection import
   - Change from: `import "./services/database/testConnection";`
   - Change to: Conditional import only in development and web mode
   - Add platform-aware initialization if needed

3. **Environment variable access verification**
   - No function changes needed
   - Verify all `import.meta.env.VITE_*` usage works in Capacitor build
   - Test in production APK to ensure variables load correctly

### No Functions to Remove:

All existing application logic remains unchanged. Capacitor operates as a wrapper around the web application and does not require modifications to business logic, React components, services, or utilities. The feature-based architecture (features/, services/, hooks/, components/) remains intact.

## [Classes]

No class modifications required.

The existing React component architecture using functional components and hooks remains unchanged. Capacitor operates as a wrapper around the web application and does not require class-based modifications.

All existing components in:

- `components/` - Layout, Button, Modal, Toast, etc.
- `features/` - Dashboard, Workout, History, Settings, etc.
- `context/` - UIContext
- `hooks/` - useAppController, useLocalStorage, useRestTimer

...remain untouched with their current implementations.

If future native plugins are integrated (camera, filesystem, etc.), they will be used through functional APIs provided by Capacitor plugins, maintaining the current functional programming paradigm.

## [Dependencies]

New dependencies for Capacitor integration and Tailwind build process.

### Core Capacitor Dependencies (Required):

```json
{
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

Installation command:

```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
```

### Tailwind CSS Build Dependencies (Required):

Replace CDN with proper build process:

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

Installation command:

```bash
npm install -D tailwindcss postcss autoprefixer
```

### Optional but Recommended Capacitor Plugins:

```json
{
  "dependencies": {
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0"
  }
}
```

Benefits:

- **Splash Screen**: Better control over app launch experience
- **Status Bar**: Style status bar to match app theme
- **Keyboard**: Handle keyboard show/hide events, adjust layout

Installation command:

```bash
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
```

### Resource Generation Tool:

```bash
npm install -g @capacitor/assets
```

Used to generate Android icon and splash screen assets from source images.

### Existing Dependencies (Already Present):

Verify these use npm packages, not CDN imports:

- ✓ `react@^19.2.0` - Already present in package.json
- ✓ `react-dom@^19.2.0` - Already present in package.json
- ✓ `lucide-react@^0.554.0` - Already present in package.json
- ✓ `@google/genai@^1.30.0` - Already present in package.json
- ✓ `recharts@^3.4.1` - Already present in package.json
- ✓ `@supabase/supabase-js@^2.84.0` - Already present in package.json

### Build Process Integration:

Capacitor integrates with existing Vite build workflow:

1. `npm run build` → Creates optimized production bundle in `dist/`
2. `npx cap sync android` → Copies web assets to `android/app/src/main/assets/public/`
3. Android Studio or Gradle → Builds APK/AAB from native Android project

### Version Compatibility:

- Node.js: v18+ required (already using v18+)
- Capacitor: v6.x (latest stable)
- Android SDK: API 24+ (Android 7.0+)
- Gradle: 8.x (included in Capacitor Android project)
- Kotlin: 1.9+ (included in Capacitor Android project)

## [Testing]

Testing strategy for Android APK functionality and Play Store readiness.

### Development Testing (While Coding):

1. **Live Reload on Physical Device**

   ```bash
   npx cap run android --livereload --external
   ```

   - Connect Android device via USB with USB debugging enabled
   - App runs on device with live reload
   - Real-time updates when code changes
   - Verify all features work in native context
   - Test gestures, touch interactions, keyboard behavior

2. **Android Studio Emulator Testing**
   - Open project: `npx cap open android`
   - Create multiple emulator profiles in Android Studio
   - Test on different Android versions (minimum API 24, test up to API 34)
   - Test different screen sizes (phone, tablet)
   - Verify responsive layout on various DPI settings
   - Monitor memory usage, CPU usage in Android Studio Profiler

### APK Testing (Before Release):

1. **Debug APK Installation and Testing**

   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```

   - Locate APK: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Install via: `adb install app-debug.apk`
   - Or drag-drop to emulator, or transfer to physical device

   **Test Checklist:**

   - ✓ App launches without crashes
   - ✓ Splash screen appears correctly
   - ✓ All navigation tabs work (Dashboard, Workout, History, Profile, Tools)
   - ✓ Workout tracking (start workout, log sets, complete workout)
   - ✓ History viewing and calendar navigation
   - ✓ Settings and customization (themes, units, timers)
   - ✓ Offline functionality (airplane mode test)
   - ✓ localStorage persistence (close app, reopen, data retained)
   - ✓ AI Coach features (API calls work, form checks)
   - ✓ Supabase integration (if configured)
   - ✓ Export/Import functionality (file picker works)
   - ✓ Coach mode and client switching
   - ✓ Nutrition tracking
   - ✓ Tools (plate calculator, 1RM calculator, timers)
   - ✓ Achievement unlocks and notifications
   - ✓ Cycle transitions
   - ✓ REST timer with audio/voice

2. **Platform-Specific Feature Testing**
   - Back button behavior (Android)
   - Status bar color matches theme
   - Keyboard handling (doesn't obscure input fields)
   - Deep linking (if implemented)
   - Share functionality (native Android share sheet)
   - Notifications (if implemented)

### Release Build Testing (Pre-Submission):

1. **Release APK Generation**

   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleRelease
   ```

   - Requires signing key configuration in `build.gradle`
   - Locate APK: `android/app/build/outputs/apk/release/app-release.apk`
   - Size should be optimized with ProGuard/R8

2. **Release APK Validation**

   - Install release APK on test devices
   - Verify code obfuscation doesn't break functionality
   - Test on low-end devices (4GB RAM minimum target)
   - Test on various Android versions (7.0 through 14)
   - Measure app startup time (should be < 3 seconds)
   - Monitor battery usage
   - Test with poor network conditions

3. **Play Store Pre-Launch Report Testing**
   - Upload APK to Play Console internal testing track
   - Google automatically tests on 20+ device configurations
   - Review pre-launch report for crashes or issues
   - Fix any detected issues before production release

### Play Store Preparation Testing:

1. **Assets Validation**

   - App icon displays correctly in launcher
   - Splash screen appears on launch
   - Screenshots for all required resolutions
   - Feature graphic meets requirements (1024x500)
   - Promotional video (optional)

2. **Store Listing Testing**

   - Install app from internal test track
   - Verify app description matches actual functionality
   - Test age rating appropriateness
   - Verify content rating accuracy
   - Check privacy policy URL accessibility

3. **Permissions Audit**

   - Review AndroidManifest.xml permissions
   - Ensure only necessary permissions requested
   - Test permission request flow in app
   - Provide justification for each permission in Play Console

4. **Security Testing**
   - No sensitive data in logs
   - API keys properly secured
   - HTTPS enforced for all network calls
   - Certificate pinning (if applicable)
   - No hardcoded secrets in APK

### No Existing Tests to Modify:

Project currently has no automated test suite. All testing will be manual initially.

### Future Testing Recommendations:

1. **Automated E2E Testing**

   - Detox or Maestro for React Native-style E2E tests
   - Playwright with Android emulator
   - Critical user flows automated

2. **Unit Testing**

   - Jest for service layer functions
   - Test workout calculations, analytics logic
   - Test localStorage utilities

3. **Integration Testing**

   - Test Supabase sync functionality
   - Test API integrations (Gemini AI)
   - Test data migration flows

4. **Performance Testing**
   - Lighthouse CI for web performance
   - Android vitals monitoring in Play Console
   - Memory leak detection

## [Implementation Order]

Step-by-step implementation sequence to minimize conflicts and ensure successful integration.

### Phase 1: Environment Setup (1-2 hours)

**Step 1:** Install Capacitor CLI and core dependencies

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

**Step 2:** Initialize Capacitor in project

```bash
npx cap init "Titan 531" "com.titan.workout" --web-dir=dist
```

- Prompts for app name: "Titan 531"
- Prompts for app ID: "com.titan.workout" (or user-preferred reverse domain)
- Specifies web directory: `dist` (Vite's build output)
- Creates `capacitor.config.ts` file

**Step 3:** Add Android platform

```bash
npx cap add android
```

- Downloads Android platform files
- Creates `android/` directory with complete Android Studio project
- Generates AndroidManifest.xml, build.gradle, etc.

**Step 4:** Verify Android directory structure created

```bash
ls -la android/
```

- Should see: app/, gradle/, build.gradle, settings.gradle, etc.

### Phase 2: Tailwind CSS Migration (1-2 hours)

**Step 5:** Install Tailwind CSS build dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
```

**Step 6:** Initialize Tailwind configuration

```bash
npx tailwindcss init -p
```

- Creates `tailwind.config.js`
- Creates `postcss.config.js`

**Step 7:** Configure `tailwind.config.js`

- Copy theme configuration from `index.html` Tailwind CDN script
- Set content paths to scan: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- Add custom colors (primary, secondary, dark, darker, card)
- Add custom fonts (Inter)

**Step 8:** Create `src/index.css` with Tailwind directives

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Copy custom styles from index.html <style> tag */
body {
  font-family: "Inter", sans-serif;
  background-color: #020617;
  color: #e2e8f0;
  overscroll-behavior-y: none;
}

/* Custom scrollbar styles */
/* Safe area padding */
/* etc. */
```

**Step 9:** Remove Tailwind CDN from `index.html`

- Delete: `<script src="https://cdn.tailwindcss.com"></script>`
- Delete: Inline `tailwind.config` script block
- Keep: Google Fonts link
- Keep: Viewport and theme meta tags

**Step 10:** Import CSS in `index.tsx`

```typescript
import "./index.css"; // Add at top of file
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
```

**Step 11:** Remove AI Studio import maps from `index.html`

- Delete: `<script type="importmap">` block
- App already uses npm packages from node_modules, not CDN

**Step 12:** Test Tailwind build

```bash
npm run dev
```

- Verify styles still work
- Check that custom colors apply
- Test theme switching

### Phase 3: Capacitor Configuration (30 minutes)

**Step 13:** Configure `capacitor.config.ts`

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.titan.workout",
  appName: "Titan 531",
  webDir: "dist",
  server: {
    androidScheme: "https",
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

**Step 14:** Add Capacitor scripts to `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "android:dev": "cap run android --livereload --external",
    "android:build": "npm run build && cap sync android && cap open android",
    "android:sync": "cap sync android"
  }
}
```

**Step 15:** Update `vite.config.ts` for Capacitor

```typescript
import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    base: "", // Important for Capacitor
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
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
```

**Step 16:** Update `.gitignore` for Android

```
node_modules/
dist/
.env.local
*.log
.DS_Store

# Android
android/app/build/
android/.gradle/
android/app/release/
android/app/debug/
android/.idea/
android/local.properties
android/.cxx/
*.keystore
*.jks
```

### Phase 4: Platform Detection Utility (15 minutes)

**Step 17:** Create `src/utils/platformDetection.ts`

```typescript
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

**Step 18:** Update service worker registration in `index.html`

- Modify inline script to conditionally register:

```javascript
if ("serviceWorker" in navigator && window.location.protocol !== "capacitor:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
```

**Step 19:** Update `index.tsx` to remove test connection import in production

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Only import test connection in development
if (import.meta.env.DEV) {
  import("./services/database/testConnection");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Phase 5: Asset Preparation (1 hour)

**Step 20:** Create resources directory

```bash
mkdir resources
```

**Step 21:** Create or download app icon (1024x1024 PNG)

- Design icon or use existing logo
- Save as `resources/icon.png`
- Must be square, 1024x1024 pixels
- No transparency recommended for Android

**Step 22:** Create splash screen (2732x2732 PNG)

- Design branded splash screen with app name/logo
- Save as `resources/splash.png`
- Must be square, 2732x2732 pixels
- Safe area in center for content (1200x1200)

**Step 23:** Install Capacitor Assets tool

```bash
npm install -g @capacitor/assets
```

**Step 24:** Generate Android resources

```bash
npx capacitor-assets generate --android
```

- Automatically creates all icon sizes for Android
- Generates splash screen for various densities
- Updates AndroidManifest.xml references

**Step 25:** Install optional Capacitor plugins

```bash
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
```

**Step 26:** Import plugins in `capacitor.config.ts` (if using)

- Already configured in Step 13
- Verify plugin configuration

### Phase 6: Build and Test (1-2 hours)

**Step 27:** Build web assets

```bash
npm run build
```

- Vite builds optimized production bundle to `dist/`
- Verify no build errors
- Check bundle size (should be < 5MB total)

**Step 28:** Sync web assets to Android

```bash
npx cap sync android
```

- Copies `dist/` contents to `android/app/src/main/assets/public/`
- Updates Android project configuration
- Installs Capacitor plugins in Android project

**Step 29:** Open in Android Studio

```bash
npx cap open android
```

- Launches Android Studio with project
- First time: May need to download Android SDK components
- Wait for Gradle sync to complete

**Step 30:** Configure Android Studio (first time only)

- Install Android SDK if prompted
- Accept licenses
- Install build tools (API 34 recommended)
- Configure emulator (if not already done)

**Step 31:** Run on emulator or device

- In Android Studio: Click "Run" (green play button)
- Select target device (emulator or connected physical device)
- Wait for build and installation
- App should launch automatically

**Step 32:** Test all app features (refer to Testing section checklist)

- Go through each feature systematically
- Test offline mode (airplane mode)
- Test data persistence (close and reopen app)
- Verify no crashes or errors

**Step 33:** Debug issues if any

- Use Android Studio Logcat for error messages
- Use Chrome DevTools for web debugging:
  ```
  chrome://inspect/#devices
  ```
- Check Capacitor console logs
- Fix issues and rebuild: `npm run build && npx cap sync`

### Phase 7: Production Build Preparation (2-3 hours)

**Step 34:** Generate Android signing key

```bash
keytool -genkey -v -keystore titan-release-key.keystore -alias titan -keyalg RSA -keysize 2048 -validity 10000
```

- Prompts for password (SAVE THIS PASSWORD)
- Prompts for name, organization, location
- Creates `titan-release-key.keystore` file
- **IMPORTANT:** Store keystore file securely, never commit to git

**Step 35:** Configure signing in `android/app/build.gradle`
Add to android block:

```gradle
signingConfigs {
    release {
        storeFile file('../../titan-release-key.keystore')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'titan'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**Step 36:** Update version in `android/app/build.gradle`

```gradle
android {
    defaultConfig {
        applicationId "com.titan.workout"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1  // Increment for each release
        versionName "1.2.1"  // Matches app version
    }
}
```

**Step 37:** Build release APK

```bash
cd android
./gradlew assembleRelease
```

- Builds signed, optimized APK
- Location: `android/app/build/outputs/apk/release/app-release.apk`
- Check file size (should be < 50MB for optimal Play Store distribution)

**Step 38:** Build Android App Bundle (AAB) - Recommended for Play Store

```bash
cd android
./gradlew bundleRelease
```

- Builds AAB (more efficient than APK for Play Store)
- Location: `android/app/build/outputs/bundle/release/app-release.aab`
- Play Store generates optimized APKs from AAB per device

**Step 39:** Test release build on device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

- Install on physical device
- Test thoroughly (release builds may behave differently)
- Verify code obfuscation doesn't break functionality

**Step 40:** Prepare Play Store assets
Required assets:

- App icon (512x512 PNG) - Already created
- Feature graphic (1024x500 JPG/PNG) - Create in design tool
- Screenshots:
  - Phone: 2-8 screenshots (min 320px on shortest side)
  - 7-inch tablet: 2-8 screenshots (optional)
  - 10-inch tablet: 2-8 screenshots (optional)
- Short description (80 characters max)
- Full description (4000 characters max)
- Privacy policy URL (required)

### Phase 8: Play Store Submission (varies)

**Step 41:** Create Google Play Console account

- Go to https://play.google.com/console
- Pay one-time $25 registration fee
- Complete account setup
- Accept developer agreement

**Step 42:** Create new app in Play Console

- Click "Create app"
- Enter app details:
  - App name: "Titan 531"
  - Default language: English (US)
  - App or game: App
  - Free or paid: Free
- Accept declarations
- Create app

**Step 43:** Complete store listing

- Upload app icon, feature graphic
- Upload screenshots (phone + tablet)
- Write short description (compelling, keyword-rich)
- Write full description (features, benefits, use cases)
- Add privacy policy URL
- Select app category: Health & Fitness
- Provide contact email
- Add optional promo video (YouTube URL)

**Step 44:** Set up content rating

- Complete questionnaire
- Receive content rating (likely PEGI 3, ESRB E)
- Apply rating to app

**Step 45:** Configure app pricing

- Select countries/regions for distribution
- Set pricing (Free for this app)
- Configure in-app purchases if applicable (None currently)

**Step 46:** Create internal test track (optional but recommended)

- Upload AAB to internal testing track
- Add test users by email
- Test app via Play Store before public release
- Review pre-launch report

**Step 47:** Upload production AAB

- Go to Production track
- Create new release
- Upload `app-release.aab`
- Write release notes (what's new)
- Set rollout percentage (start with 20% for caution)

**Step 48:** Complete pre-launch report

- Google automatically tests app on devices
- Review report for crashes or issues
- Fix any critical issues before proceeding

**Step 49:**
