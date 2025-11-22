# Supabase Setup - Complete Guide

## ✅ Phase 1: Foundation Setup - COMPLETE

The following has been completed:

- [x] Supabase dependencies installed
- [x] Environment variables configured (.env.local)
- [x] Supabase client initialized (supabaseClient.ts)
- [x] TypeScript types created (types.ts)
- [x] Database schema created (schema.sql)
- [x] Connection test added

## 🚀 NEXT STEP: Apply Database Schema

**You must complete this step before the app will work with Supabase:**

### Step-by-Step Instructions:

1. **Open Supabase Dashboard**

   - Go to: https://supabase.com/dashboard
   - Select your project: `arwczoyqfcleyiaosrdm`

2. **Navigate to SQL Editor**

   - Click **SQL Editor** in the left sidebar
   - Click **New Query** button

3. **Run the Schema**

   - Open the file: `services/database/schema.sql`
   - Copy ALL contents (entire file)
   - Paste into the SQL Editor
   - Click **RUN** (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Navigate to **Table Editor** in the sidebar
   - Verify these tables exist:
     - ✅ profiles
     - ✅ workout_sessions
     - ✅ nutrition_logs
     - ✅ client_profiles

### What the Schema Creates:

**Tables:**

- `profiles` - User profiles with training data
- `workout_sessions` - All workout history
- `nutrition_logs` - Daily nutrition tracking
- `client_profiles` - Coach mode client data

**Security:**

- Row-level security (RLS) enabled
- Users can only see their own data
- Automatic profile creation on signup

**Performance:**

- Indexes on frequently queried columns
- Automatic timestamp updates
- Optimized for read-heavy operations

## 🧪 Test the Connection

After applying the schema:

```bash
npm run dev
```

Check the browser console for:

```
🔍 Testing Supabase connection...
✅ Supabase client initialized
✅ Database connection successful
ℹ️  No active session (guest mode)
🎉 Connection test complete!
```

## 🔐 Optional: Configure OAuth (Later)

OAuth setup can be done in Phase 2. For now, email/password auth will work.

To add Google/GitHub sign-in later:

1. Go to **Authentication** → **Providers**
2. Enable desired providers
3. Add OAuth credentials
4. Configure redirect URLs

## 📊 Current Architecture

```
┌─────────────────────────────────────┐
│         React App (Client)          │
│  - Guest Mode: localStorage only    │
│  - Auth Mode: Supabase + cache      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│       Supabase Client Library       │
│  - Authentication                   │
│  - Database queries (with RLS)      │
│  - Real-time subscriptions          │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Supabase Backend            │
│  - PostgreSQL database              │
│  - Row-level security               │
│  - Auth management                  │
└─────────────────────────────────────┘
```

## 🎯 What's Next (Phase 2)

After verifying the connection, we'll build:

1. **Auth Context & Hooks**

   - useAuth hook for authentication state
   - Sign up/sign in flows
   - OAuth integration
   - Session management

2. **Guest Mode**

   - Continue using localStorage (no changes to current app)
   - Optional "Sign Up" button in settings
   - Seamless upgrade path

3. **Auth UI Components**
   - Auth modal for sign up/sign in
   - OAuth buttons (Google, GitHub)
   - Error handling
   - Loading states

## 🔒 Security Reminder

**IMPORTANT:** Never commit sensitive keys to git!

- ✅ `VITE_SUPABASE_URL` - Safe to expose (public)
- ✅ `VITE_SUPABASE_ANON_KEY` - Safe to expose (public, RLS protected)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - NEVER expose (admin access)
- ❌ `POSTGRES_PASSWORD` - NEVER expose (database access)

The `.env.local` file is git-ignored, which is correct.

## 📝 Notes

- Guest mode will continue to work exactly as before
- No breaking changes to existing localStorage functionality
- Supabase is additive - it enhances the app with sync capabilities
- Users can choose to use the app with or without an account

## ❓ Troubleshooting

**"Missing Supabase environment variables"**

- Check `.env.local` has correct `VITE_` prefix
- Restart dev server after adding env vars

**"relation does not exist"**

- You haven't run schema.sql yet in Supabase SQL Editor
- Follow the instructions above to apply the schema

**Connection test shows warnings**

- Normal until you run the schema in Supabase
- After schema is applied, warnings should disappear

**TypeScript errors in VS Code**

- Restart TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
- Ensure `vite-env.d.ts` is in project root

---

## Ready to Continue?

Once you've:

1. ✅ Applied the schema in Supabase
2. ✅ Verified connection test passes
3. ✅ Confirmed no errors in console

We can proceed to **Phase 2: Auth System** 🚀
