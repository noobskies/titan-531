
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/Button';
import { ConditioningData, WorkoutSession } from '../types';
import { CONDITIONING_ACTIVITIES } from '../constants';
import { Play, Pause, StopCircle, Timer, Save, Activity, FileText, ChevronLeft } from 'lucide-react';

interface ConditioningProps {
    onSave: (data: ConditioningData) => void;
    onCancel: () => void;
    unit: 'lbs' | 'kg';
}

export const Conditioning: React.FC<ConditioningProps> = ({ onSave, onCancel, unit }) => {
    const [mode, setMode] = useState<'manual' | 'timer'>('manual');
    const [activity, setActivity] = useState(CONDITIONING_ACTIVITIES[0]);
    const [notes, setNotes] = useState('');
    const [intensity, setIntensity] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
    
    // Manual Mode Inputs
    const [manualDist, setManualDist] = useState('');
    const [manualTime, setManualTime] = useState(''); // Minutes

    // Timer Mode State
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isActive) {
            timerRef.current = window.setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [isActive]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSave = () => {
        let duration = 0;
        let distance = undefined;

        if (mode === 'timer') {
            duration = seconds;
        } else {
            duration = (parseFloat(manualTime) || 0) * 60;
            distance = parseFloat(manualDist) || undefined;
        }

        const data: ConditioningData = {
            activity,
            durationSeconds: duration,
            distance: distance,
            distanceUnit: unit === 'kg' ? 'km' : 'mi', // Simple assumption based on weight unit
            intensity,
            notes
        };

        onSave(data);
    };

    return (
        <div className="p-4 h-full flex flex-col space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex items-center space-x-4 mb-2">
                <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white">Conditioning</h2>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button 
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'manual' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
                >
                    Manual Log
                </button>
                <button 
                    onClick={() => setMode('timer')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'timer' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
                >
                    Active Timer
                </button>
            </div>

            {/* Activity Selector */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Activity Type</label>
                <select 
                    value={activity} 
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full bg-card border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                    {CONDITIONING_ACTIVITIES.map(act => (
                        <option key={act} value={act}>{act}</option>
                    ))}
                </select>
            </div>

            {/* Dynamic Content Based on Mode */}
            <div className="flex-1">
                {mode === 'timer' ? (
                    <div className="flex flex-col items-center justify-center space-y-8 py-8">
                        <div className="relative">
                             <div className={`w-64 h-64 rounded-full border-8 flex items-center justify-center ${isActive ? 'border-theme shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-slate-800'}`}>
                                <span className="text-5xl font-mono font-bold text-white">
                                    {formatTime(seconds)}
                                </span>
                             </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 w-full max-w-xs">
                            {!isActive ? (
                                <Button fullWidth size="lg" onClick={() => setIsActive(true)} className="bg-green-600 hover:bg-green-700 h-14">
                                    <Play size={24} className="mr-2" /> Start
                                </Button>
                            ) : (
                                <Button fullWidth size="lg" variant="secondary" onClick={() => setIsActive(false)} className="h-14">
                                    <Pause size={24} className="mr-2" /> Pause
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 bg-card p-5 rounded-xl border border-slate-800">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Duration (mins)</label>
                                <input 
                                    type="number" 
                                    value={manualTime}
                                    onChange={e => setManualTime(e.target.value)}
                                    placeholder="30"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Distance ({unit === 'kg' ? 'km' : 'mi'})</label>
                                <input 
                                    type="number" 
                                    value={manualDist}
                                    onChange={e => setManualDist(e.target.value)}
                                    placeholder="3.5"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Shared Fields */}
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Intensity</label>
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                            {['Easy', 'Moderate', 'Hard'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setIntensity(level as any)}
                                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${
                                        intensity === level 
                                        ? (level === 'Hard' ? 'bg-red-600 text-white' : level === 'Moderate' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white') 
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Notes</label>
                        <textarea 
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="How did it feel?"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-sm h-20 resize-none focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 pb- safe">
                <Button fullWidth size="lg" onClick={handleSave} disabled={mode === 'timer' && isActive}>
                    <Save size={20} className="mr-2" /> Save Session
                </Button>
            </div>
        </div>
    );
};
