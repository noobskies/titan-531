
import { UserProfile, WorkoutSession, LiftType } from '../../types';

export const checkAchievements = (profile: UserProfile, history: WorkoutSession[]): { updatedAchievements: string[], newUnlockId: string | null } => {
    const relevantHistory = history.filter(h => h.profileId === profile.id || (!h.profileId && profile.id === 'root'));
    const unlocked = new Set(profile.achievements || []);
    let newUnlockId: string | null = null;

    // Helper to unlock
    const tryUnlock = (id: string, condition: boolean) => {
        if (!unlocked.has(id) && condition) {
            unlocked.add(id);
            newUnlockId = id; // Only tracks the last one if multiple unlock, but good enough
        }
    };

    // 1. Volume/Count Milestones
    tryUnlock('first_blood', relevantHistory.length > 0);
    tryUnlock('consistency', relevantHistory.length >= 10);
    tryUnlock('committed', relevantHistory.length >= 50);
    tryUnlock('cycle_complete', profile.currentCycle > 1);

    // 2. Strength Standards
    const isMetric = profile.unit === 'kg';
    const squatThresh = isMetric ? 100 : 225;
    const benchThresh = isMetric ? 60 : 135;
    const deadThresh = isMetric ? 140 : 315;
    const totalThresh = isMetric ? 450 : 1000;

    tryUnlock('squat_225', profile.oneRepMaxes[LiftType.Squat] >= squatThresh);
    tryUnlock('bench_135', profile.oneRepMaxes[LiftType.Bench] >= benchThresh);
    tryUnlock('deadlift_315', profile.oneRepMaxes[LiftType.Deadlift] >= deadThresh);
    
    const total = Object.values(profile.oneRepMaxes).reduce((a,b) => a+b, 0);
    tryUnlock('heavy_hitter', total >= totalThresh);

    return {
        updatedAchievements: Array.from(unlocked),
        newUnlockId
    };
};
