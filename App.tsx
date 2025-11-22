
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AppView, UserProfile, LiftType, WorkoutSession, Exercise, SetData } from './types';
import { ActiveWorkout } from './features/ActiveWorkout';
import { Onboarding } from './features/Onboarding';
import { ToolsView } from './features/Tools';
import { SettingsView } from './features/Settings';
import { Dashboard } from './features/Dashboard';
import { HistoryView } from './features/History';
import { ProfileView } from './features/Profile';
import { AICoachView } from './features/AICoach';
import { CoachDashboard } from './features/CoachDashboard';
import { ExerciseManager } from './features/ExerciseManager';
import { Nutrition } from './features/Nutrition';
import { WorkoutStart } from './features/WorkoutStart';
import { generateWorkoutTip } from './services/geminiService';
import { WEEK_MULTIPLIERS, WEEK_REPS, DEFAULT_TM, WARMUP_SETS, PROGRAMS, DEFAULT_ASSISTANCE, ACHIEVEMENTS, DEFAULT_TIMER_SETTINGS, DEFAULT_ASSISTANCE_SETTINGS, THEME_COLORS } from './constants';
import { scheduleWorkoutReminder } from './services/notificationService';
import { Modal } from './components/Modal';
import { Award, Lock, Crown } from 'lucide-react';

// --- Utility Functions ---
const calculateWeight = (tm: number, percent: number, rounding: number = 5) => {
  return Math.round((tm * percent) / rounding) * rounding;
};

