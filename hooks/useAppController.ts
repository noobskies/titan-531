
import { useState, useEffect, useRef } from 'react';
import { AppView, UserProfile, LiftType, WorkoutSession, ConditioningData } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateWorkoutTip } from '../services/api/geminiService';
import { scheduleWorkoutReminder } from '../services/platform/notificationService';
import { generateWorkout } from '../services/core/workoutLogic';
import { processFinishedSession } from '../services/core/profileLogic';
import { checkAchievements } from '../services/analytics/achievementLogic';
import { DEFAULT_TM, DEFAULT_TIMER_SETTINGS, DEFAULT_ASSISTANCE_SETTINGS, DEFAULT_ASSISTANCE } from '../constants';
import { PROGRAMS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/api/supabase';
import { useUI } from '../context/UIContext';

const DEFAULT_PROFILE: UserProfile = {
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
  voiceEnabled: false,
  notificationsEnabled: false,
  language: 'en',
  isCoach: false,
  clients: [],
  customExercises: [],
  trainingDays: [1, 3, 5],
  nutritionLog: {},
  nutritionTargets: { calories: 2500, protein: 180, carbs: 250, fats: 80 },
  liftOrder: [LiftType.Squat, LiftType.Bench, LiftType.Deadlift, LiftType.Overhead]
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const useAppController = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [view, setView] = useState<AppView>(AppView.Dashboard);
  
  const [rootProfile, setRootProfile] = useLocalStorage<UserProfile>('titan_profile', DEFAULT_PROFILE);
  const [history, setHistory] = useLocalStorage<WorkoutSession[]>('titan_history', []);
  
  const [viewingProfileId, setViewingProfileId] = useState<string>('root');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [dailyTip, setDailyTip] = useState<string>("Loading tip...");
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<string | null>(null);
  const [showPremiumWall, setShowPremiumWall] = useState(false);
  const [showCycleTransition, setShowCycleTransition] = useState(false);

  // Sync State
  const isSyncing = useRef(false);
  const pendingSync = useRef<NodeJS.Timeout | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Cloud Sync Effect
  useEffect(() => {
    if (!user) return;

    // 1. On Mount/Login: Fetch Remote
    const fetchRemote = async () => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        setSyncStatus('syncing');
        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('profile, history')
                .eq('id', user.id)
                .single();

            if (data) {
                // Conflict resolution: remote wins on initial load
                if (data.profile) setRootProfile(data.profile);
                if (data.history) setHistory(data.history);
                setSyncStatus('synced');
            } else if (error && error.code !== 'PGRST116') {
                console.error("Sync fetch error:", error);
                setSyncStatus('error');
            } else {
                // No remote data, this is a first sync push
                saveToCloud(rootProfile, history);
            }
        } catch (e) {
            setSyncStatus('error');
        } finally {
            isSyncing.current = false;
        }
    };
    fetchRemote();
  }, [user]); 

  // 2. On Local Change: Push Remote (Debounced)
  useEffect(() => {
      if (!user || isSyncing.current) return;

      if (pendingSync.current) clearTimeout(pendingSync.current);
      
      setSyncStatus('syncing'); // Show optimistic syncing state
      pendingSync.current = setTimeout(() => {
          saveToCloud(rootProfile, history);
      }, 3000); // Debounce 3s

      return () => { if (pendingSync.current) clearTimeout(pendingSync.current); }
  }, [rootProfile, history, user]);

  // 3. Online Recovery
  useEffect(() => {
      const handleOnline = () => {
          if (user) {
              console.log("Back online, syncing...");
              saveToCloud(rootProfile, history);
          }
      };
      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
  }, [user, rootProfile, history]);

  const saveToCloud = async (p: UserProfile, h: WorkoutSession[]) => {
      if (!user) return;
      setSyncStatus('syncing');
      try {
          const { error } = await supabase
            .from('user_data')
            .upsert({ 
                id: user.id,
                profile: p,
                history: h,
                updated_at: new Date().toISOString()
            });
          
          if (error) {
              console.error("Cloud save failed:", error);
              setSyncStatus('error');
          } else {
              setSyncStatus('synced');
          }
      } catch (err) {
          console.error("Cloud save exception:", err);
          setSyncStatus('error');
      }
  };

  const activeProfile = viewingProfileId === 'root' 
      ? rootProfile 
      : rootProfile.clients.find(c => c.id === viewingProfileId) || rootProfile;
  
  const activeHistory = history.filter(h => h.profileId === activeProfile.id || (!h.profileId && activeProfile.id === 'root'));

  useEffect(() => {
    generateWorkoutTip(activeProfile.currentCycle, activeProfile.currentWeek, "General").then(setDailyTip);
    if (history.length > 0) {
        const lastWorkout = new Date(history[history.length - 1].date);
        const diffTime = Math.abs(Date.now() - lastWorkout.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        scheduleWorkoutReminder(diffDays);
    }
  }, []);

  const updateRootProfile = (newProfile: UserProfile) => setRootProfile(newProfile);

  const saveProfile = (updatedActiveProfile: UserProfile) => {
      if (updatedActiveProfile.id === 'root') {
          updateRootProfile(updatedActiveProfile);
      } else {
          const updatedClients = rootProfile.clients.map(c => c.id === updatedActiveProfile.id ? updatedActiveProfile : c);
          updateRootProfile({ ...rootProfile, clients: updatedClients });
      }
  };

  const replaceAllData = (newProfile: UserProfile, newHistory: WorkoutSession[]) => {
      setRootProfile(newProfile);
      setHistory(newHistory);
      if (user) {
          saveToCloud(newProfile, newHistory).then(() => showToast("Synced imported data to cloud", "success"));
      }
  };

  const startWorkout = (lift: LiftType) => {
    if (PROGRAMS[activeProfile.selectedProgram].isPremium && !activeProfile.isPremium) {
        setShowPremiumWall(true);
        return;
    }
    const session = generateWorkout(activeProfile, lift, activeHistory);
    setActiveSession(session);
    setView(AppView.Workout);
  };

  const completeWorkout = (completedSession: WorkoutSession) => {
    const { updatedProfile, updatedHistory, newUnlockId } = processFinishedSession(activeProfile, history, completedSession);
    setHistory(updatedHistory);
    setActiveSession(null);
    saveProfile(updatedProfile);
    if (newUnlockId) setNewUnlockedAchievement(newUnlockId);
    setView(AppView.Dashboard);
  };

  const saveConditioning = (data: ConditioningData) => {
      const session: WorkoutSession = {
          id: `cardio-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          title: data.activity,
          cycle: activeProfile.currentCycle,
          week: activeProfile.currentWeek,
          lift: 'Conditioning' as any,
          type: 'Conditioning',
          exercises: [],
          conditioningData: data,
          completed: true,
          durationSeconds: data.durationSeconds,
          notes: data.notes,
          programType: activeProfile.selectedProgram,
          profileId: activeProfile.id
      };
      setHistory([...history, session]);
      setView(AppView.History);
  };

  const deleteWorkout = (sessionId: string) => setHistory(history.filter(s => s.id !== sessionId));
  const updateHistorySession = (updatedSession: WorkoutSession) => setHistory(history.map(s => s.id === updatedSession.id ? updatedSession : s));

  const confirmCycleTransition = (newTMs: Record<LiftType, number>, nextCycle: number) => {
      const tempProfile = { ...activeProfile, currentCycle: nextCycle };
      const { updatedAchievements, newUnlockId } = checkAchievements(tempProfile, history);
      if (newUnlockId) setNewUnlockedAchievement(newUnlockId);
      
      saveProfile({
          ...activeProfile,
          achievements: updatedAchievements,
          currentCycle: nextCycle,
          currentWeek: 1,
          trainingMaxes: newTMs
      });
      setShowCycleTransition(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    view, setView,
    rootProfile, updateRootProfile,
    activeProfile, saveProfile, replaceAllData,
    activeHistory, history,
    activeSession, setActiveSession,
    dailyTip,
    newUnlockedAchievement, setNewUnlockedAchievement,
    showPremiumWall, setShowPremiumWall,
    showCycleTransition, setShowCycleTransition,
    viewingProfileId, setViewingProfileId,
    startWorkout, completeWorkout, saveConditioning,
    deleteWorkout, updateHistorySession, confirmCycleTransition,
    syncStatus
  };
};
