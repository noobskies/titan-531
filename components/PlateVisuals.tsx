
import React from 'react';
import { calculatePlates, getPlateColor, getPlateHeight, getPlateCircleSize } from '../utils/plateMath';

interface PlateStackProps {
  weight: number;
  unit: 'lbs' | 'kg';
  inventory?: Record<number, number>;
}

export const PlateStack: React.FC<PlateStackProps> = ({ weight, unit, inventory }) => {
  const plates = calculatePlates(weight, unit, undefined, inventory);
  
  if (plates.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
        {plates.map((p, i) => (
            <div 
                key={i} 
                className={`rounded-full flex items-center justify-center border shadow-sm font-bold ${getPlateColor(p, unit)} ${getPlateCircleSize(p, unit)}`}
                title={`${p}${unit}`}
            >
                {p}
            </div>
        ))}
    </div>
  );
};

interface BarbellVisualProps {
  weight: number;
  unit: 'lbs' | 'kg';
  barWeight: number;
  inventory?: Record<number, number>;
}

export const BarbellVisual: React.FC<BarbellVisualProps> = ({ weight, unit, barWeight, inventory }) => {
  const plates = calculatePlates(weight, unit, barWeight, inventory);
  const isKg = unit === 'kg';

  // Map utility color class to simplified bg for the bar visual
  const getVisualColor = (p: number) => {
      const colorClass = getPlateColor(p, unit);
      return colorClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-600';
  };

  return (
      <div className="relative h-40 flex items-center justify-center mb-4 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
        {/* Barbell Shaft */}
        <div className="absolute w-full h-4 bg-slate-400 z-0 shadow-inner"></div>
        
        {/* Center marker */}
        <div className="absolute w-full h-full flex justify-center items-center pointer-events-none">
             {/* Left Side Plates (Reversed) */}
             <div className="flex items-center flex-row-reverse mr-1">
                {plates.map((p, i) => (
                    <div key={`l-${i}`} className={`w-3 mx-[1px] rounded-sm border-r border-slate-900/20 shadow-sm ${getVisualColor(p)} ${getPlateHeight(p, unit)}`}></div>
                ))}
                {/* Collar */}
                <div className="w-4 h-8 bg-slate-300 mx-1 rounded shadow-lg"></div>
            </div>

            {/* Center Gap */}
            <div className="w-20"></div>

            {/* Right Side Plates */}
            <div className="flex items-center ml-1">
                {/* Collar */}
                <div className="w-4 h-8 bg-slate-300 mx-1 rounded shadow-lg"></div>
                {plates.map((p, i) => (
                    <div key={`r-${i}`} className={`w-3 mx-[1px] rounded-sm border-r border-slate-900/20 shadow-sm ${getVisualColor(p)} ${getPlateHeight(p, unit)}`}></div>
                ))}
            </div>
        </div>
      </div>
  );
};
