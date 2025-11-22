import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, Square, ChevronRight, Plus, Minus, Disc, FileText, ChevronDown, ChevronUp, Volume2, Award, Info, RefreshCw, ExternalLink, Image as ImageIcon, Loader, Activity, Clock, PlayCircle, StopCircle } from 'lucide-react';
import { WorkoutSession, Exercise, ExerciseInfo, TimerSettings } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { PlateCalculator } from './PlateCalculator';
import { EXERCISE_DB, DEFAULT_TIMER_SETTINGS } from '../constants';
import { generateExerciseIllustration } from '../services/geminiService';
import { TRANSLATIONS } from '../translations';
import { calculatePlates, getPlateColor } from '../utils/plateMath';

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

// Helper for TTS
const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
};

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
    session, 
    personalRecord, 
    defaultRestTime, 
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
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerSettings.main);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState<number | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [prCelebration, setPrCelebration] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<ExerciseInfo | null>(null);
  const [showSwap, setShowSwap] = useState<{idx: number, type: string} | null>(null);
  
  // Active Set State (The set currently being performed)
  const [activeSetId, setActiveSetId] = useState<{ex: number, s: number} | null>(null);
  const [activeSetDuration, setActiveSetDuration] = useState(0);
  
  const t = TRANSLATIONS[language];

  // Session Timer State
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const timerRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const activeSetTimerRef = useRef<number | null>(null);

  // Helpers
  const getExerciseInfo = (name: string): ExerciseInfo | undefined => {
      const custom = customExercises.find(c => c.name === name);
      if (custom) return custom;
      return EXERCISE_DB[name];
  };

  // Session Timer Logic
  useEffect(() => {
      sessionTimerRef.current = window.setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => {
          if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      };
  }, [startTime]);

  // Active Set Stopwatch Logic
  useEffect(() => {
      if (activeSetId) {
          activeSetTimerRef.current = window.setInterval(() => {
              setActiveSetDuration(d => d + 1);
          }, 1000);
      } else {
          setActiveSetDuration(0);
          if (activeSetTimerRef.current) clearInterval(activeSetTimerRef.current);
      }
      return () => {
          if (activeSetTimerRef.current) clearInterval(activeSetTimerRef.current);
      }
  }, [activeSetId]);

  // Load image when info is shown
  useEffect(() => {
    if (showInfo) {
        setGeneratedImage(null);
        setImageLoading(true);
        generateExerciseIllustration(showInfo.name)
            .then(url => {
                if (url) setGeneratedImage(url);
            })
            .finally(() => setImageLoading(false));
    }
  }, [showInfo]);

  // Audio context for beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), 200);
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  // Rest Timer Logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
            const nextTime = prev - 1;
            
            // Voice Cues
            if (voiceEnabled) {
                if (nextTime === 30) speak("30 seconds remaining");
                if (nextTime === 10) speak("10 seconds");
                if (nextTime <= 3 && nextTime > 0) speak(nextTime.toString());
                if (nextTime === 0) speak("Begin set");
            }

            if (nextTime <= 0) {
                setIsTimerRunning(false);
                playBeep();
                return 0;
            }
            return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, voiceEnabled]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const adjustTimer = (delta: number) => {
      setTimeLeft(prev => Math.max(0, prev + delta));
  };

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
        // Undo
        set.completed = false;
        setIsTimerRunning(false);
    } else if (activeSetId?.ex === exIdx && activeSetId?.s === setIdx) {
        // Finish Set
        set.completed = true;
        setActiveSetId(null);
        
        // Check PR
        if (set.isAmrap || (set.weight > personalRecord * 0.8)) {
            checkPR(set.weight, set.actualReps || set.reps);
        }

        // Determine and Start Rest Timer
        let restDuration = timerSettings.main;
        if (exercise.type === 'Supplemental') restDuration = timerSettings.supplemental;
        if (exercise.type === 'Assistance') restDuration = timerSettings.assistance;
        
        setTimeLeft(restDuration);
        setIsTimerRunning(true);
    } else {
        // Start Set
        setActiveSetId({ ex: exIdx, s: setIdx });
        setIsTimerRunning(false); // Ensure rest timer is off while working
    }

    const allSetsDone = newSession.exercises[exIdx].sets.every(s => s.completed);
    newSession.exercises[exIdx].completed = allSetsDone;

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

  const handleFinish = () => {
      const finishedSession = { ...session, durationSeconds: elapsedSeconds };
      onComplete(finishedSession);
  };

  const currentExercise = session.exercises[activeExerciseIdx];
  const currentExerciseInfo = getExerciseInfo(currentExercise.name);

  const allSwapOptions = [
      ...customExercises,
      ...Object.values(EXERCISE_DB)
  ].sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-300 relative">
      {/* Modals */}
      <Modal isOpen={showPlateCalc !== null} onClose={() => setShowPlateCalc(null)} title={t.tools_plate_calc}>
         {showPlateCalc !== null && <PlateCalculator targetWeight={showPlateCalc} unit={unit} inventory={plateInventory} />}
      </Modal>

      <Modal isOpen={!!showInfo} onClose={() => setShowInfo(null)} title="Exercise Info">
         {showInfo && (
             <div className="space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xl font-bold text-white">{showInfo.name}</h4>
                        <div className="mt-1 inline-block px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-800">
                            {showInfo.category}
                        </div>
                    </div>
                 </div>

                 <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden relative flex items-center justify-center">
                    {imageLoading ? (
                        <div className="flex flex-col items-center text-slate-500">
                            <Loader className="animate-spin mb-2" />
                            <span className="text-xs">Generating visual...</span>
                        </div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt={showInfo.name} className="w-full h-full object-contain opacity-90" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-600">
                            <ImageIcon size={32} className="mb-2 opacity-50" />
                            <span className="text-xs">No visualization available</span>
                        </div>
                    )}
                 </div>

                 <p className="text-slate-300 text-sm leading-relaxed">
                     {showInfo.instructions}
                 </p>
                 {showInfo.videoUrl && (
                     <a 
                        href={showInfo.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-medium p-2 bg-blue-900/10 rounded-lg border border-blue-900/20"
                     >
                         <ExternalLink size={16} />
                         <span>Watch Tutorial</span>
                     </a>
                 )}
             </div>
         )}
      </Modal>

      <Modal isOpen={!!showSwap} onClose={() => setShowSwap(null)} title="Swap Exercise">
          <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">Select an exercise to replace the current one.</div>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {showSwap && allSwapOptions
                    .filter(ex => {
                        return ex.category !== 'Main' || ex.name === session.exercises[showSwap.idx].name; 
                    })
                    .map(ex => (
                        <button 
                            key={ex.name}
                            onClick={() => handleSwapExercise(ex.name)}
                            className="w-full text-left p-3 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex justify-between"
                        >
                            <span>{ex.name}</span>
                            <span className="text-xs text-slate-500">{ex.category}</span>
                        </button>
                    ))
                }
              </div>
          </div>
      </Modal>

      {/* PR Notification */}
      {prCelebration && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow-2xl z-50 animate-in bounce-in duration-500 flex items-center space-x-2">
              <Award size={24} />
              <span>{prCelebration}</span>
          </div>
      )}

      {/* Header & Timer */}
      <div className="flex justify-between items-center sticky top-0 bg-darker/95 backdrop-blur py-2 z-20 border-b border-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-white">{session.title}</h2>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock size={12} />
              <span className="font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            {isTimerRunning && (
                <div className="flex flex-col space-y-1">
                    <button onClick={() => adjustTimer(30)} className="p-1 bg-slate-800 rounded text-xs hover:bg-slate-700">+30</button>
                    <button onClick={() => adjustTimer(-30)} className="p-1 bg-slate-800 rounded text-xs hover:bg-slate-700">-30</button>
                </div>
            )}
            <div 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer border shadow-lg ${
                    timeLeft === 0 
                    ? 'bg-red-900/50 border-red-500 text-red-200 animate-pulse' 
                    : isTimerRunning 
                        ? 'bg-theme-soft border-theme text-theme' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
            >
                {timeLeft === 0 && <Volume2 size={16} className="animate-bounce" />}
                <Timer size={18} />
                <span className="font-mono font-bold text-lg w-12 text-center">{formatTime(timeLeft)}</span>
            </div>
        </div>
      </div>

      {/* Exercise Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {session.exercises.map((ex, idx) => (
          <button
            key={ex.id}
            onClick={() => setActiveExerciseIdx(idx)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              activeExerciseIdx === idx 
                ? 'bg-theme text-white border-theme shadow-lg' 
                : ex.completed 
                  ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Active Exercise Card */}
      <div className="bg-card rounded-2xl p-5 shadow-xl border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
              <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{currentExercise.name}</h3>
                  <button 
                    onClick={() => setShowInfo(currentExerciseInfo || { name: currentExercise.name, category: 'Main', instructions: "No info available." })}
                    className="text-slate-500 hover:text-theme transition-colors"
                  >
                      <Info size={18} />
                  </button>
                  {currentExercise.type === 'Assistance' && (
                      <button 
                        onClick={() => setShowSwap({ idx: activeExerciseIdx, type: currentExercise.type })}
                        className="text-slate-500 hover:text-theme transition-colors"
                      >
                          <RefreshCw size={16} />
                      </button>
                  )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentExercise.type} • {currentExercise.sets.length} Sets
              </p>
          </div>
          {currentExercise.type === 'Main' && <span className="text-xs bg-theme-soft text-theme px-2 py-1 rounded border border-theme">Main Lift</span>}
        </div>

        <div className="space-y-3">
          {currentExercise.sets.map((set, sIdx) => {
            const isActive = activeSetId?.ex === activeExerciseIdx && activeSetId?.s === sIdx;
            const plates = calculatePlates(set.weight, unit, undefined, plateInventory);
            
            return (
                <div key={sIdx} className={`flex flex-col p-3 rounded-xl border transition-all ${
                set.completed 
                    ? 'bg-green-900/10 border-green-900/30' 
                    : isActive
                        ? 'bg-theme-soft border-theme shadow-[0_0_15px_rgba(var(--theme-rgb),0.2)]'
                        : set.isWarmup 
                            ? 'bg-orange-900/5 border-orange-900/10 opacity-75' 
                            : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}>
                
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1">
                        <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                            set.completed 
                                ? 'bg-green-900/20 text-green-400' 
                                : isActive
                                    ? 'bg-theme text-white animate-pulse'
                                    : set.isWarmup 
                                        ? 'bg-orange-500/20 text-orange-400' 
                                        : 'bg-slate-700 text-slate-400'
                        }`}>
                            {sIdx + 1}
                        </div>
                        <div className="cursor-pointer flex-1" onClick={() => setShowPlateCalc(set.weight)}>
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-xl font-bold text-white whitespace-nowrap">{set.weight} <span className="text-xs text-slate-500">{unit}</span></span>
                                
                                {/* Mini Plate Icons */}
                                <div className="flex items-center space-x-0.5">
                                    {plates.map((p, i) => (
                                        <span key={i} className={`text-[9px] font-bold px-1 rounded-sm border ${getPlateColor(p, unit)} opacity-90`}>
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center mt-1">
                                {isActive && (
                                    <span className="mr-2 text-[10px] bg-theme text-white px-1.5 rounded font-mono">
                                        {formatTime(activeSetDuration)}
                                    </span>
                                )}
                                {set.isWarmup && !isActive && <span className="mr-2 text-[10px] bg-orange-500/10 text-orange-300 px-1 rounded border border-orange-500/20">{t.workout_warmup}</span>}
                                {t.workout_target}: {set.reps}{set.isAmrap ? '+' : ''}
                                {set.isAmrap && <span className="ml-2 text-[10px] bg-red-500/20 text-red-300 px-1 rounded border border-red-500/30">{t.workout_amrap}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        {(set.isAmrap || set.completed || isActive) && (
                            <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
                                <button onClick={() => updateReps(activeExerciseIdx, sIdx, -1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Minus size={14} /></button>
                                <span className="w-8 text-center font-bold text-white text-sm">{set.actualReps ?? set.reps}</span>
                                <button onClick={() => updateReps(activeExerciseIdx, sIdx, 1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Plus size={14} /></button>
                            </div>
                        )}

                        <button
                        onClick={() => handleSetAction(activeExerciseIdx, sIdx)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            set.completed 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-900/50 scale-105' 
                            : isActive
                                ? 'bg-theme text-white shadow-lg shadow-theme/50 scale-110 ring-2 ring-theme ring-offset-2 ring-offset-darker'
                                : 'bg-slate-700 text-slate-400 hover:bg-theme-soft hover:text-theme'
                        }`}
                        >
                        {set.completed ? <CheckCircle size={20} /> : isActive ? <Square size={18} fill="currentColor" /> : <PlayCircle size={22} />}
                        </button>
                    </div>
                </div>

                {/* RPE Input Row */}
                {set.completed && (
                    <div className="flex items-center justify-end pt-2 border-t border-slate-800/50 mt-1">
                        <span className="text-[10px] text-slate-500 mr-2 uppercase font-bold">RPE</span>
                        <div className="flex items-center space-x-1">
                            {[6, 7, 8, 9, 10].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => updateRpe(activeExerciseIdx, sIdx, r.toString())}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-all ${
                                        set.rpe === r 
                                        ? 'bg-purple-900/50 border-purple-500 text-purple-300' 
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            );
          })}
        </div>
      </div>
      
      {/* Notes Section */}
      <div className="bg-card rounded-xl border border-slate-800 overflow-hidden">
          <button 
            onClick={() => setNotesOpen(!notesOpen)}
            className="w-full flex items-center justify-between p-4 text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
              <div className="flex items-center space-x-2">
                  <FileText size={18} />
                  <span className="font-medium text-sm">{t.workout_notes}</span>
              </div>
              {notesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {notesOpen && (
              <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <textarea 
                    value={session.notes || ''}
                    onChange={(e) => onUpdateSession({ ...session, notes: e.target.value })}
                    placeholder={t.workout_notes_placeholder}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                  />
              </div>
          )}
      </div>

      {/* Navigation / Finish Actions */}
      <div className="pt-2">
        {activeExerciseIdx < session.exercises.length - 1 ? (
           <Button 
             fullWidth 
             variant="primary" // Changed to primary for theme consistency
             onClick={() => setActiveExerciseIdx(prev => prev + 1)}
             className="flex items-center justify-center space-x-2 h-12"
           >
             <span>{t.workout_next}</span>
             <ChevronRight size={18} />
           </Button>
        ) : (
            <Button 
            fullWidth 
            variant="primary"
            size="lg"
            onClick={handleFinish}
            className="h-12 bg-green-600 hover:bg-green-700 border-0" // Make finish button green to distinguish
          >
            {t.workout_finish}
          </Button>
        )}
      </div>
    </div>
  );
};