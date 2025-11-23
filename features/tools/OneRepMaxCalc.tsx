
import React, { useState } from 'react';
import { Button } from '../../components/Button';

export const OneRepMaxCalc: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    
    if (!w || !r) return;

    // Epley Formula: 1RM = w * (1 + r/30)
    // Brzycki Formula: 1RM = w * (36 / (37 - r))
    
    // We'll use Epley as it's standard
    const oneRM = w * (1 + r / 30);
    setResult(Math.round(oneRM));
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">1RM Calculator</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. 225"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reps</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <Button fullWidth onClick={calculate} disabled={!weight || !reps}>
        Calculate
      </Button>

      {result !== null && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-center animate-in zoom-in duration-300">
          <p className="text-slate-400 text-sm">Estimated 1 Rep Max</p>
          <p className="text-4xl font-bold text-blue-400">{result}</p>
          
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-500">90% (TM)</div>
              <div className="font-bold text-white">{Math.round(result * 0.9)}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-500">85%</div>
              <div className="font-bold text-white">{Math.round(result * 0.85)}</div>
            </div>
             <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-500">70%</div>
              <div className="font-bold text-white">{Math.round(result * 0.7)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
