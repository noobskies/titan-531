import React, { useState } from 'react';
import { PLATES_LBS, PLATES_KG, BAR_WEIGHT_LBS, BAR_WEIGHT_KG } from '../constants';
import { calculatePlates, getPlateColor } from '../utils/plateMath';

interface PlateCalculatorProps {
  targetWeight?: number;
  unit?: 'lbs' | 'kg';
  customBarWeight?: number;
  inventory?: Record<number, number>; 
}

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({ targetWeight = 135, unit = 'lbs', customBarWeight, inventory }) => {
  const [weight, setWeight] = useState(targetWeight);
  const isKg = unit === 'kg';
  const barWeight = customBarWeight !== undefined ? customBarWeight : (isKg ? BAR_WEIGHT_KG : BAR_WEIGHT_LBS);

  const plates = calculatePlates(weight, unit as 'lbs' | 'kg', customBarWeight, inventory);

  // Helper for height visual
  const getPlateHeight = (p: number) => {
      if (isKg) {
          if (p >= 20) return 'h-32';
          if (p === 15) return 'h-28';
          if (p === 10) return 'h-24';
          if (p === 5) return 'h-16';
          return 'h-12';
      } else {
          if (p >= 45) return 'h-32'; 
          if (p === 35) return 'h-28';
          if (p === 25) return 'h-24';
          if (p === 10) return 'h-16';
          return 'h-12';
      }
  };

  // Map utility color class to simplified bg for the bar visual
  const getVisualColor = (p: number) => {
      const colorClass = getPlateColor(p, unit as 'lbs' | 'kg');
      // Extract just the bg- class
      return colorClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-600';
  }

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Plate Calculator</h3>
      
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button 
            onClick={() => setWeight(Math.max(barWeight, weight - (isKg ? 2.5 : 5)))}
            className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center text-2xl font-bold"
        >-</button>
        <div className="flex flex-col items-center">
            <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="bg-transparent text-4xl font-bold text-white text-center w-32 focus:outline-none"
            />
            <span className="text-sm text-slate-400">{unit} (Bar: {barWeight})</span>
        </div>
        <button 
            onClick={() => setWeight(weight + (isKg ? 2.5 : 5))}
            className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center text-2xl font-bold"
        >+</button>
      </div>

      {/* Visual Bar */}
      <div className="relative h-40 flex items-center justify-center mb-4 bg-slate-900/50 rounded-xl overflow-hidden">
        {/* Barbell Shaft */}
        <div className="absolute w-full h-4 bg-slate-400 z-0"></div>
        
        {/* Center marker */}
        <div className="absolute w-full h-full flex justify-center items-center pointer-events-none">
            
             {/* Left Side Plates (Reversed) */}
             <div className="flex items-center flex-row-reverse mr-1">
                {plates.map((p, i) => (
                    <div key={`l-${i}`} className={`w-3 mx-[1px] rounded-sm border-r border-slate-900/20 ${getVisualColor(p)} ${getPlateHeight(p)}`}></div>
                ))}
                {/* Collar */}
                <div className="w-4 h-8 bg-slate-300 mx-1 rounded"></div>
            </div>

            {/* Center Gap */}
            <div className="w-20"></div>

            {/* Right Side Plates */}
            <div className="flex items-center ml-1">
                {/* Collar */}
                <div className="w-4 h-8 bg-slate-300 mx-1 rounded"></div>
                {plates.map((p, i) => (
                    <div key={`r-${i}`} className={`w-3 mx-[1px] rounded-sm border-r border-slate-900/20 ${getVisualColor(p)} ${getPlateHeight(p)}`}></div>
                ))}
            </div>
        </div>
      </div>

      {inventory && <div className="text-xs text-slate-500 text-center mb-2">Using Custom Inventory</div>}

      <div className="text-center">
        <p className="text-slate-400 text-sm mb-2">Per Side:</p>
        <div className="flex flex-wrap justify-center gap-2">
            {plates.length > 0 ? plates.map((p, i) => (
                <span key={i} className={`px-2 py-1 rounded text-xs font-mono font-bold border ${getPlateColor(p, unit as 'lbs' | 'kg')}`}>
                    {p}
                </span>
            )) : <span className="text-slate-600 italic">Empty Bar</span>}
        </div>
      </div>
    </div>
  );
};
