
import React, { useState } from 'react';
import { PLATES_LBS, PLATES_KG, BAR_WEIGHT_LBS, BAR_WEIGHT_KG } from '../../constants';
import { calculatePlates, getPlateColor } from '../../utils/plateMath';
import { BarbellVisual } from '../../components/PlateVisuals';

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

      {/* Visual Bar Component */}
      <BarbellVisual weight={weight} unit={unit as 'lbs' | 'kg'} barWeight={barWeight} inventory={inventory} />

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
