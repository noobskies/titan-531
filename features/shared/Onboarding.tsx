import React, { useState, useEffect } from "react";
import { UserProfile, LiftType, ProgramType, ThemeColor } from "../../types";
import { Button } from "../../components/Button";
import { PROGRAMS, DEFAULT_TM, THEME_COLORS } from "../../constants";
import {
  Dumbbell,
  Check,
  User,
  Calendar,
  Trophy,
  Palette,
  Cloud,
  ArrowLeft,
} from "lucide-react";
import { calculateInitialTMs } from "../../services/core/workoutLogic";
import { useAuth } from "../../context/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../services/database/supabaseClient";

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [weight, setWeight] = useState<string>("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [themeColor, setThemeColor] = useState<ThemeColor>("blue");
  const [experience, setExperience] = useState<"New" | "Experienced">("New");
  const [program, setProgram] = useState<ProgramType>("Original");
  const [maxes, setMaxes] = useState<Record<LiftType, number>>(DEFAULT_TM);
  const [trainingDays, setTrainingDays] = useState<number[]>([1, 3, 5]);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authView, setAuthView] = useState<"sign_up" | "sign_in">("sign_up");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (unit === "kg") {
      setMaxes({
        [LiftType.Squat]: 100,
        [LiftType.Bench]: 60,
        [LiftType.Deadlift]: 120,
        [LiftType.Overhead]: 40,
      });
    } else {
      setMaxes(DEFAULT_TM);
    }
  }, [unit]);

  const handleMaxChange = (lift: LiftType, val: string) => {
    setMaxes((prev) => ({ ...prev, [lift]: parseInt(val) || 0 }));
  };

  const toggleDay = (dayIdx: number) => {
    if (trainingDays.includes(dayIdx)) {
      setTrainingDays(trainingDays.filter((d) => d !== dayIdx));
    } else {
      setTrainingDays([...trainingDays, dayIdx].sort());
    }
  };

  const finish = () => {
    const tms = calculateInitialTMs(maxes);

    onComplete({
      name,
      gender,
      bodyWeight: parseFloat(weight) || 0,
      unit,
      trainingMaxes: tms,
      oneRepMaxes: maxes,
      selectedProgram: program,
      trainingDays: trainingDays,
      themeColor: themeColor,
      onboardingComplete: true,
    });
  };

  const goToStep5 = () => {
    // Skip Step 5 if already authenticated
    if (isAuthenticated) {
      finish();
      return;
    }

    // Check if user dismissed cloud sync before
    const dismissed = localStorage.getItem("onboarding_cloud_sync_dismissed");
    if (dismissed === "true") {
      finish();
      return;
    }

    // Show Step 5
    setStep(5);
  };

  const handleSkipCloudSync = () => {
    localStorage.setItem("onboarding_cloud_sync_dismissed", "true");
    finish();
  };

  // Listen for successful auth
  useEffect(() => {
    if (step === 5 && isAuthenticated) {
      // User successfully authenticated, complete onboarding
      finish();
    }
  }, [isAuthenticated, step]);

  // Render methods (Step 1-4) remain largely the same visually, but streamlined logic above
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-2">
        <div className="bg-theme w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50 transition-colors duration-300">
          <User size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Profile Setup</h2>
        <p className="text-slate-400">Let's get to know you.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Units
            </label>
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setUnit("lbs")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  unit === "lbs"
                    ? "bg-theme text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                LBS
              </button>
              <button
                onClick={() => setUnit("kg")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  unit === "kg"
                    ? "bg-theme text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                KG
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Body Weight ({unit})
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder={`e.g. ${unit === "lbs" ? "185" : "85"}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
            <Palette size={14} className="mr-2" /> App Theme
          </label>
          <div className="flex justify-between gap-2">
            {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                className={`w-full h-10 rounded-lg border-2 transition-all ${
                  themeColor === color
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent hover:border-slate-600"
                }`}
                style={{ backgroundColor: THEME_COLORS[color].primary }}
              />
            ))}
          </div>
        </div>
      </div>
      <Button
        fullWidth
        size="lg"
        onClick={() => setStep(2)}
        disabled={!name || !weight}
      >
        Next: Strength
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <button
        onClick={() => setStep(1)}
        className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-20"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="text-center">
        <div className="bg-theme w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50 transition-colors duration-300">
          <Dumbbell size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Experience & Strength</h2>
        <p className="text-slate-400 text-sm">
          Enter your estimated 1 Rep Max (1RM).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setExperience("New")}
          className={`p-3 rounded-xl border text-center transition-all ${
            experience === "New"
              ? "bg-theme border-theme text-white"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          <div className="font-bold text-sm">New</div>
          <div className="text-[10px] opacity-80 mt-0.5">Guide me</div>
        </button>
        <button
          onClick={() => setExperience("Experienced")}
          className={`p-3 rounded-xl border text-center transition-all ${
            experience === "Experienced"
              ? "bg-theme border-theme text-white"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          <div className="font-bold text-sm">Pro</div>
          <div className="text-[10px] opacity-80 mt-0.5">I know 5/3/1</div>
        </button>
      </div>
      <div className="space-y-3">
        {Object.values(LiftType).map((lift) => (
          <div
            key={lift}
            className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700"
          >
            <label className="font-medium text-slate-200 text-sm">{lift}</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={maxes[lift]}
                onChange={(e) => handleMaxChange(lift, e.target.value)}
                className="w-24 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-right text-white font-mono focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-bold w-6">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button fullWidth size="lg" onClick={() => setStep(3)}>
        Next: Schedule
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <button
        onClick={() => setStep(2)}
        className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-20"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="text-center">
        <div className="bg-theme w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50 transition-colors duration-300">
          <Calendar size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Weekly Schedule</h2>
        <p className="text-slate-400 text-sm">
          Which days do you plan to train?
        </p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day, idx) => {
          const isSelected = trainingDays.includes(idx);
          return (
            <button
              key={day}
              onClick={() => toggleDay(idx)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all ${
                isSelected
                  ? "bg-theme border-theme text-white shadow-lg"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <span className="text-xs font-bold">{day.charAt(0)}</span>
            </button>
          );
        })}
      </div>
      <div className="text-center text-xs text-slate-500">
        {trainingDays.length} days selected. We'll calculate your workout dates
        automatically.
      </div>
      <Button
        fullWidth
        size="lg"
        onClick={() => setStep(4)}
        disabled={trainingDays.length === 0}
      >
        Next: Choose Program
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      <button
        onClick={() => setStep(3)}
        className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-20"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="text-center">
        <div className="bg-theme w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50 transition-colors duration-300">
          <Trophy size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Select Program</h2>
        <p className="text-slate-400 text-sm">Choose your variation.</p>
      </div>
      <div className="space-y-3">
        {(Object.keys(PROGRAMS) as ProgramType[]).map((key) => (
          <button
            key={key}
            onClick={() => setProgram(key)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              program === key
                ? "bg-theme-soft border-theme ring-1 ring-theme"
                : "bg-slate-800 border-slate-700 hover:border-slate-600"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={`font-bold ${
                  program === key ? "text-theme" : "text-white"
                }`}
              >
                {PROGRAMS[key].name}
              </span>
              {program === key && <Check size={16} className="text-theme" />}
            </div>
            <p className="text-xs text-slate-400 mb-2">
              {PROGRAMS[key].description}
            </p>
            <div className="inline-block bg-slate-900 text-[10px] px-2 py-1 rounded text-slate-500">
              Supp: {PROGRAMS[key].supplemental}
            </div>
          </button>
        ))}
      </div>
      <Button fullWidth size="lg" onClick={goToStep5}>
        Continue
      </Button>
    </div>
  );

  const renderStep5 = () => {
    if (!showAuthForm) {
      // Step 5A: Benefits screen
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setStep(4)}
            className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-20"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center space-y-2">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
              <Cloud size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Cloud Backup</h2>
            <p className="text-slate-400">Sync your workouts across devices</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-700">
            <div className="flex items-center text-slate-300 text-sm">
              <Check size={16} className="mr-2 text-green-500" />
              Access from any device
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Check size={16} className="mr-2 text-green-500" />
              Never lose your progress
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Check size={16} className="mr-2 text-green-500" />
              Coach mode with clients
            </div>
          </div>

          <Button fullWidth size="lg" onClick={() => setShowAuthForm(true)}>
            Enable Cloud Sync
          </Button>

          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onClick={handleSkipCloudSync}
          >
            Maybe Later
          </Button>

          <p className="text-xs text-slate-500 text-center">
            You can enable this later in Settings
          </p>
        </div>
      );
    }

    // Step 5B: Auth form
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <Cloud size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-slate-400 text-sm">
            Sign up or sign in to enable cloud sync
          </p>
        </div>

        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setAuthView("sign_up")}
            className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
              authView === "sign_up"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-500"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthView("sign_in")}
            className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
              authView === "sign_in"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-500"
            }`}
          >
            Sign In
          </button>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={["google"]}
            view={authView}
            showLinks={false}
          />
        </div>

        <button
          onClick={() => setShowAuthForm(false)}
          className="flex items-center justify-center text-sm text-slate-400 hover:text-white transition-colors mx-auto"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Options
        </button>
      </div>
    );
  };

  const theme = THEME_COLORS[themeColor];

  return (
    <div className="min-h-screen bg-darker flex flex-col justify-center p-6 relative overflow-hidden">
      <style>{`:root { --theme-primary: ${theme.primary}; --theme-secondary: ${theme.secondary}; --theme-accent: ${theme.accent}; --theme-soft: ${theme.soft}; } .text-theme { color: var(--theme-primary) !important; } .bg-theme { background-color: var(--theme-primary) !important; } .bg-theme-soft { background-color: var(--theme-soft) !important; } .border-theme { border-color: var(--theme-primary) !important; } .ring-theme { --tw-ring-color: var(--theme-primary) !important; }`}</style>
      <div className="absolute top-0 left-0 w-full h-1 bg-theme transition-colors duration-500"></div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      <div className="mt-8 flex justify-center space-x-2 z-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-theme" : "w-2 bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
