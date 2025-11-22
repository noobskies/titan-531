
import React, { Suspense, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AppView, LiftType } from './types';
import { Onboarding } from './features/shared/Onboarding';
import { WorkoutStart } from './features/workout/WorkoutStart';
import { CycleTransition } from './features/workout/CycleTransition';
import { Modal } from './components/Modal';
import { Crown, Loader } from 'lucide-react';
import { ACHIEVEMENTS, PROGRAMS, THEME_COLORS } from './constants';
import { useAppController } from './hooks/useAppController';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UIProvider, useUI } from './context/UIContext';
import { useLocalStorage } from './hooks/useLocalStorage';

// Lazy Load Major Views
const ActiveWorkout = React.lazy(() => import('./features/workout/ActiveWorkout').then(m => ({ default: m.ActiveWorkout })));
const ToolsView = React.lazy(() => import('./features/tools/Tools').then(m => ({ default: m.ToolsView })));
const SettingsView = React.lazy(() => import('./features/settings/Settings').then(m => ({ default: m.SettingsView })));
const Dashboard = React.lazy(() => import('./features/shared/Dashboard').then(m => ({ default: m.Dashboard })));
const HistoryView = React.lazy(() => import('./features/history/History').then(m => ({ default: m.HistoryView })));
const ProfileView = React.lazy(() => import('./features/settings/Profile').then(m => ({ default: m.ProfileView })));
const AICoachView = React.lazy(() => import('./features/coaching/AICoach').then(m => ({ default: m.AICoachView })));
const CoachDashboard = React.lazy(() => import('./features/coaching/CoachDashboard').then(m => ({ default: m.CoachDashboard })));
const ExerciseManager = React.lazy(() => import('./features/shared/ExerciseManager').then(m => ({ default: m.ExerciseManager })));
const Nutrition = React.lazy(() => import('./features/shared/Nutrition').then(m => ({ default: m.Nutrition })));
const Conditioning = React.lazy(() => import('./features/shared/Conditioning').then(m => ({ default: m.Conditioning })));

const APP_VERSION = '1.2.1';

