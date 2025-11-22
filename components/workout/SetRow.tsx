
import React from 'react';
import { SetData } from '../../types';
import { CheckCircle, PlayCircle, Square, Plus, Minus } from 'lucide-react';
import { PlateStack } from '../PlateVisuals';

interface SetRowProps {
    set: SetData;
    index: number;
    isActive: boolean;
    unit: 'lbs' | 'kg';
    plateInventory?: Record<number, number>;
    onToggle: () => void;
    onUpdateReps: (delta: number) => void;
    onUpdateRpe: (val: string) => void;
    onShowPlates: (weight: number) => void;
    formattedTime?: string;
    t: any;
}

export const SetRow: React.FC<SetRowProps> = ({
    set, index, isActive, unit, plateInventory, onToggle, onUpdateReps, onUpdateRpe, onShowPlates, formattedTime, t
}) => {
    return (
        <div className={`flex flex-col p-3 rounded-xl border transition-all ${
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
                    {/* Set Number Indicator */}
                    <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        set.completed 
                            ? 'bg-green-900/20 text-green-400' 
                            : isActive
                                ? 'bg-theme text-white animate-pulse'
                                : set.isWarmup 
                                    ? 'bg-orange-500/20 text-orange-400' 
                                    : 'bg-slate-700 text-slate-400'
                    }`}>
                        {index + 1}
                    </div>
                    
                    {/* Weight & Plates */}
                    <div className="cursor-pointer flex-1" onClick={() => onShowPlates(set.weight)}>
                        <div className="flex items-center flex-wrap gap-3">
                            <span className="text-xl font-bold text-white whitespace-nowrap">
                                {set.weight} <span className="text-xs text-slate-500">{unit}</span>
                            </span>
                            <PlateStack weight={set.weight} unit={unit} inventory={plateInventory} />
                        </div>
                        <div className="text-xs text-slate-400 flex items-center mt-1">
                            {isActive && formattedTime && (
                                <span className="mr-2 text-[10px] bg-theme text-white px-1.5 rounded font-mono">
                                    {formattedTime}
                                </span>
                            )}
                            {set.isWarmup && !isActive && (
                                <span className="mr-2 text-[10px] bg-orange-500/10 text-orange-300 px-1 rounded border border-orange-500/20">
                                    {t.workout_warmup}
                                </span>
                            )}
                            {t.workout_target}: {set.reps}{set.isAmrap ? '+' : ''}
                            {set.isAmrap && (
                                <span className="ml-2 text-[10px] bg-red-500/20 text-red-300 px-1 rounded border border-red-500/30">
                                    {t.workout_amrap}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                    {(set.isAmrap || set.completed || isActive) && (
                        <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
                            <button onClick={(e) => { e.stopPropagation(); onUpdateReps(-1); }} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Minus size={14} /></button>
                            <span className="w-8 text-center font-bold text-white text-sm">{set.actualReps ?? set.reps}</span>
                            <button onClick={(e) => { e.stopPropagation(); onUpdateReps(1); }} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Plus size={14} /></button>
                        </div>
                    )}

                    <button
                        onClick={onToggle}
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

            {/* RPE Row */}
            {set.completed && (
                <div className="flex items-center justify-end pt-2 border-t border-slate-800/50 mt-1">
                    <span className="text-[10px] text-slate-500 mr-2 uppercase font-bold">RPE</span>
                    <div className="flex items-center space-x-1">
                        {[6, 7, 8, 9, 10].map(r => (
                            <button 
                                key={r}
                                onClick={() => onUpdateRpe(r.toString())}
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
};
