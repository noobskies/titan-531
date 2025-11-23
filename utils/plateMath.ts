
import { PLATES_LBS, PLATES_KG, BAR_WEIGHT_LBS, BAR_WEIGHT_KG } from '../constants';

export const calculatePlates = (
    targetWeight: number, 
    unit: 'lbs' | 'kg', 
    customBarWeight?: number, 
    inventory?: Record<number, number>
): number[] => {
    const isKg = unit === 'kg';
    // If inventory provided, extract keys as available plates, otherwise default list
    const platesList = inventory 
      ? Object.keys(inventory).map(Number).sort((a,b) => b-a) 
      : (isKg ? PLATES_KG : PLATES_LBS);
  
    const barWeight = customBarWeight !== undefined ? customBarWeight : (isKg ? BAR_WEIGHT_KG : BAR_WEIGHT_LBS);
  
    let remaining = (targetWeight - barWeight) / 2;
    const plates: number[] = [];
    
    if (remaining < 0) return [];
  
    // Clone inventory counts to track usage
    const available = inventory ? { ...inventory } : null;
  
    platesList.forEach(plate => {
      // If unlimited (no inventory prop), loop while fits
      // If limited, check count > 0
      while (remaining >= plate) {
        // Floating point precision fix for metric (e.g. 1.25)
        if (available) {
            // Need 2 plates (one per side)
            if ((available[plate] ?? 0) >= 2) {
                plates.push(plate);
                remaining = Math.round((remaining - plate) * 100) / 100;
                available[plate] -= 2;
            } else {
                break; // Cannot use this plate anymore
            }
        } else {
            plates.push(plate);
            remaining = Math.round((remaining - plate) * 100) / 100;
        }
      }
    });
  
    return plates;
};

export const getPlateColor = (p: number, unit: 'lbs' | 'kg') => {
    const isKg = unit === 'kg';
    if (isKg) {
        if (p >= 25) return 'bg-red-600 border-red-700 text-white';
        if (p === 20) return 'bg-blue-600 border-blue-700 text-white';
        if (p === 15) return 'bg-yellow-500 border-yellow-600 text-black';
        if (p === 10) return 'bg-green-600 border-green-700 text-white';
        if (p === 5) return 'bg-white border-slate-300 text-black';
        return 'bg-slate-400 border-slate-500 text-black';
    } else {
        if (p >= 45) return 'bg-blue-600 border-blue-700 text-white'; 
        if (p === 35) return 'bg-yellow-500 border-yellow-600 text-black';
        if (p === 25) return 'bg-green-600 border-green-700 text-white';
        if (p === 10) return 'bg-white border-slate-300 text-black';
        if (p === 5) return 'bg-slate-400 border-slate-500 text-black';
        return 'bg-slate-300 border-slate-400 text-black';
    }
};

// Returns Tailwind height class based on plate size (legacy bar support)
export const getPlateHeight = (p: number, unit: 'lbs' | 'kg') => {
    const isKg = unit === 'kg';
    if (isKg) {
        if (p >= 20) return 'h-8';
        if (p === 15) return 'h-7';
        if (p === 10) return 'h-6';
        if (p === 5) return 'h-4';
        return 'h-3';
    } else {
        if (p >= 45) return 'h-8';
        if (p === 35) return 'h-7';
        if (p === 25) return 'h-6';
        if (p === 10) return 'h-4';
        return 'h-3';
    }
};

// New helper for circular plate dimensions in active workout view
export const getPlateCircleSize = (p: number, unit: 'lbs' | 'kg') => {
    const isKg = unit === 'kg';
    if (isKg) {
        if (p >= 20) return 'w-10 h-10 text-[10px]'; // 20kg, 25kg
        if (p >= 10) return 'w-8 h-8 text-[9px]'; // 10kg, 15kg
        if (p >= 5) return 'w-6 h-6 text-[8px]'; // 5kg
        return 'w-5 h-5 text-[7px]'; // small
    } else {
        if (p >= 45) return 'w-10 h-10 text-[10px]';
        if (p >= 25) return 'w-8 h-8 text-[9px]';
        if (p >= 10) return 'w-7 h-7 text-[8px]';
        return 'w-5 h-5 text-[7px]';
    }
};