const AppContent: React.FC = () => {
  const ctrl = useAppController();
  const theme = THEME_COLORS[ctrl.activeProfile.themeColor || 'blue'];
  const { showToast, setInstallPrompt } = useUI();
  const [lastVersion, setLastVersion] = useLocalStorage('titan_version', '');

  // Check for updates
  useEffect(() => {
      if (lastVersion !== APP_VERSION) {
          if (lastVersion) {
            showToast(`Titan updated to v${APP_VERSION}`, 'info');
          }
          setLastVersion(APP_VERSION);
      }
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [setInstallPrompt]);

  // Export/Import Handlers (View specific)
  const handleExportData = () => {
      const data = { profile: ctrl.rootProfile, history: ctrl.history, exportDate: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `titan-531-backup.json`;
      a.click();
      showToast("Data exported successfully", "success");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              // Validate basic structure
              if (data.profile && Array.isArray(data.history)) {
                  ctrl.replaceAllData(data.profile, data.history);
                  showToast("Data imported! Reloading...", "success");
                  // Small delay to allow state save before reload
                  setTimeout(() => window.location.reload(), 1500);
              } else {
                 throw new Error("Invalid file format");
              }
          } catch (err) { 
            console.error(err);
            showToast("Error parsing backup file", "error"); 
          }
      };
      reader.readAsText(file);
  };

  const getCompletedLiftsForWeek = (): LiftType[] => {
      return ctrl.activeHistory
        .filter(s => s.cycle === ctrl.activeProfile.currentCycle && s.week === ctrl.activeProfile.currentWeek && s.type !== 'Conditioning')
        .map(s => s.lift as LiftType);
  };

  if (!ctrl.rootProfile.onboardingComplete) {
      return <Onboarding onComplete={(data) => ctrl.updateRootProfile({ ...ctrl.rootProfile, ...data, onboardingComplete: true })} />;
  }

  const unlockedAchObj = ACHIEVEMENTS.find(a => a.id === ctrl.newUnlockedAchievement);

  return (
    <Layout 
        currentView={ctrl.view} 
        onChangeView={ctrl.setView} 
        isCoach={ctrl.rootProfile.isCoach}
        isClientView={ctrl.viewingProfileId !== 'root'}
        onExitClientView={() => { ctrl.setViewingProfileId('root'); ctrl.setView(AppView.CoachDashboard); }}
        language={ctrl.activeProfile.language || 'en'}
    >
      <style>{`
        :root {
          --theme-primary: ${theme.primary};
          --theme-secondary: ${theme.secondary};
          --theme-accent: ${theme.accent};
          --theme-soft: ${theme.soft};
        }
        .text-theme { color: var(--theme-primary) !important; }
        .bg-theme { background-color: var(--theme-primary) !important; }
        .bg-theme-soft { background-color: var(--theme-soft) !important; }
        .border-theme { border-color: var(--theme-primary) !important; }
        .hover\:bg-theme:hover { background-color: var(--theme-primary) !important; }
        .hover\:text-theme:hover { color: var(--theme-primary) !important; }
        ::-webkit-scrollbar-thumb:hover { background: var(--theme-secondary); }
      `}</style>

      <Suspense fallback={
        <div className="flex h-full items-center justify-center text-slate-500">
           <Loader className="animate-spin mr-2" /> Loading...
        </div>
      }>
        {ctrl.view === AppView.Workout && ctrl.activeSession && (
          <ActiveWorkout 
            session={ctrl.activeSession} 
            personalRecord={ctrl.activeProfile.oneRepMaxes[ctrl.activeSession.lift as LiftType] || 0}
            defaultRestTime={ctrl.activeProfile.defaultRestTimer || 120}
            timerSettings={ctrl.activeProfile.timerSettings}
            unit={ctrl.activeProfile.unit}
            soundEnabled={ctrl.activeProfile.soundEnabled}
            voiceEnabled={ctrl.activeProfile.voiceEnabled}
            plateInventory={ctrl.activeProfile.plateInventory}
            customExercises={ctrl.activeProfile.customExercises}
            onUpdateSession={ctrl.setActiveSession}
            onComplete={ctrl.completeWorkout}
            language={ctrl.activeProfile.language}
          />
        )}

        {ctrl.view === AppView.Conditioning && (
            <Conditioning onSave={ctrl.saveConditioning} onCancel={() => ctrl.setView(AppView.Dashboard)} unit={ctrl.activeProfile.unit} />
        )}

        {ctrl.view === AppView.Dashboard && (
            <Dashboard 
                profile={ctrl.activeProfile} 
                onStartWorkout={ctrl.startWorkout} 
                onStartConditioning={() => ctrl.setView(AppView.Conditioning)}
                tip={ctrl.dailyTip}
                completedLiftsThisWeek={getCompletedLiftsForWeek()}
                onFinishWeek={() => ctrl.activeProfile.currentWeek < 4 && ctrl.saveProfile({ ...ctrl.activeProfile, currentWeek: (ctrl.activeProfile.currentWeek + 1) as 1|2|3|4 })}
                onFinishCycle={() => ctrl.setShowCycleTransition(true)}
                onOpenSettings={() => ctrl.setView(AppView.Settings)}
            />
        )}

        {ctrl.view === AppView.Workout && !ctrl.activeSession && (
            <WorkoutStart profile={ctrl.activeProfile} onStartWorkout={ctrl.startWorkout} completedLifts={getCompletedLiftsForWeek()} />
        )}

        {ctrl.view === AppView.History && (
            <HistoryView history={ctrl.activeHistory} onDeleteSession={ctrl.deleteWorkout} onUpdateSession={ctrl.updateHistorySession} />
        )}

        {ctrl.view === AppView.Nutrition && <Nutrition profile={ctrl.activeProfile} onUpdateProfile={ctrl.saveProfile} />}
        {ctrl.view === AppView.AICoach && <AICoachView profile={ctrl.activeProfile} history={ctrl.activeHistory} />}
        {ctrl.view === AppView.Profile && <ProfileView profile={ctrl.activeProfile} history={ctrl.activeHistory} onUpdateProfile={ctrl.saveProfile} onOpenSettings={() => ctrl.setView(AppView.Settings)} />}
        {ctrl.view === AppView.Tools && <ToolsView profile={ctrl.activeProfile} onUpdateProfile={ctrl.saveProfile} language={ctrl.activeProfile.language} />}
        
        {ctrl.view === AppView.Settings && (
            <SettingsView
                profile={ctrl.activeProfile}
                onUpdateProfile={ctrl.saveProfile}
                onExport={handleExportData}
                onImport={handleImportData}
                onReset={() => { localStorage.clear(); window.location.reload(); }}
                onBack={() => ctrl.setView(AppView.Profile)}
                onChangeView={ctrl.setView}
            />
        )}
        
        {ctrl.view === AppView.CoachDashboard && (
            <CoachDashboard 
              clients={ctrl.rootProfile.clients || []}
              onAddClient={(c) => ctrl.updateRootProfile({ ...ctrl.rootProfile, clients: [...(ctrl.rootProfile.clients||[]), c] })}
              onSelectClient={(id) => { ctrl.setViewingProfileId(id); ctrl.setView(AppView.Dashboard); }}
              language={ctrl.rootProfile.language || 'en'}
            />
        )}

        {ctrl.view === AppView.ExerciseManager && (
            <ExerciseManager profile={ctrl.activeProfile} onUpdateProfile={ctrl.saveProfile} onBack={() => ctrl.setView(AppView.Settings)} />
        )}
      </Suspense>

      <CycleTransition isOpen={ctrl.showCycleTransition} profile={ctrl.activeProfile} history={ctrl.activeHistory} onConfirm={ctrl.confirmCycleTransition} onCancel={() => ctrl.setShowCycleTransition(false)} />
      
      <Modal isOpen={!!ctrl.newUnlockedAchievement} onClose={() => ctrl.setNewUnlockedAchievement(null)} title="">
          <div className="text-center p-6 space-y-4">
              <div className="text-6xl animate-bounce">{unlockedAchObj?.icon || '🎉'}</div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wide bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Achievement Unlocked!</h3>
              <div>
                  <h4 className="text-xl font-bold text-white">{unlockedAchObj?.name}</h4>
                  <p className="text-slate-400">{unlockedAchObj?.description}</p>
              </div>
              <button onClick={() => ctrl.setNewUnlockedAchievement(null)} className="bg-slate-800 px-6 py-2 rounded-full text-white font-bold hover:bg-slate-700">Awesome!</button>
          </div>
      </Modal>

      <Modal isOpen={ctrl.showPremiumWall} onClose={() => ctrl.setShowPremiumWall(false)} title="Premium Feature">
          <div className="text-center p-4 space-y-4">
              <div className="bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Crown size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Unlock {PROGRAMS[ctrl.activeProfile.selectedProgram]?.name}</h3>
              <p className="text-slate-400 text-sm">Upgrade to access FSL, Monolith, Advanced Analytics, and more.</p>
              <button onClick={() => { ctrl.saveProfile({ ...ctrl.activeProfile, isPremium: true }); ctrl.setShowPremiumWall(false); showToast("Premium Unlocked (Demo)", "success"); }} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 py-3 rounded-xl text-black font-bold">Unlock Premium (Free Demo)</button>
              <button onClick={() => ctrl.setShowPremiumWall(false)} className="text-slate-500 text-sm hover:text-white">Maybe Later</button>
          </div>
      </Modal>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AppContent />
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;
