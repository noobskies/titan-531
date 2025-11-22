
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Volume2, Award, Info, RefreshCw, ExternalLink, Image as ImageIcon, Loader, Clock, Edit3, ChevronRight } from 'lucide-react';
import { WorkoutSession, ExerciseInfo, TimerSettings } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PlateCalculator } from '../tools/PlateCalculator';
import { SetRow } from './components/SetRow';
import { EXERCISE_DB, DEFAULT_TIMER_SETTINGS } from '../../constants';
import { generateExerciseIllustration } from '../../services/api/geminiService';
import { TRANSLATIONS } from '../../translations';
import { useRestTimer } from '../../hooks/useRestTimer';

interface ActiveWorkoutProps {
  session: WorkoutSession;
  personalRecord: number; 
  defaultRestTime: number;
  timerSettings?: TimerSettings;
  unit: 'lbs' | 'kg';
  soundEnabled: boolean;
  voiceEnabled?: boolean;
  plateInventory?: Record<number, number>;
  customExercises?: ExerciseInfo[]; 
  onComplete: (session: WorkoutSession) => void;
  onUpdateSession: (session: WorkoutSession) => void;
  language?: 'en' | 'es' | 'fr';
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
    session, 
    personalRecord, 
    timerSettings = DEFAULT_TIMER_SETTINGS,
    unit, 
    soundEnabled, 
    voiceEnabled = false,
    plateInventory,
    customExercises = [],
    onComplete, 
    onUpdateSession,
    language = 'en'
}) => {
  const t = TRANSLATIONS[language];
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [showPlateCalc, setShowPlateCalc] = useState<number | null>(null);
  const [exerciseNoteOpen, setExerciseNoteOpen] = useState(false);
  const [prCelebration, setPrCelebration] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<ExerciseInfo | null>(null);
  const [showSwap, setShowSwap] = useState<{idx: number, type: string} | null>(null);
  
  // Active Set Tracking
  const [activeSetId, setActiveSetId] = useState<{ex: number, s: number} | null>(null);
  const [activeSetDuration, setActiveSetDuration] = useState(0);
  const activeSetTimerRef = useRef<number | null>(null);

  // Session Timer
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionTimerRef = useRef<number | null>(null);

  // Rest Timer Hook
  const restTimer = useRestTimer({
      defaultTime: timerSettings.main,
      soundEnabled,
      voiceEnabled: !!voiceEnabled
  });
  
  // Image Generation
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Helpers
  const getExerciseInfo = (name: string): ExerciseInfo | undefined => {
      return customExercises.find(c => c.name === name) || EXERCISE_DB[name];
  };

  // Session Timer Effect
  useEffect(() => {
      sessionTimerRef.current = window.setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [startTime]);

  // Active Set Stopwatch Effect
  useEffect(() => {
      if (activeSetId) {
          activeSetTimerRef.current = window.setInterval(() => setActiveSetDuration(d => d + 1), 1000);
      } else {
          setActiveSetDuration(0);
          if (activeSetTimerRef.current) clearInterval(activeSetTimerRef.current);
      }
      return () => { if (activeSetTimerRef.current) clearInterval(activeSetTimerRef.current); }
  }, [activeSetId]);

  // Load AI Image Effect
  useEffect(() => {
    if (showInfo) {
        setGeneratedImage(null);
        setImageLoading(true);
        generateExerciseIllustration(showInfo.name)
            .then(url => { if (url) setGeneratedImage(url); })
            .finally(() => setImageLoading(false));
    }
  }, [showInfo]);

  const checkPR = (setWeight: number, reps: number) => {
      const est1RM = Math.round(setWeight * (1 + reps / 30));
      if (est1RM > personalRecord) {
          setPrCelebration(`New PR! ${est1RM} ${unit}`);
          setTimeout(() => setPrCelebration(null), 5000);
      }
  };

  const handleSetAction = (exIdx: number, setIdx: number) => {
    const newSession = { ...session };
    const exercise = newSession.exercises[exIdx];
    const set = exercise.sets[setIdx];
    
    if (set.completed) {
        set.completed = false;
        restTimer.stop();
    } else if (activeSetId?.ex === exIdx && activeSetId?.s === setIdx) {
        // Finish Set
        set.completed = true;
        setActiveSetId(null);
        
        if (set.isAmrap || (set.weight > personalRecord * 0.8)) {
            checkPR(set.weight, set.actualReps || set.reps);
        }

        let restDuration = timerSettings.main;
        if (exercise.type === 'Supplemental') restDuration = timerSettings.supplemental;
        if (exercise.type === 'Assistance') restDuration = timerSettings.assistance;
        
        restTimer.start(restDuration);
    } else {
        // Start Set
        setActiveSetId({ ex: exIdx, s: setIdx });
        restTimer.stop();
    }

    newSession.exercises[exIdx].completed = newSession.exercises[exIdx].sets.every(s => s.completed);
    onUpdateSession(newSession);
  };

  const updateReps = (exIdx: number, setIdx: number, delta: number) => {
    const newSession = { ...session };
    const set = newSession.exercises[exIdx].sets[setIdx];
    if (!set.actualReps) set.actualReps = set.reps;
    set.actualReps = Math.max(0, (set.actualReps || 0) + delta);
    onUpdateSession(newSession);
  };

  const updateRpe = (exIdx: number, setIdx: number, val: string) => {
    const newSession = { ...session };
    const rpe = parseFloat(val);
    if (isNaN(rpe) || rpe < 0 || rpe > 10) return;
    newSession.exercises[exIdx].sets[setIdx].rpe = rpe;
    onUpdateSession(newSession);
  };
  
  const handleSwapExercise = (newExerciseName: string) => {
      if (!showSwap) return;
      const newSession = { ...session };
      const exercise = newSession.exercises[showSwap.idx];
      exercise.name = newExerciseName;
      exercise.sets.forEach(s => s.completed = false);
      exercise.completed = false;
      onUpdateSession(newSession);
      setShowSwap(null);
  };

  const currentExercise = session.exercises[activeExerciseIdx];
  const currentExerciseInfo = getExerciseInfo(currentExercise.name);
  const allSwapOptions = [...customExercises, ...Object.values(EXERCISE_DB)].sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300 relative">
      <Modal isOpen={showPlateCalc !== null} onClose={() => setShowPlateCalc(null)} title={t.tools_plate_calc}>
         {showPlateCalc !== null && <PlateCalculator targetWeight={showPlateCalc} unit={unit} inventory={plateInventory} />}
      </Modal>

      <Modal isOpen={!!showInfo} onClose={() => setShowInfo(null)} title="Exercise Info">
         {showInfo && (
             <div className="space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xl font-bold text-white">{showInfo.name}</h4>
                        <span className="mt-1 inline-block px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-800">{showInfo.category}</span>
                    </div>
                 </div>
                 <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden relative flex items-center justify-center">
                    {imageLoading ? <Loader className="animate-spin mb-2 text-slate-500" /> : generatedImage ? <img src={generatedImage} alt={showInfo.name} className="w-full h-full object-contain opacity-90" /> : <ImageIcon size={32} className="mb-2 opacity-50" />}
                 </div>
                 <p className="text-slate-300 text-sm leading-relaxed">{showInfo.instructions}</p>
                 {showInfo.videoUrl && (
                     <a href={showInfo.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-400 text-sm font-medium p-2 bg-blue-900/10 rounded-lg border border-blue-900/20">
                         <ExternalLink size={16} /><span>Watch Tutorial</span>
                     </a>
                 )}
             </div>
         )}
      </Modal>

      <Modal isOpen={!!showSwap} onClose={() => setShowSwap(null)} title="Swap Exercise">
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {showSwap && allSwapOptions
                .filter(ex => ex.category !== 'Main' || ex.name === session.exercises[showSwap.idx].name)
                .map(ex => (
                    <button key={ex.name} onClick={() => handleSwapExercise(ex.name)} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex justify-between">
                        <span>{ex.name}</span>
                        <span className="text-xs text-slate-500">{ex.category}</span>
                    </button>
                ))
            }
          </div>
      </Modal>

      {prCelebration && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow-2xl z-50 animate-in bounce-in duration-500 flex items-center space-x-2">
              <Award size={24} /><span>{prCelebration}</span>
          </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center sticky top-0 bg-darker/95 backdrop-blur py-2 z-20 border-b border-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-white">{session.title}</h2>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock size={12} /> <span className="font-mono">{restTimer.formatTime(elapsedSeconds)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            {restTimer.isRunning && (
                <div className="flex flex-col space-y-1">
                    <button onClick={() => restTimer.adjust(30)} className="p-1 bg-slate-800 rounded text-xs hover:bg-slate-700">+30</button>
                    <button onClick={() => restTimer.adjust(-30)} className="p-1 bg-slate-800 rounded text-xs hover:bg-slate-700">-30</button>
                </div>
            )}
            <div onClick={() => restTimer.setIsRunning(!restTimer.isRunning)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer border shadow-lg ${restTimer.timeLeft === 0 ? 'bg-red-900/50 border-red-500 text-red-200 animate-pulse' : restTimer.isRunning ? 'bg-theme-soft border-theme text-theme' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {restTimer.timeLeft === 0 && <Volume2 size={16} className="animate-bounce" />}
                <Timer size={18} />
                <span className="font-mono font-bold text-lg w-12 text-center">{restTimer.formatTime(restTimer.timeLeft)}</span>
            </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {session.exercises.map((ex, idx) => (
          <button key={ex.id} onClick={() => setActiveExerciseIdx(idx)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${activeExerciseIdx === idx ? 'bg-theme text-white border-theme shadow-lg' : ex.completed ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            {ex.name}
          </button>
        ))}
      </div>

      {/* Active Card */}
      <div className="bg-card rounded-2xl p-5 shadow-xl border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
              <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{currentExercise.name}</h3>
                  <button onClick={() => setShowInfo(currentExerciseInfo || { name: currentExercise.name, category: 'Main', instructions: "No info." })} className="text-slate-500 hover:text-theme"><Info size={18} /></button>
                  {currentExercise.type === 'Assistance' && <button onClick={() => setShowSwap({ idx: activeExerciseIdx, type: currentExercise.type })} className="text-slate-500 hover:text-theme"><RefreshCw size={16} /></button>}
                   <button onClick={() => setExerciseNoteOpen(!exerciseNoteOpen)} className={`transition-colors ${currentExercise.notes ? 'text-theme' : 'text-slate-500 hover:text-theme'}`}><Edit3 size={16} /></button>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentExercise.type} • {currentExercise.sets.length} Sets</p>
          </div>
          {currentExercise.type === 'Main' && <span className="text-xs bg-theme-soft text-theme px-2 py-1 rounded border border-theme">Main Lift</span>}
        </div>
        
        {exerciseNoteOpen && (
            <div className="mb-4 animate-in slide-in-from-top-2">
                <textarea value={currentExercise.notes || ''} onChange={(e) => { const ns = {...session}; ns.exercises[activeExerciseIdx].notes = e.target.value; onUpdateSession(ns); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none" placeholder={`Notes for ${currentExercise.name}...`} />
            </div>
        )}

        <div className="space-y-3">
          {currentExercise.sets.map((set, sIdx) => (
              <SetRow 
                  key={sIdx}
                  set={set}
                  index={sIdx}
                  isActive={activeSetId?.ex === activeExerciseIdx && activeSetId?.s === sIdx}
                  unit={unit}
                  plateInventory={plateInventory}
                  onToggle={() => handleSetAction(activeExerciseIdx, sIdx)}
                  onUpdateReps={(delta) => updateReps(activeExerciseIdx, sIdx, delta)}
                  onUpdateRpe={(val) => updateRpe(activeExerciseIdx, sIdx, val)}
                  onShowPlates={setShowPlateCalc}
                  formattedTime={restTimer.formatTime(activeSetDuration)}
                  t={t}
              />
          ))}
        </div>
      </div>

      <div className="pt-2">
        {activeExerciseIdx < session.exercises.length - 1 ? (
           <Button fullWidth variant="primary" onClick={() => setActiveExerciseIdx(prev => prev + 1)} className="flex items-center justify-center space-x-2 h-12"><span>{t.workout_next}</span><ChevronRight size={18} /></Button>
        ) : (
            <Button fullWidth variant="primary" size="lg" onClick={() => onComplete({ ...session, durationSeconds: elapsedSeconds })} className="h-12 bg-green-600 hover:bg-green-700 border-0">{t.workout_finish}</Button>
        )}
      </div>
    </div>
  );
};
