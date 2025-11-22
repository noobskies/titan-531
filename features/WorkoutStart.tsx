
import React from 'react';
import { LiftType, UserProfile } from '../types';
import { Dumbbell, Play, CheckCircle, Calendar } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface WorkoutStartProps {
    profile: UserProfile;
    onStartWorkout: (lift: LiftType) => void;
    completedLifts: LiftType[];
}

export const WorkoutStart: React.FC<WorkoutStartProps> = ({ profile, onStartWorkout, completedLifts }) => {
    const t = TRANSLATIONS[profile.language || 'en'];
    
    // Determine next lift
    const allLifts = Object.values(LiftType);
    const remainingLifts = allLifts.filter(l => !completedLifts.includes(l));
    const nextLift = remainingLifts.length > 0 ? remainingLifts[0] : null;

    return (
        <div className="p-4 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Start Workout</h2>
                    <p className="text-slate-400 text-sm">Cycle {profile.currentCycle} • Week {profile.currentWeek}</p>
                </div>
                <div className="bg-theme-soft p-3 rounded-full text-theme">
                    <Dumbbell size={24} />
                </div>
            </div>

            {/* Recommendation Card */}
            {nextLift ? (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-theme/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Play size={120} />
                    </div>
                    <div className="relative z-10">
                        <span className="text-theme font-bold text-xs uppercase tracking-wider mb-2 block">Recommended Next</span>
                        <h3 className="text-3xl font-bold text-white mb-1">{nextLift}</h3>
                        <p className="text-slate-400 text-sm mb-6">Training Max: {profile.trainingMaxes[nextLift]} {profile.unit}</p>
                        
                        <button 
                            onClick={() => onStartWorkout(nextLift)}
                            className="w-full bg-theme hover:bg-theme-secondary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center"
                        >
                            <Play size={20} className="mr-2 fill-current" />
                            Start Session
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-900/20 p-6 rounded-2xl border border-green-900/50 text-center">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                    <h3 className="text-xl font-bold text-white">Week Complete!</h3>
                    <p className="text-slate-400 text-sm mt-1">You've finished all main lifts for this week.</p>
                </div>
            )}

            {/* List of all lifts */}
            <div>
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider text-slate-500">All Lifts</h3>
                <div className="grid grid-cols-1 gap-3">
                    {allLifts.map(lift => {
                        const isDone = completedLifts.includes(lift);
                        return (
                            <button
                                key={lift}
                                onClick={() => onStartWorkout(lift)}
                                disabled={isDone}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    isDone 
                                    ? 'bg-slate-900/30 border-slate-800 opacity-60 cursor-not-allowed' 
                                    : 'bg-card hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDone ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 text-white'}`}>
                                        {isDone ? <CheckCircle size={20} /> : <Dumbbell size={20} />}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>{lift}</div>
                                        <div className="text-xs text-slate-500">TM: {profile.trainingMaxes[lift]} {profile.unit}</div>
                                    </div>
                                </div>
                                {!isDone && (
                                    <div className="bg-slate-800 p-2 rounded-full text-slate-400">
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
