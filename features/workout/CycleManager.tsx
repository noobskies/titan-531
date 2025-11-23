
import React, { useState } from 'react';
import { UserProfile, LiftType } from '../../types';
import { Button } from '../../components/Button';
import { RefreshCcw, Calculator, ArrowDown, AlertTriangle } from 'lucide-react';

interface CycleManagerProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const CycleManager: React.FC<CycleManagerProps> = ({ profile, onUpdateProfile }) => {
  const [mode, setMode] = useState<'percentage' | '1rm'>('percentage');
  const [percentage, setPercentage] = useState(90);
  const [inputs, setInputs] = useState<Record<LiftType, string>>({
    [LiftType.Squat]: profile.oneRepMaxes[LiftType.Squat].toString(),
    [LiftType.Bench]: profile.oneRepMaxes[LiftType.Bench].toString(),
    [LiftType.Deadlift]: profile.oneRepMaxes[LiftType.Deadlift].toString(),
    [LiftType.Overhead]: profile.oneRepMaxes[LiftType.Overhead].toString(),
  });

  const handleApplyPercentage = () => {
    if (!window.confirm(`Are you sure you want to adjust all Training Maxes to ${percentage}% of their current value?`)) return;

    const newTMs = { ...profile.trainingMaxes };
    Object.values(LiftType).forEach(lift => {
      newTMs[lift] = Math.round(newTMs[lift] * (percentage / 100));
    });

    onUpdateProfile({ ...profile, trainingMaxes: newTMs });
    alert("Training Maxes updated.");
  };

  const handleCalculateFrom1RM = () => {
    const newTMs = { ...profile.trainingMaxes };
    const new1RMs = { ...profile.oneRepMaxes };

    Object.values(LiftType).forEach(lift => {
      const val = parseInt(inputs[lift]);
      if (val && !isNaN(val)) {
        new1RMs[lift] = val;
        // TM is typically 85-90% of true 1RM
        newTMs[lift] = Math.round(val * 0.9);
      }
    });

    onUpdateProfile({ ...profile, trainingMaxes: newTMs, oneRepMaxes: new1RMs });
    alert("Training Maxes calculated (90% of entered 1RMs) and saved.");
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl">
      <div className="text-center mb-6">
        <div className="bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <RefreshCcw size={32} className="text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Cycle Manager</h3>
        <p className="text-xs text-slate-400">Manage your Training Maxes (TM) for the next cycle.</p>
      </div>

      <div className="flex bg-slate-900 p-1 rounded-lg mb-6 border border-slate-800">
        <button 
            onClick={() => setMode('percentage')}
            className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${mode === 'percentage' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
        >
            TM Reset %
        </button>
        <button 
            onClick={() => setMode('1rm')}
            className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${mode === '1rm' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
        >
            Calc from 1RM
        </button>
      </div>

      {mode === 'percentage' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <label className="block text-sm text-slate-400 mb-4">Adjust Current TMs by Percentage</label>
                  <div className="flex items-center justify-between mb-6">
                      <button onClick={() => setPercentage(Math.max(50, percentage - 5))} className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700"><ArrowDown size={20} /></button>
                      <div className="text-center">
                          <div className="text-4xl font-bold text-white">{percentage}%</div>
                          <div className="text-xs text-slate-500">of current TM</div>
                      </div>
                      <button onClick={() => setPercentage(Math.min(150, percentage + 5))} className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 rotate-180"><ArrowDown size={20} /></button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-500 bg-slate-950 p-3 rounded-lg mb-4">
                      {Object.values(LiftType).map(lift => (
                          <div key={lift} className="flex justify-between">
                              <span>{lift}</span>
                              <div className="flex items-center space-x-2">
                                <span className="line-through opacity-50">{profile.trainingMaxes[lift]}</span>
                                <span className="text-purple-400 font-bold">
                                    {Math.round(profile.trainingMaxes[lift] * (percentage / 100))} {profile.unit}
                                </span>
                              </div>
                          </div>
                      ))}
                  </div>

                  <Button fullWidth onClick={handleApplyPercentage} className="bg-purple-600 hover:bg-purple-700">
                      <RefreshCcw size={18} className="mr-2" /> Apply Adjustment
                  </Button>
              </div>
              <p className="text-xs text-slate-500 text-center italic">
                  Use this when you stall (Deload) or want to forcefully increase intensity.
              </p>
          </div>
      )}

      {mode === '1rm' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                  {Object.values(LiftType).map(lift => (
                      <div key={lift} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                          <label className="font-medium text-slate-300 text-sm">{lift}</label>
                          <div className="flex items-center space-x-2">
                              <input 
                                  type="number" 
                                  value={inputs[lift]} 
                                  onChange={e => setInputs({...inputs, [lift]: e.target.value})}
                                  className="w-20 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-right text-white focus:border-blue-500 focus:outline-none"
                                  placeholder="1RM"
                              />
                              <span className="text-xs text-slate-500 font-bold w-6">{profile.unit}</span>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-900/30 flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80">
                      This will update your recorded 1RMs and set your Training Maxes to 90% of these values.
                  </p>
              </div>

              <Button fullWidth onClick={handleCalculateFrom1RM} className="bg-blue-600 hover:bg-blue-700">
                  <Calculator size={18} className="mr-2" /> Calculate & Save
              </Button>
          </div>
      )}
    </div>
  );
};
