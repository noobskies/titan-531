
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2 } from 'lucide-react';
import { Button } from '../components/Button';

export const IntervalTimer: React.FC = () => {
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'Work' | 'Rest' | 'Done' | 'Ready'>('Ready');
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const timerRef = useRef<number | null>(null);

  const playBeep = (freq = 880, duration = 0.1) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), duration * 1000);
    } catch (e) {
        console.error(e);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    setShowSettings(false);
    if (phase === 'Ready' || phase === 'Done') {
        setPhase('Work');
        setCurrentRound(1);
        setTimeLeft(workTime);
        playBeep(1200, 0.2);
    }
  };

  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
      setIsActive(false);
      setPhase('Ready');
      setCurrentRound(1);
      setTimeLeft(workTime);
      setShowSettings(true);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);
    } else if (timeLeft === 0 && isActive) {
        // Phase transition
        if (phase === 'Work') {
            if (currentRound >= rounds) {
                setPhase('Done');
                setIsActive(false);
                playBeep(880, 0.5); // Long beep for done
            } else {
                setPhase('Rest');
                setTimeLeft(restTime);
                playBeep(440, 0.3); // Low beep for rest
            }
        } else if (phase === 'Rest') {
            setPhase('Work');
            setCurrentRound(r => r + 1);
            setTimeLeft(workTime);
            playBeep(1200, 0.3); // High beep for work
        }
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isActive, timeLeft, phase, rounds, restTime, workTime, currentRound]);

  const formatTime = (s: number) => {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBgColor = () => {
      if (phase === 'Work') return 'bg-green-600';
      if (phase === 'Rest') return 'bg-orange-600';
      if (phase === 'Done') return 'bg-blue-600';
      return 'bg-slate-700';
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Interval Timer</h3>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white">
                <Settings size={20} />
            </button>
        </div>

        {showSettings && (
             <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Work (s)</label>
                    <input type="number" value={workTime} onChange={e => setWorkTime(Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1 text-white text-center" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Rest (s)</label>
                    <input type="number" value={restTime} onChange={e => setRestTime(Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1 text-white text-center" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Rounds</label>
                    <input type="number" value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1 text-white text-center" />
                </div>
            </div>
        )}

        <div className={`relative aspect-square rounded-full flex flex-col items-center justify-center mb-6 transition-colors duration-500 ${getBgColor()} shadow-[0_0_30px_rgba(0,0,0,0.3)]`}>
            <div className="text-6xl font-bold text-white font-mono tracking-tighter">
                {formatTime(timeLeft)}
            </div>
            <div className="text-xl font-bold text-white/80 uppercase tracking-widest mt-2">{phase}</div>
            {phase !== 'Ready' && phase !== 'Done' && (
                 <div className="absolute bottom-8 text-sm font-bold text-white/60 bg-black/20 px-3 py-1 rounded-full">
                    Round {currentRound}/{rounds}
                 </div>
            )}
        </div>

        <div className="flex space-x-3">
            {!isActive ? (
                <Button fullWidth onClick={startTimer} className={phase === 'Done' ? 'bg-blue-600' : 'bg-green-600'}>
                    <Play size={20} className="mr-2" /> {phase === 'Ready' || phase === 'Done' ? 'Start' : 'Resume'}
                </Button>
            ) : (
                <Button fullWidth variant="secondary" onClick={pauseTimer}>
                    <Pause size={20} className="mr-2" /> Pause
                </Button>
            )}
            <Button variant="secondary" onClick={resetTimer}>
                <RotateCcw size={20} />
            </Button>
        </div>
    </div>
  );
};
