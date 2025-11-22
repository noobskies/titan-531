
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { PLATES_LBS, PLATES_KG, BAR_WEIGHT_LBS, BAR_WEIGHT_KG } from '../constants';

interface WarmupGeneratorProps {
  unit?: 'lbs' | 'kg';
}

export const WarmupGenerator: React.FC<WarmupGeneratorProps> = ({ unit = 'lbs' }) => {
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [generatedSets, setGeneratedSets] = useState<{percent: string, weight: number, plates: number[]}[]>([]);

  const isKg = unit === 'kg';
  const barWeight = isKg ? BAR_WEIGHT_KG : BAR_WEIGHT_LBS;
  const platesList = isKg ? PLATES_KG : PLATES_LBS;

  const calculatePlates = (weight: number) => {
    let remaining = (weight - barWeight) / 2;
    const plates: number[] = [];
    
    if (remaining < 0) return [];

    platesList.forEach(plate => {
      while (remaining >= plate) {
        plates.push(plate);
        remaining -= plate;
      }
    });

    return plates;
  };

  const generate = () => {
      const weight = parseFloat(targetWeight);
      if (!weight) return;

      const percentages = [0.4, 0.5, 0.6];
      const sets = percentages.map(p => {
          const w = Math.round((weight * p) / 5) * 5; // Round to nearest 5
          return {
              percent: `${p * 100}%`,
              weight: w,
              plates: calculatePlates(w)
          };
      });
      setGeneratedSets(sets);
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Warm-up Generator</h3>
      <p className="text-xs text-slate-400 mb-4">Enter your work set weight to generate progressive warm-up sets.</p>

      <div className="flex space-x-2 mb-6">
          <input 
            type="number" 
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder={`Target Weight (${unit})`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={generate}>Generate</Button>
      </div>

      <div className="space-y-3">
          {generatedSets.map((set, i) => (
              <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-xs font-bold">{set.percent} (x5 reps)</span>
                      <span className="text-white font-bold text-lg">{set.weight} {unit}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                      {set.plates.length > 0 ? set.plates.map((p, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-700 text-white px-1.5 py-0.5 rounded border border-slate-600">
                              {p}
                          </span>
                      )) : <span className="text-[10px] text-slate-600 italic">Empty Bar</span>}
                  </div>
              </div>
          ))}
          {generatedSets.length === 0 && (
              <div className="text-center py-4 text-slate-600 text-sm border border-dashed border-slate-800 rounded-lg">
                  Enter a weight to see sets.
              </div>
          )}
      </div>
    </div>
  );
};
