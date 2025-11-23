-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  unit_system TEXT DEFAULT 'imperial', -- 'imperial' or 'metric'
  premium_status BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training Maxes
CREATE TABLE public.training_maxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lift TEXT NOT NULL, -- 'Squat', 'Bench', 'Deadlift', 'Press'
  weight DECIMAL(6,2) NOT NULL,
  unit TEXT DEFAULT 'lbs',
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lift, date)
);

-- Cycles
CREATE TABLE public.cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL, -- 'Original 5/3/1', 'BBB', 'FSL', etc.
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workouts
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.cycles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  main_lift TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  total_volume_lbs DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workout Exercises (details of exercises in a workout)
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL, -- 'main', 'supplemental', 'assistance'
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps INTEGER,
  target_weight DECIMAL(6,2),
  is_amrap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sets
CREATE TABLE public.sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  rpe INTEGER, -- Premium feature: Rate of Perceived Exertion (1-10)
  is_warmup BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Personal Records (auto-generated)
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  lift TEXT, -- For main lifts: 'Squat', 'Bench', etc.
  record_type TEXT NOT NULL, -- '1RM_estimate', '5RM', '10RM', 'max_volume_day'
  value DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  workout_id UUID REFERENCES public.workouts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, exercise_name, record_type, date)
);

-- Settings
CREATE TABLE public.settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bar_weight DECIMAL(5,2) DEFAULT 45,
  available_plates JSONB DEFAULT '[45, 35, 25, 10, 5, 2.5]'::jsonb,
  rounding_increment DECIMAL(4,2) DEFAULT 2.5,
  rest_timer_main INTEGER DEFAULT 300, -- seconds
  rest_timer_supplemental INTEGER DEFAULT 180,
  rest_timer_assistance INTEGER DEFAULT 90,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Body Metrics (Premium feature)
CREATE TABLE public.body_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_maxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Training Maxes
CREATE POLICY "Users can view own training maxes" ON public.training_maxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training maxes" ON public.training_maxes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training maxes" ON public.training_maxes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own training maxes" ON public.training_maxes FOR DELETE USING (auth.uid() = user_id);

-- Cycles
CREATE POLICY "Users can view own cycles" ON public.cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycles" ON public.cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycles" ON public.cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycles" ON public.cycles FOR DELETE USING (auth.uid() = user_id);

-- Workouts
CREATE POLICY "Users can view own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Workout Exercises (access via workout ownership)
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);

-- Sets (access via workout exercise -> workout ownership)
CREATE POLICY "Users can view own sets" ON public.sets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workout_exercises 
    JOIN public.workouts ON workout_exercises.workout_id = workouts.id 
    WHERE workout_exercises.id = sets.workout_exercise_id AND workouts.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own sets" ON public.sets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_exercises 
    JOIN public.workouts ON workout_exercises.workout_id = workouts.id 
    WHERE workout_exercises.id = workout_exercise_id AND workouts.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update own sets" ON public.sets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.workout_exercises 
    JOIN public.workouts ON workout_exercises.workout_id = workouts.id 
    WHERE workout_exercises.id = sets.workout_exercise_id AND workouts.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own sets" ON public.sets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.workout_exercises 
    JOIN public.workouts ON workout_exercises.workout_id = workouts.id 
    WHERE workout_exercises.id = sets.workout_exercise_id AND workouts.user_id = auth.uid()
  )
);

-- Personal Records
CREATE POLICY "Users can view own PRs" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own PRs" ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own PRs" ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own PRs" ON public.personal_records FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users can view own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- Body Metrics
CREATE POLICY "Users can view own body metrics" ON public.body_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body metrics" ON public.body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body metrics" ON public.body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body metrics" ON public.body_metrics FOR DELETE USING (auth.uid() = user_id);

-- Triggers for automatic handle profile creation on signup (Supabase specific)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Create default settings
  INSERT INTO public.settings (user_id) VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_training_maxes_user_lift ON public.training_maxes(user_id, lift);
CREATE INDEX idx_workouts_user_completed ON public.workouts(user_id, completed);
CREATE INDEX idx_workouts_cycle ON public.workouts(cycle_id);
CREATE INDEX idx_workout_exercises_workout ON public.workout_exercises(workout_id);
CREATE INDEX idx_sets_workout_exercise ON public.sets(workout_exercise_id);
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_name);
