# Supabase Database Setup

## Step 1: Apply Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `schema.sql` into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

The schema will create:

- All necessary tables (profiles, workout_sessions, nutrition_logs, client_profiles)
- Row-level security policies
- Indexes for performance
- Triggers for automatic profile creation and timestamp updates

## Step 2: Verify Tables

After running the schema, verify in the **Table Editor**:

- ✅ profiles
- ✅ workout_sessions
- ✅ nutrition_logs
- ✅ client_profiles

## Step 3: Test Connection

Run the development server and check the browser console:

```bash
npm run dev
```

The app should connect to Supabase successfully.

## Optional: Configure OAuth Providers

To enable Google/GitHub sign-in:

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials:
   - **Google**: Create app in Google Cloud Console
   - **GitHub**: Create OAuth app in GitHub settings
4. Add redirect URLs:
   - Development: `http://localhost:5173`
   - Production: Your Vercel domain

## Security Notes

- ✅ Row-level security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Coaches can only access their own client profiles
- ✅ All policies tested and verified

## Troubleshooting

**"Missing Supabase environment variables"**

- Ensure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**"relation does not exist"**

- Run the schema.sql in Supabase SQL Editor

**Authentication issues**

- Check that auth is enabled in Supabase project
- Verify redirect URLs are configured correctly
