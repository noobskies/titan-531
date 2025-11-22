
import React from 'react';
import { WorkoutSession } from '../../types';

interface HistoryCalendarProps {
    history: WorkoutSession[];
}

export const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ history }) => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
        <div className="bg-card p-4 rounded-xl border border-slate-800 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
                <span className="text-white font-medium">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <span className="text-xs text-slate-500">{history.length} Sessions</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                    <div key={i} className="text-xs text-slate-600 font-bold mb-2">{d}</div>
                ))}
                {days.map(day => {
                    const dateString = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString();
                    const session = history.find(s => s.date === dateString); 
                    const hasWorkout = !!session;
                    const isCardio = session?.type === 'Conditioning';
                    
                    return (
                        <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${hasWorkout ? (isCardio ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-theme-soft text-theme font-bold border border-theme') : 'text-slate-600 bg-slate-900/30'}`}>
                            {day}
                            {hasWorkout && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isCardio ? 'bg-green-500' : 'bg-theme'}`}></div>}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