const generateWorkout = (profile: UserProfile, lift: LiftType): WorkoutSession => {
  const { trainingMaxes, currentCycle, currentWeek, selectedProgram, rounding } = profile;
  const tm = trainingMaxes[lift];
  
  // Use custom percentages/reps if available (Premium feature)
  const percentages = profile.customPercentages?.[currentWeek] || WEEK_MULTIPLIERS[currentWeek];
  const reps = profile.customReps?.[currentWeek] || WEEK_REPS[currentWeek];

  // 1. Warmup Sets
  const warmupSets: SetData[] = WARMUP_SETS.map(set => ({
    reps: set.reps,
    weight: calculateWeight(tm, set.percent, rounding),
    completed: false,
    isAmrap: false,
    isWarmup: true,
    actualReps: set.reps
  }));

  // 2. Main Lifts (5/3/1)
  const mainSets: SetData[] = percentages.map((pct, idx) => ({
    reps: reps[idx],
    weight: calculateWeight(tm, pct, rounding),
    completed: false,
    isAmrap: currentWeek === 3 && idx === 2, // 5/3/1+ week last set is AMRAP
    isWarmup: false,
    actualReps: reps[idx]
  }));

  const exercises: Exercise[] = [];

  exercises.push({
    id: `main-${Date.now()}`,
    name: lift,
    type: 'Main',
    sets: [...warmupSets, ...mainSets],
    completed: false
  });

  // 3. Supplemental Work
  if (selectedProgram === 'BBB' || selectedProgram === 'Monolith') {
    // 5x10 @ 50%
    const bbbWeight = calculateWeight(tm, 0.5, rounding);
    exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (BBB)`,
        type: 'Supplemental',
        sets: Array(5).fill(null).map(() => ({ reps: 10, weight: bbbWeight, completed: false, isAmrap: false, actualReps: 10 })),
        completed: false
    });
  } else if (selectedProgram === 'Beginner' || selectedProgram === 'FSL') {
     // FSL 5x5 @ First Percentage
     const fslWeight = calculateWeight(tm, percentages[0], rounding);
     exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (FSL)`,
        type: 'Supplemental',
        sets: Array(5).fill(null).map(() => ({ reps: 5, weight: fslWeight, completed: false, isAmrap: false, actualReps: 5 })),
        completed: false
    });
  } else if (selectedProgram === 'BBS') {
     // Boring But Strong: 10 sets of 5 @ FSL
     const fslWeight = calculateWeight(tm, percentages[0], rounding);
     exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (BBS)`,
        type: 'Supplemental',
        sets: Array(10).fill(null).map(() => ({ reps: 5, weight: fslWeight, completed: false, isAmrap: false, actualReps: 5 })),
        completed: false
    });
  }

  // 4. Assistance Work
  const assistanceMap = profile.customAssistance || DEFAULT_ASSISTANCE;
  
  // Determine assistance volume
  let assistanceCount = (selectedProgram === 'Original' || selectedProgram === 'BBS') ? 2 : 1; 
  if (selectedProgram === 'Monolith') assistanceCount = 3; // High volume

  const selectedAssistance = (assistanceMap[lift] || []).slice(0, Math.max(assistanceCount, assistanceMap[lift]?.length || 0));
  
  // Apply user preference for Assistance Volume (sets/reps)
  const asstSets = profile.assistanceSettings?.sets || DEFAULT_ASSISTANCE_SETTINGS.sets;
  const asstReps = profile.assistanceSettings?.reps || DEFAULT_ASSISTANCE_SETTINGS.reps;

  selectedAssistance.forEach((asstName, i) => {
      exercises.push({
        id: `asst-${Date.now()}-${i}`,
        name: asstName,
        type: 'Assistance',
        sets: Array(asstSets).fill(null).map(() => ({ reps: asstReps, weight: 0, completed: false, isAmrap: false, actualReps: asstReps })),
        completed: false
      });
  });

  return {
    id: `wo-${Date.now()}`,
    date: new Date().toLocaleDateString(),
    title: `C${currentCycle} W${currentWeek} - ${lift}`,
    cycle: currentCycle,
    week: currentWeek,
    lift: lift,
    exercises: exercises,
    completed: false,
    durationSeconds: 0,
    programType: selectedProgram,
    profileId: profile.id
  };
};

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Dashboard);
  
  // ROOT profile is the logged-in user (Coach or Athlete)
  const [rootProfile, setRootProfile] = useState<UserProfile>({
    id: 'root',
    name: '',
    gender: 'Male',
    bodyWeight: 0,
    bodyWeightHistory: [],
    measurements: { weight: [], chest: [], waist: [], arms: [], thighs: [] },
    unit: 'lbs',
    rounding: 5, 
    trainingMaxes: DEFAULT_TM,
    oneRepMaxes: DEFAULT_TM,
    currentCycle: 1,
    currentWeek: 1,
    selectedProgram: 'Original',
    progressionScheme: 'Standard',
    theme: 'dark',
    themeColor: 'blue',
    onboardingComplete: false,
    defaultRestTimer: 120,
    timerSettings: DEFAULT_TIMER_SETTINGS,
    assistanceSettings: DEFAULT_ASSISTANCE_SETTINGS,
    customAssistance: DEFAULT_ASSISTANCE,
    achievements: [],
    isPremium: false,
    soundEnabled: true,
    voiceEnabled: false, // Default voice setting
    notificationsEnabled: false,
    language: 'en',
    isCoach: false,
    clients: [],
    customExercises: [],
    trainingDays: [1, 3, 5], // Mon, Wed, Fri default
    plateInventory: undefined,
    nutritionLog: {},
    nutritionTargets: { calories: 2500, protein: 180, carbs: 250, fats: 80 }
  });

  // The profile currently being viewed/managed
  const [viewingProfileId, setViewingProfileId] = useState<string>('root');
  
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [dailyTip, setDailyTip] = useState<string>("Loading tip...");
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<string | null>(null);
  const [showPremiumWall, setShowPremiumWall] = useState(false);

  // Load initial data
  useEffect(() => {
    const storedHistory = localStorage.getItem('titan_history');
    const storedProfile = localStorage.getItem('titan_profile');
    
    if (storedHistory) {
        const h = JSON.parse(storedHistory);
        setHistory(h);
        // Check for workout reminder
        if (h.length > 0) {
            const lastWorkout = new Date(h[h.length - 1].date);
            const diffTime = Math.abs(Date.now() - lastWorkout.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            scheduleWorkoutReminder(diffDays);
        }
    }
    if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        // Migration: ensure settings exist
        if (!parsed.timerSettings) parsed.timerSettings = DEFAULT_TIMER_SETTINGS;
        if (!parsed.assistanceSettings) parsed.assistanceSettings = DEFAULT_ASSISTANCE_SETTINGS;
        if (!parsed.themeColor) parsed.themeColor = 'blue';
        if (!parsed.measurements) parsed.measurements = { weight: parsed.bodyWeightHistory || [], chest: [], waist: [], arms: [], thighs: [] };
        if (!parsed.nutritionLog) parsed.nutritionLog = {};
        if (!parsed.nutritionTargets) parsed.nutritionTargets = { calories: 2500, protein: 180, carbs: 250, fats: 80 };
        
        // Migration for new features
        if (parsed.voiceEnabled === undefined) parsed.voiceEnabled = false;
        
        setRootProfile(parsed);
    }

    // Generate initial tip
    generateWorkoutTip(1, 1, "General").then(setDailyTip);
  }, []);

  // Helper to get the current active profile object (either Root or a Client)
  const activeProfile = viewingProfileId === 'root' 
      ? rootProfile 
      : rootProfile.clients.find(c => c.id === viewingProfileId) || rootProfile;
  
  const theme = THEME_COLORS[activeProfile.themeColor || 'blue'];

  const updateRootProfile = (newProfile: UserProfile) => {
      setRootProfile(newProfile);
      localStorage.setItem('titan_profile', JSON.stringify(newProfile));
  };

  const saveProfile = (updatedActiveProfile: UserProfile) => {
      if (updatedActiveProfile.id === 'root') {
          updateRootProfile(updatedActiveProfile);
      } else {
          // Update specific client in the clients array
          const updatedClients = rootProfile.clients.map(c => c.id === updatedActiveProfile.id ? updatedActiveProfile : c);
          updateRootProfile({ ...rootProfile, clients: updatedClients });
      }
  };

  const handleStartWorkout = (lift: LiftType) => {
    // Premium Check for specific programs
    if (PROGRAMS[activeProfile.selectedProgram].isPremium && !activeProfile.isPremium) {
        setShowPremiumWall(true);
        return;
    }
    
    const session = generateWorkout(activeProfile, lift);
    setActiveSession(session);
    setView(AppView.Workout);
  };

  const checkAchievements = (currProfile: UserProfile, currHistory: WorkoutSession[]) => {
      // Filter history for this specific profile
      const relevantHistory = currHistory.filter(h => h.profileId === currProfile.id || (!h.profileId && currProfile.id === 'root'));
      
      const unlocked = new Set(currProfile.achievements || []);
      let newUnlockId: string | null = null;

      // 1. First Blood
      if (!unlocked.has('first_blood') && relevantHistory.length > 0) {
          unlocked.add('first_blood');
          newUnlockId = 'first_blood';
      }

      // 2. Consistency (10 workouts)
      if (!unlocked.has('consistency') && relevantHistory.length >= 10) {
          unlocked.add('consistency');
          newUnlockId = 'consistency';
      }

      // 3. Committed (50 workouts)
      if (!unlocked.has('committed') && relevantHistory.length >= 50) {
          unlocked.add('committed');
          newUnlockId = 'committed';
      }

      // 4. Cycle Master
      if (!unlocked.has('cycle_complete') && currProfile.currentCycle > 1) {
          unlocked.add('cycle_complete');
          newUnlockId = 'cycle_complete';
      }

      // 5. Strength Thresholds
      const isMetric = currProfile.unit === 'kg';
      const squatThresh = isMetric ? 100 : 225;
      const benchThresh = isMetric ? 60 : 135;
      const deadThresh = isMetric ? 140 : 315;
      const totalThresh = isMetric ? 450 : 1000;

      if (!unlocked.has('squat_225') && currProfile.oneRepMaxes[LiftType.Squat] >= squatThresh) {
          unlocked.add('squat_225');
          newUnlockId = 'squat_225';
      }
       if (!unlocked.has('bench_135') && currProfile.oneRepMaxes[LiftType.Bench] >= benchThresh) {
          unlocked.add('bench_135');
          newUnlockId = 'bench_135';
      }
       if (!unlocked.has('deadlift_315') && currProfile.oneRepMaxes[LiftType.Deadlift] >= deadThresh) {
          unlocked.add('deadlift_315');
          newUnlockId = 'deadlift_315';
      }
      const total = Object.values(currProfile.oneRepMaxes).reduce((a,b) => a+b, 0);
      if (!unlocked.has('heavy_hitter') && total >= totalThresh) {
          unlocked.add('heavy_hitter');
          newUnlockId = 'heavy_hitter';
      }

      if (newUnlockId) {
          saveProfile({ ...currProfile, achievements: Array.from(unlocked) });
          setNewUnlockedAchievement(newUnlockId);
      }
  };

  const handleCompleteWorkout = (completedSession: WorkoutSession) => {
    // Ensure profileID is set
    completedSession.profileId = activeProfile.id;
    
    const updatedHistory = [...history, completedSession];
    setHistory(updatedHistory);
    localStorage.setItem('titan_history', JSON.stringify(updatedHistory));
    setActiveSession(null);
    
    // Update 1RMs
    let updatedMaxes = { ...activeProfile.oneRepMaxes };
    let maxesChanged = false;

    completedSession.exercises.forEach(ex => {
        if (ex.type === 'Main') {
            ex.sets.forEach(set => {
                if (set.completed) {
                    const est = Math.round(set.weight * (1 + (set.actualReps || set.reps) / 30));
                    if (est > updatedMaxes[completedSession.lift]) {
                        updatedMaxes[completedSession.lift] = est;
                        maxesChanged = true;
                    }
                }
            });
        }
    });

    let updatedProfile = activeProfile;
    if (maxesChanged) {
        updatedProfile = { ...activeProfile, oneRepMaxes: updatedMaxes };
        saveProfile(updatedProfile);
    }

    checkAchievements(updatedProfile, updatedHistory);
    setView(AppView.Dashboard);
  };

  const handleDeleteWorkout = (sessionId: string) => {
      const updated = history.filter(s => s.id !== sessionId);
      setHistory(updated);
      localStorage.setItem('titan_history', JSON.stringify(updated));
  };

  const handleUpdateHistorySession = (updatedSession: WorkoutSession) => {
      const updated = history.map(s => s.id === updatedSession.id ? updatedSession : s);
      setHistory(updated);
      localStorage.setItem('titan_history', JSON.stringify(updated));
  };

  const handleOnboardingComplete = (newProfileData: Partial<UserProfile>) => {
    const updatedProfile = { ...rootProfile, ...newProfileData, onboardingComplete: true };
    updateRootProfile(updatedProfile);
  };
  
  // --- Data Management ---
  const handleExportData = () => {
      const data = { profile: rootProfile, history, exportDate: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `titan-531-backup.json`;
      a.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              if (data.profile && data.history) {
                  setRootProfile(data.profile);
                  setHistory(data.history);
                  localStorage.setItem('titan_profile', JSON.stringify(data.profile));
                  localStorage.setItem('titan_history', JSON.stringify(data.history));
                  alert("Data imported!");
                  window.location.reload();
              }
          } catch (err) { alert("Error parsing file."); }
      };
      reader.readAsText(file);
  };

  const handleResetApp = () => {
      localStorage.clear();
      window.location.reload();
  };

  // --- Cycle Logic ---
  
  const getCompletedLiftsForWeek = (): LiftType[] => {
      return history
        .filter(s => (s.profileId === activeProfile.id) && s.cycle === activeProfile.currentCycle && s.week === activeProfile.currentWeek)
        .map(s => s.lift);
  };

  const handleFinishWeek = () => {
      if (activeProfile.currentWeek >= 4) return;
      saveProfile({ ...activeProfile, currentWeek: (activeProfile.currentWeek + 1) as 1|2|3|4 });
  };

  const handleFinishCycle = () => {
      const isLbs = activeProfile.unit === 'lbs';
      const upperInc = isLbs ? 5 : 2.5;
      const lowerInc = isLbs ? 10 : 5;

      const newTMs = { ...activeProfile.trainingMaxes };
      
      // Apply progression logic based on scheme
      if (activeProfile.progressionScheme === 'Performance') {
          // Check performance in 1+ week (Week 3) for each lift
          Object.values(LiftType).forEach(lift => {
              const week3Session = history.find(s => 
                  s.profileId === activeProfile.id &&
                  s.cycle === activeProfile.currentCycle && 
                  s.week === 3 && 
                  s.lift === lift
              );

              let increase = false;
              if (week3Session) {
                  const mainEx = week3Session.exercises.find(e => e.type === 'Main');
                  const amrapSet = mainEx?.sets.find(s => s.isAmrap || (s.completed && s.weight > activeProfile.trainingMaxes[lift] * 0.9));
                  
                  if (amrapSet && (amrapSet.actualReps || amrapSet.reps) >= 5) {
                      increase = true;
                  }
              } else {
                  increase = true;
              }

              if (increase) {
                  const inc = (lift === LiftType.Squat || lift === LiftType.Deadlift) ? lowerInc : upperInc;
                  newTMs[lift] += inc;
              }
          });
      } else {
          newTMs[LiftType.Squat] += lowerInc;
          newTMs[LiftType.Deadlift] += lowerInc;
          newTMs[LiftType.Bench] += upperInc;
          newTMs[LiftType.Overhead] += upperInc;
      }
      
      checkAchievements({...activeProfile, currentCycle: activeProfile.currentCycle + 1}, history);

      saveProfile({
          ...activeProfile,
          currentCycle: activeProfile.currentCycle + 1,
          currentWeek: 1,
          trainingMaxes: newTMs
      });
  };

  const getCurrentPR = (lift: LiftType): number => {
      let max = activeProfile.oneRepMaxes[lift];
      return Math.round(max);
  };

  // --- Coach Logic ---
  const handleAddClient = (newClient: UserProfile) => {
      const updatedClients = [...(rootProfile.clients || []), newClient];
      updateRootProfile({ ...rootProfile, clients: updatedClients });
  };

  const handleSelectClient = (clientId: string) => {
      setViewingProfileId(clientId);
      setView(AppView.Dashboard); // Go to dashboard of that client
  };

  const exitClientView = () => {
      setViewingProfileId('root');
      setView(AppView.CoachDashboard);
  };

  if (!rootProfile.onboardingComplete) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Filter history for the current active view
  const activeHistory = history.filter(h => h.profileId === activeProfile.id || (!h.profileId && activeProfile.id === 'root'));

  const renderContent = () => {
    if (view === AppView.Workout && activeSession) {
      return (
        <ActiveWorkout 
          session={activeSession} 
          personalRecord={getCurrentPR(activeSession.lift)}
          defaultRestTime={activeProfile.defaultRestTimer || 120}
          timerSettings={activeProfile.timerSettings}
          unit={activeProfile.unit}
          soundEnabled={activeProfile.soundEnabled}
          voiceEnabled={activeProfile.voiceEnabled}
          plateInventory={activeProfile.plateInventory}
          customExercises={activeProfile.customExercises}
          onUpdateSession={setActiveSession}
          onComplete={handleCompleteWorkout}
          language={activeProfile.language}
        />
      );
    }

    switch (view) {
      case AppView.Dashboard:
        return (
            <Dashboard 
                profile={activeProfile} 
                onStartWorkout={handleStartWorkout} 
                tip={dailyTip}
                completedLiftsThisWeek={getCompletedLiftsForWeek()}
                onFinishWeek={handleFinishWeek}
                onFinishCycle={handleFinishCycle}
                onOpenSettings={() => setView(AppView.Settings)}
            />
        );
      case AppView.Workout:
          // Dedicated workout start screen when no session active
          return (
              <WorkoutStart 
                  profile={activeProfile}
                  onStartWorkout={handleStartWorkout}
                  completedLifts={getCompletedLiftsForWeek()}
              />
          );
      case AppView.History:
        return (
            <HistoryView 
                history={activeHistory} 
                onDeleteSession={handleDeleteWorkout} 
                onUpdateSession={handleUpdateHistorySession}
            />
        );
      case AppView.Nutrition:
          return (
              <Nutrition 
                  profile={activeProfile} 
                  onUpdateProfile={saveProfile} 
              />
          );
      case AppView.AICoach:
        return <AICoachView profile={activeProfile} history={activeHistory} />;
      case AppView.Profile:
        return (
            <ProfileView 
                profile={activeProfile} 
                history={activeHistory} 
                onUpdateProfile={saveProfile} 
                onOpenSettings={() => setView(AppView.Settings)}
            />
        );
      case AppView.Tools:
        return (
          <ToolsView 
            profile={activeProfile} 
            onUpdateProfile={saveProfile} 
            language={activeProfile.language} 
          /> 
        );
      case AppView.Settings:
        return (
            <SettingsView
                profile={activeProfile}
                onUpdateProfile={saveProfile}
                onExport={handleExportData}
                onImport={handleImportData}
                onReset={handleResetApp}
                onBack={() => setView(AppView.Profile)}
                onChangeView={setView}
            />
        );
      case AppView.CoachDashboard:
          if (!rootProfile.isCoach) return <Dashboard profile={activeProfile} onStartWorkout={handleStartWorkout} tip={dailyTip} completedLiftsThisWeek={getCompletedLiftsForWeek()} onFinishWeek={handleFinishWeek} onFinishCycle={handleFinishCycle} onOpenSettings={() => setView(AppView.Settings)} />;
          return (
              <CoachDashboard 
                clients={rootProfile.clients || []}
                onAddClient={handleAddClient}
                onSelectClient={handleSelectClient}
                language={rootProfile.language || 'en'}
              />
          );
      case AppView.ExerciseManager:
          return (
              <ExerciseManager
                  profile={activeProfile}
                  onUpdateProfile={saveProfile}
                  onBack={() => setView(AppView.Settings)}
              />
          );
      default:
        return <Dashboard profile={activeProfile} onStartWorkout={handleStartWorkout} tip={dailyTip} completedLiftsThisWeek={getCompletedLiftsForWeek()} onFinishWeek={handleFinishWeek} onFinishCycle={handleFinishCycle} onOpenSettings={() => setView(AppView.Settings)} />;
    }
  };

  const unlockedAchObj = ACHIEVEMENTS.find(a => a.id === newUnlockedAchievement);

  return (
    <Layout 
        currentView={view} 
        onChangeView={setView} 
        isCoach={rootProfile.isCoach}
        isClientView={viewingProfileId !== 'root'}
        onExitClientView={exitClientView}
        language={activeProfile.language || 'en'}
    >
      {/* Dynamic Theme Injection */}
      <style>{`
        :root {
          --theme-primary: ${theme.primary};
          --theme-secondary: ${theme.secondary};
          --theme-accent: ${theme.accent};
          --theme-soft: ${theme.soft};
        }
        /* Theme Utility Classes */
        .text-theme { color: var(--theme-primary) !important; }
        .bg-theme { background-color: var(--theme-primary) !important; }
        .bg-theme-soft { background-color: var(--theme-soft) !important; }
        .border-theme { border-color: var(--theme-primary) !important; }
        .hover\:bg-theme:hover { background-color: var(--theme-primary) !important; }
        .hover\:text-theme:hover { color: var(--theme-primary) !important; }
        
        /* Custom Scrollbar overrides to match theme */
        ::-webkit-scrollbar-thumb:hover { background: var(--theme-secondary); }
      `}</style>

      {renderContent()}
      
      {/* Achievement Modal */}
      <Modal isOpen={!!newUnlockedAchievement} onClose={() => setNewUnlockedAchievement(null)} title="">
          <div className="text-center p-6 space-y-4">
              <div className="text-6xl animate-bounce">{unlockedAchObj?.icon || '🎉'}</div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wide bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Achievement Unlocked!</h3>
              <div>
                  <h4 className="text-xl font-bold text-white">{unlockedAchObj?.name}</h4>
                  <p className="text-slate-400">{unlockedAchObj?.description}</p>
              </div>
              <button onClick={() => setNewUnlockedAchievement(null)} className="bg-slate-800 px-6 py-2 rounded-full text-white font-bold hover:bg-slate-700 transition-colors">
                  Awesome!
              </button>
          </div>
      </Modal>

      {/* Premium Wall Modal */}
      <Modal isOpen={showPremiumWall} onClose={() => setShowPremiumWall(false)} title="Premium Feature">
          <div className="text-center p-4 space-y-4">
              <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Crown size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Unlock {PROGRAMS[activeProfile.selectedProgram]?.name}</h3>
              <p className="text-slate-400 text-sm">
                  This advanced program is available for Premium users. 
                  Upgrade to access FSL, Monolith, Advanced Analytics, RPE tracking, and more.
              </p>
              <button 
                onClick={() => {
                    saveProfile({ ...activeProfile, isPremium: true });
                    setShowPremiumWall(false);
                    alert("Upgrade Successful! (Demo)");
                }} 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 py-3 rounded-xl text-black font-bold"
              >
                  Unlock Premium (Free Demo)
              </button>
              <button onClick={() => setShowPremiumWall(false)} className="text-slate-500 text-sm hover:text-white">
                  Maybe Later
              </button>
          </div>
      </Modal>
    </Layout>
  );
};

export default App;
