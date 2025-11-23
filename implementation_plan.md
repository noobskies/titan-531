# Implementation Plan - Titan 531 (Phase 1: Foundation)

[Overview]
Establish the core foundation for Titan 531, a cross-platform workout app.
This phase includes project scaffolding with Vite/React/TypeScript, Material-UI theme configuration optimized for mobile/gym use, Capacitor integration for Android, and fully functional authentication using Supabase. This sets the stage for feature development in subsequent phases.

[Types]
Define core user and auth types to support the application structure.

- `UserProfile`: Interface defining user data (id, email, display_name, avatar_url, created_at).
- `AuthError`: Interface for standardized error handling from Supabase.
- `ThemeMode`: Enum/Type for 'light' | 'dark' | 'auto'.

[Files]
Create the initial project structure and configuration files.

**New Files:**

- `src/theme.ts`: MUI theme configuration with custom palette, typography, and component overrides for large touch targets.
- `src/supabaseClient.ts`: Supabase client initialization.
- `src/context/AuthContext.tsx`: React Context provider for managing authentication state.
- `src/pages/Login.tsx`: Login screen component.
- `src/pages/Register.tsx`: Registration screen component.
- `src/pages/Home.tsx`: Placeholder home screen/dashboard.
- `src/components/Layout.tsx`: Main app shell (AppBar, Navigation).
- `src/App.tsx`: Main application entry point with routing.

**Modified Files:**

- `package.json`: Add dependencies (MUI, Capacitor, Supabase, React Router).
- `vite.config.ts`: Configuration adjustments if needed.
- `capacitor.config.ts`: Capacitor configuration.

[Functions]
Implement core authentication and UI logic.

**New Functions:**

- `signUp(email, password)`: `src/context/AuthContext.tsx` - Register new user via Supabase.
- `signIn(email, password)`: `src/context/AuthContext.tsx` - Authenticate existing user.
- `signOut()`: `src/context/AuthContext.tsx` - Terminate session.
- `resetPassword(email)`: `src/context/AuthContext.tsx` - Trigger password reset email.
- `RequireAuth`: `src/components/RequireAuth.tsx` - Higher-order component/wrapper for protected routes.

[Classes]
No specific class-based components planned; utilizing functional components and hooks.

[Dependencies]
Install core libraries for the tech stack.

- `@mui/material @emotion/react @emotion/styled`: UI Framework.
- `@mui/icons-material`: Icons.
- `@capacitor/core @capacitor/cli @capacitor/android`: Native runtime.
- `@supabase/supabase-js`: Backend SDK.
- `react-router-dom`: Navigation.
- `react-hook-form`: Form handling (optional but recommended for auth forms).

[Implementation Order]
Execute the setup in a logical sequence to ensure stability.

1.  **Project Scaffolding:** Initialize Vite project and clean up default files.
2.  **Dependency Installation:** Install MUI, Capacitor, Supabase, and Router.
3.  **Capacitor Setup:** Initialize Capacitor and add Android platform.
4.  **Theme Configuration:** Implement the "Gym-Optimized" MUI theme.
5.  **Supabase Client:** Configure the connection to the backend.
6.  **Auth Context:** Build the state management for user sessions.
7.  **Routing & Pages:** Create the basic page structure (Login, Register, Home) and routing.
8.  **Auth Integration:** Connect the pages to the Auth Context functions.
9.  **Testing:** Verify login/register flows and mobile responsiveness.

REFER TO `project_scope.md` for full scope
