
import React, { useState, useEffect } from 'react';
import { UserProfile, LiftType, WorkoutSession } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TrendingUp, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface CycleTransitionProps {
  isOpen: boolean;
  profile: UserProfile;
  history: WorkoutSession[];
  onConfirm: (newTMs: Record<LiftType, number>, nextCycle: number) => void;
  onCancel: () => void;
}

export const CycleTransition: React.FC<CycleTransitionProps> = ({ isOpen, profile, history, onConfirm, onCancel }) => {
  const [newTMs, setNewTMs] = useState<Record<LiftType, number>>({ ...profile.trainingMaxes });
  const [performance, setPerformance] = useState<Record<LiftType, { reps: number, passed: boolean }>>({
    [LiftType.Squat]: { reps: 0, passed: false },
    [LiftType.Bench]: { reps: 0, passed: false },
    [LiftType.Deadlift]: { reps: 0, passed: false },
    [LiftType.Overhead]: { reps: 0, passed: false },
  });

  useEffect(() => {
    if (isOpen) {
      calculateProposals();
    }
  }, [isOpen]);

  const calculateProposals = () => {
    const isLbs = profile.unit === 'lbs';
    const upperInc = isLbs ? 5 : 2.5;
    const lowerInc = isLbs ? 10 : 5;
    
    const calculatedTMs = { ...profile.trainingMaxes };
    const calculatedPerf = { ...performance };

    Object.values(LiftType).forEach(lift => {
      // Find the 1+ week session (Week 3)
      const week3Session = history.find(s => 
        s.profileId === profile.id &&
        s.cycle === profile.currentCycle && 
        s.week === 3 && 
        s.lift === lift
      );

      let bestReps = 0;
      
      if (week3Session) {
         const mainEx = week3Session.exercises.find(e => e.type === 'Main');
         // Find AMRAP set or heaviest set
         mainEx?.sets.forEach(s => {
             if (s.completed && s.weight >= profile.trainingMaxes[lift] * 0.9) {
                 if ((s.actualReps || s.reps) > bestReps) bestReps = s.actualReps || s.reps;
             }
         });
      }

      // 5/3/1 Rule: If you hit at least 1 rep (or 5 for strong progress), you increase.
      // We'll use 3 reps as a "Safe" threshold to increase. < 3 suggests stall.
      const passed = bestReps >= 3 || !week3Session; // If no session recorded, assume pass (don't punish skipping)

      calculatedPerf[lift] = { reps: bestReps, passed };

      if (passed) {
        const inc = (lift === LiftType.Squat || lift === LiftType.Deadlift) ? lowerInc : upperInc;
        calculatedTMs[lift] += inc;
      } else {
        // Stall logic: Keep same or suggest reset? For now, keep same is safer than increasing.
        // User can override manually.
      }
    });

    setNewTMs(calculatedTMs);
    setPerformance(calculatedPerf);
  };

  const handleTmChange = (lift: LiftType, value: string) => {
    const val = parseInt(value) || 0;
    setNewTMs(prev => ({ ...prev, [lift]: val }));
  };

  const applyReset = (lift: LiftType) => {
      // 10% Reset
      const current = profile.trainingMaxes[lift];
      const resetVal = Math.round(current * 0.9);
      setNewTMs(prev => ({ ...prev, [lift]: resetVal }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Cycle Complete!">
      <div className="space-y-6">
        <div className="text-center space-y-2">
            <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Cycle {profile.currentCycle} Report Card</h3>
            <p className="text-sm text-slate-400">Review your performance before advancing.</p>
        </div>

        <div className="space-y-3">
          {Object.values(LiftType).map(lift => {
            const perf = performance[lift];
            const oldTM = profile.trainingMaxes[lift];
            const newTM = newTMs[lift];
            const diff = newTM - oldTM;

            return (
              <div key={lift} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {perf.passed ? (
                        <CheckCircle size={18} className="text-green-500" />
                    ) : (
                        <AlertTriangle size={18} className="text-red-500" />
                    )}
                    <span className="font-bold text-white">{lift}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Week 3 Best: <span className="text-white font-bold">{perf.reps > 0 ? perf.reps : '-'} reps</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold">New TM</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="number" 
                                value={newTM}
                                onChange={(e) => handleTmChange(lift, e.target.value)}
                                className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center font-bold"
                            />
                            <span className="text-xs text-slate-500">{profile.unit}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {diff > 0 && (
                             <span className="text-xs text-green-400 font-bold">+{diff}</span>
                        )}
                        {diff === 0 && !perf.passed && (
                             <button onClick={() => applyReset(lift)} className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900/50 hover:bg-red-900/50">
                                Reset -10%
                             </button>
                        )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg text-xs text-blue-200 flex items-start space-x-2">
             <RefreshCw size={16} className="shrink-0 mt-0.5" />
             <p>
                 Click "Start Cycle {profile.currentCycle + 1}" to update your Training Maxes and begin Week 1. 
                 If you struggled, consider resetting your TM for continuous progress.
             </p>
        </div>

        <div className="flex space-x-3">
            <Button variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
            <Button fullWidth onClick={() => onConfirm(newTMs, profile.currentCycle + 1)}>
                Start Cycle {profile.currentCycle + 1}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
