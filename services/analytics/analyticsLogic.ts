
import { LiftType, WorkoutSession } from '../../types';

export const getStrengthLevel = (lift: LiftType, weight: number, bw: number) => {
    if (!bw || bw === 0) return { level: 'Unknown', ratio: 0, progress: 0, nextTarget: 0, color: 'text-slate-500' };
    
    const ratios: Record<string, number[]> = {
        [LiftType.Squat]: [0.75, 1.0, 1.5, 2.0, 2.5],
        [LiftType.Bench]: [0.5, 0.75, 1.0, 1.5, 2.0],
        [LiftType.Deadlift]: [1.0, 1.25, 1.75, 2.25, 2.75],
        [LiftType.Overhead]: [0.35, 0.5, 0.7, 0.9, 1.15]
    };
    
    const ratio = weight / bw;
    const levels = ['Untrained', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
    const standards = ratios[lift] || [0,0,0,0,0];
    
    let levelIndex = 0;
    while(levelIndex < 5 && ratio >= standards[levelIndex]) {
        levelIndex++;
    }
    
    const prev = levelIndex === 0 ? 0 : standards[levelIndex-1];
    const next = levelIndex === 5 ? standards[4] * 1.2 : standards[levelIndex];
    
    // Calculate percentage progress to next level
    const percent = ((ratio - prev) / (next - prev)) * 100;
    
    return { 
        level: levels[levelIndex], 
        ratio: ratio.toFixed(2), 
        nextTarget: Math.round(next * bw), 
        progress: Math.min(100, Math.max(0, percent)),
        color: ['text-slate-500', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-amber-400', 'text-red-500'][levelIndex]
    };
};

export const prepareEst1RMData = (history: WorkoutSession[], lift: LiftType) => {
    const relevantSessions = history.filter(s => 
        s.exercises.some(ex => ex.name === lift && ex.type === 'Main')
    );
    return relevantSessions.map(s => {
        const mainExercise = s.exercises.find(ex => ex.name === lift && ex.type === 'Main');
        if (!mainExercise) return null;
        let maxEst = 0;
        mainExercise.sets.forEach(set => {
            if (set.completed) {
                const est = set.weight * (1 + (set.actualReps || set.reps) / 30);
                if (est > maxEst) maxEst = est;
            }
        });
        return {
            date: s.date.split('/').slice(0,2).join('/'),
            est1RM: Math.round(maxEst),
        };
    }).filter(Boolean);
};

export const prepareVolumeData = (history: WorkoutSession[]) => {
    const volumeByWeek: Record<string, number> = {};
    history.forEach(s => {
        const weekKey = `C${s.cycle}W${s.week}`;
        let vol = 0;
        s.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                if(set.completed) vol += (set.weight * (set.actualReps || set.reps));
            });
        });
        volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + vol;
    });
    return Object.entries(volumeByWeek).map(([week, vol]) => ({ week, volume: vol }));
};

export const calculatePRs = (history: WorkoutSession[], lift: LiftType) => {
    const records = { 1: { weight: 0, date: '-' }, 3: { weight: 0, date: '-' }, 5: { weight: 0, date: '-' }, 10: { weight: 0, date: '-' } };
    history.forEach(session => {
        if (session.lift !== lift) return;
        session.exercises.forEach(ex => {
            if (ex.type === 'Main') {
                ex.sets.forEach(set => {
                    if (set.completed) {
                        const reps = set.actualReps || set.reps;
                        const weight = set.weight;
                        if (weight > records[1].weight) records[1] = { weight, date: session.date };
                        if (reps >= 3 && weight > records[3].weight) records[3] = { weight, date: session.date };
                        if (reps >= 5 && weight > records[5].weight) records[5] = { weight, date: session.date };
                        if (reps >= 10 && weight > records[10].weight) records[10] = { weight, date: session.date };
                    }
                });
            }
        });
    });
    return records;
};
