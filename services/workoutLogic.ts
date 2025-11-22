
import { UserProfile, LiftType, WorkoutSession, SetData, Exercise } from '../types';
import { WEEK_MULTIPLIERS, WEEK_REPS, WARMUP_SETS, DEFAULT_ASSISTANCE, DEFAULT_ASSISTANCE_SETTINGS } from '../constants';

export const calculateWeight = (tm: number, percent: number, rounding: number = 5) => {
  if (!tm || !percent) return 0;
  return Math.round((tm * percent) / rounding) * rounding;
};

export const calculateInitialTMs = (oneRepMaxes: Record<LiftType, number>): Record<LiftType, number> => {
    return {
      [LiftType.Squat]: Math.round(oneRepMaxes[LiftType.Squat] * 0.9),
      [LiftType.Bench]: Math.round(oneRepMaxes[LiftType.Bench] * 0.9),
      [LiftType.Deadlift]: Math.round(oneRepMaxes[LiftType.Deadlift] * 0.9),
      [LiftType.Overhead]: Math.round(oneRepMaxes[LiftType.Overhead] * 0.9),
    };
};

export const getLastUsedWeight = (history: WorkoutSession[], exerciseName: string): number => {
  // Search backwards through history
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    if (!session.exercises) continue;
    
    const ex = session.exercises.find(e => e.name === exerciseName);
    if (ex) {
      // Find the last completed set with weight > 0
      const validSets = [...ex.sets].reverse().filter(s => s.completed && s.weight > 0);
      if (validSets.length > 0) {
        return validSets[0].weight;
      }
    }
  }
  return 0;
};

export const generateWorkout = (profile: UserProfile, lift: LiftType, history: WorkoutSession[]): WorkoutSession => {
  const { trainingMaxes, currentCycle, currentWeek, selectedProgram, rounding } = profile;
  const tm = trainingMaxes[lift];
  
  // Use custom percentages/reps if available (Premium feature)
  const percentages = profile.customPercentages?.[currentWeek] || WEEK_MULTIPLIERS[currentWeek];
  const reps = profile.customReps?.[currentWeek] || WEEK_REPS[currentWeek];

  // 1. Warmup Sets
  const warmupsToUse = profile.warmupSettings || WARMUP_SETS;
  const warmupSets: SetData[] = warmupsToUse.map(set => {
    const pct = set.percentage || (set as any).percent || 0.4;
    return {
        reps: set.reps,
        weight: calculateWeight(tm, pct, rounding),
        completed: false,
        isAmrap: false,
        isWarmup: true,
        actualReps: set.reps
    };
  });

  // 2. Main Lifts
  const mainSets: SetData[] = percentages.map((pct, idx) => ({
    reps: reps[idx],
    weight: calculateWeight(tm, pct, rounding),
    completed: false,
    isAmrap: currentWeek === 3 && idx === 2,
    isWarmup: false,
    actualReps: reps[idx]
  }));

  const exercises: Exercise[] = [];

  exercises.push({
    id: `main-${Date.now()}`,
    name: lift,
    type: 'Main',
    sets: [...warmupSets, ...mainSets],
    completed: false
  });

  // 3. Supplemental Work
  if (selectedProgram === 'BBB') {
    const bbbWeight = calculateWeight(tm, 0.5, rounding);
    exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (BBB)`,
        type: 'Supplemental',
        sets: Array(5).fill(null).map(() => ({ reps: 10, weight: bbbWeight, completed: false, isAmrap: false, actualReps: 10 })),
        completed: false
    });
  } else if (selectedProgram === 'Monolith') {
    const fslWeight = calculateWeight(tm, percentages[0], rounding);
    const setCounts = lift === LiftType.Deadlift ? 3 : 5;
    
    exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (FSL)`,
        type: 'Supplemental',
        sets: Array(setCounts).fill(null).map(() => ({ reps: 5, weight: fslWeight, completed: false, isAmrap: false, actualReps: 5 })),
        completed: false
    });
  } else if (selectedProgram === 'Beginner' || selectedProgram === 'FSL') {
     const fslWeight = calculateWeight(tm, percentages[0], rounding);
     exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (FSL)`,
        type: 'Supplemental',
        sets: Array(5).fill(null).map(() => ({ reps: 5, weight: fslWeight, completed: false, isAmrap: false, actualReps: 5 })),
        completed: false
    });
  } else if (selectedProgram === 'BBS') {
     const fslWeight = calculateWeight(tm, percentages[0], rounding);
     exercises.push({
        id: `supp-${Date.now()}`,
        name: `${lift} (BBS)`,
        type: 'Supplemental',
        sets: Array(10).fill(null).map(() => ({ reps: 5, weight: fslWeight, completed: false, isAmrap: false, actualReps: 5 })),
        completed: false
    });
  }

  // 4. Assistance Work
  const assistanceMap = profile.customAssistance || DEFAULT_ASSISTANCE;
  let assistanceCount = (selectedProgram === 'Original' || selectedProgram === 'BBS') ? 2 : 1; 
  if (selectedProgram === 'Monolith') assistanceCount = 3;

  const selectedAssistance = (assistanceMap[lift] || []).slice(0, Math.max(assistanceCount, assistanceMap[lift]?.length || 0));
  const asstSets = profile.assistanceSettings?.sets || DEFAULT_ASSISTANCE_SETTINGS.sets;
  const asstReps = profile.assistanceSettings?.reps || DEFAULT_ASSISTANCE_SETTINGS.reps;

  selectedAssistance.forEach((asstName, i) => {
      const lastWeight = getLastUsedWeight(history, asstName);
      exercises.push({
        id: `asst-${Date.now()}-${i}`,
        name: asstName,
        type: 'Assistance',
        sets: Array(asstSets).fill(null).map(() => ({ 
            reps: asstReps, 
            weight: lastWeight, 
            completed: false, 
            isAmrap: false, 
            actualReps: asstReps 
        })),
        completed: false
      });
  });

  return {
    id: `wo-${Date.now()}`,
    date: new Date().toLocaleDateString(),
    title: `C${currentCycle} W${currentWeek} - ${lift}`,
    cycle: currentCycle,
    week: currentWeek,
    lift: lift,
    type: 'Strength',
    exercises: exercises,
    completed: false,
    durationSeconds: 0,
    programType: selectedProgram,
    profileId: profile.id
  };
};
