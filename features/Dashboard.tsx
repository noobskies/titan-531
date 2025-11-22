
import React from 'react';
import { UserProfile, LiftType } from '../types';
import { Button } from '../components/Button';
import { Dumbbell, Trophy, Play, CheckCircle, Circle, ArrowRight, MessageCircle, Calendar, Settings, Edit3 } from 'lucide-react';
import { TRANSLATIONS } from '../translations';

interface DashboardProps {
  profile: UserProfile;
  onStartWorkout: (lift: LiftType) => void;
  tip: string;
  completedLiftsThisWeek: LiftType[];
  onFinishWeek: () => void;
  onFinishCycle: () => void;
  onOpenSettings?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  profile, 
  onStartWorkout, 
  tip, 
  completedLiftsThisWeek, 
  onFinishWeek, 
  onFinishCycle,
  onOpenSettings
}) => {
  
  const t = TRANSLATIONS[profile.language || 'en'];
  const allLiftsDone = Object.values(LiftType).every(lift => completedLiftsThisWeek.includes(lift));
  const trainingDays = (profile.trainingDays && profile.trainingDays.length > 0) ? profile.trainingDays : [1, 3, 5]; // Default Mon, Wed, Fri
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Simple helper to get prediction text
  const getNextTrainingDate = (offset: number): string => {
      const today = new Date();
      const currentDay = today.getDay(); // 0-6
      
      // Find next day in trainingDays that is >= currentDay
      // If offset > 0, we skip 'offset' number of training days
      
      // Create sorted unique days loop
      const sortedDays = [...trainingDays].sort();
      
      let daysToCheck = 0;
      let scheduleHits = 0;
      
      // Look ahead up to 14 days
      while (daysToCheck < 14) {
          const checkDate = new Date();
          checkDate.setDate(today.getDate() + daysToCheck);
          const dayOfWeek = checkDate.getDay();
          
          if (sortedDays.includes(dayOfWeek)) {
              if (daysToCheck === 0 && offset === 0) {
                  return "Today";
              }
              
              if (scheduleHits === offset) {
                  if (daysToCheck === 0) return "Today";
                  if (daysToCheck === 1) return "Tomorrow";
                  return checkDate.toLocaleDateString(profile.language || 'en', { weekday: 'short', month: 'short', day: 'numeric' });
              }
              scheduleHits++;
          }
          daysToCheck++;
      }
      
      return "Soon";
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-white">Titan 531</h1>
            <p className="text-slate-400">{t.dashboard_welcome}, {profile.name}</p>
        </div>
        <div className="bg-slate-900 px-3 py-1 rounded-lg border border-theme text-center">
            <div className="text-xs text-theme font-bold uppercase">{t.dashboard_cycle} {profile.currentCycle}</div>
            <div className="text-[10px] text-slate-400">{profile.selectedProgram}</div>
        </div>
      </div>

      {/* Progress/Cycle Status */}
      <div className="bg-card p-5 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden">
          <h2 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
            <span>{t.dashboard_week} {profile.currentWeek}</span>
            <span className="text-xs text-slate-500 font-normal uppercase tracking-wider">{profile.currentWeek === 4 ? 'Deload' : 'Training'}</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.values(LiftType).map(lift => {
                  const isDone = completedLiftsThisWeek.includes(lift);
                  return (
                      <div key={lift} className={`flex items-center p-2 rounded-lg border ${isDone ? 'bg-green-900/20 border-green-800' : 'bg-slate-900/50 border-slate-800'}`}>
                          {isDone ? <CheckCircle size={16} className="text-green-500 mr-2" /> : <Circle size={16} className="text-slate-600 mr-2" />}
                          <span className={`text-sm font-medium ${isDone ? 'text-green-400' : 'text-slate-400'}`}>{lift}</span>
                      </div>
                  )
              })}
          </div>

          {allLiftsDone ? (
              <div className="animate-in zoom-in duration-300">
                  {profile.currentWeek === 4 ? (
                       <Button fullWidth variant="primary" onClick={onFinishCycle} className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 shadow-yellow-900/20">
                           <Trophy size={18} className="mr-2" /> {t.dashboard_finish_cycle}
                       </Button>
                  ) : (
                       <Button fullWidth variant="primary" onClick={onFinishWeek}>
                           <ArrowRight size={18} className="mr-2" /> {t.dashboard_start} {profile.currentWeek + 1}
                       </Button>
                  )}
              </div>
          ) : (
              <div className="text-xs text-center text-slate-500 italic">Complete all 4 lifts to advance.</div>
          )}
      </div>

      {/* AI Tip */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-theme shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
                <MessageCircle size={16} className="text-theme" />
                <span className="text-xs font-bold text-theme uppercase tracking-wider">{t.dashboard_ai_tip}</span>
            </div>
            <p className="text-sm text-slate-200 italic">"{tip}"</p>
        </div>
      </div>

      {/* Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-white">{t.dashboard_schedule}</h2>
                <div className="flex space-x-1 mt-1">
                    {trainingDays.sort().map((day, i) => (
                        <span key={day} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase">
                            {daysOfWeek[day]}
                        </span>
                    ))}
                </div>
            </div>
            {onOpenSettings && (
                <button 
                    onClick={onOpenSettings} 
                    className="p-2 bg-slate-800/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
                >
                    <Edit3 size={16} />
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.values(LiftType).map((lift, index) => {
             const isDone = completedLiftsThisWeek.includes(lift);
             
             const remainingLifts = Object.values(LiftType).filter(l => !completedLiftsThisWeek.includes(l));
             const orderIndex = remainingLifts.indexOf(lift);
             const datePrediction = isDone ? "Completed" : getNextTrainingDate(orderIndex);

             if (isDone) return null;

             return (
                <button
                key={lift}
                onClick={() => onStartWorkout(lift)}
                className="flex items-center justify-between bg-card hover:bg-slate-800 p-4 rounded-xl border border-slate-800 transition-all group shadow-sm hover:shadow-md"
                >
                <div className="flex items-center space-x-4">
                    <div className="bg-theme-soft p-3 rounded-lg text-theme group-hover:bg-theme group-hover:text-white transition-colors">
                        <Dumbbell size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white">{lift}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <span>TM: {profile.trainingMaxes[lift]}{profile.unit}</span>
                            <span>•</span>
                            <span className={`flex items-center ${datePrediction === 'Today' ? 'text-green-400 font-bold' : 'text-theme'}`}>
                                <Calendar size={10} className="mr-1" />
                                {datePrediction}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-theme group-hover:text-white transition-colors">
                    <Play size={16} className="ml-0.5" />
                </div>
                </button>
             );
          })}
          
          {allLiftsDone && (
              <div className="text-center py-8 bg-card rounded-xl border border-slate-800 border-dashed">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                  <p className="text-slate-300 font-medium">{t.dashboard_complete}</p>
                  <p className="text-slate-500 text-sm">Great job. Rest up or start the next phase above.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
