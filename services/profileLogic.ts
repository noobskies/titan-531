
import { UserProfile, WorkoutSession, LiftType } from '../types';
import { checkAchievements } from './achievementLogic';

export const updateMaxesFromSession = (currentMaxes: Record<LiftType, number>, session: WorkoutSession): { newMaxes: Record<LiftType, number>, changed: boolean } => {
    let updatedMaxes = { ...currentMaxes };
    let maxesChanged = false;

    if (session.type !== 'Strength' || !session.lift || session.lift === 'Conditioning') return { newMaxes: updatedMaxes, changed: false };

    const lift = session.lift as LiftType;

    // Check main lifts for PRs
    session.exercises.forEach(ex => {
        if (ex.type === 'Main' && ex.name === lift) {
            ex.sets.forEach(set => {
                if (set.completed) {
                    const est = Math.round(set.weight * (1 + (set.actualReps || set.reps) / 30));
                    if (est > updatedMaxes[lift]) {
                        updatedMaxes[lift] = est;
                        maxesChanged = true;
                    }
                }
            });
        }
    });

    return { newMaxes: updatedMaxes, changed: maxesChanged };
};

export const processFinishedSession = (profile: UserProfile, history: WorkoutSession[], session: WorkoutSession) => {
    // 1. Update History
    const sessionWithProfileId = { ...session, profileId: profile.id };
    const updatedHistory = [...history, sessionWithProfileId];

    // 2. Update Maxes
    const { newMaxes, changed } = updateMaxesFromSession(profile.oneRepMaxes, session);
    let updatedProfile = changed ? { ...profile, oneRepMaxes: newMaxes } : profile;

    // 3. Check Achievements
    const { updatedAchievements, newUnlockId } = checkAchievements(updatedProfile, updatedHistory);
    if (newUnlockId) {
        updatedProfile = { ...updatedProfile, achievements: updatedAchievements };
    }

    return { updatedProfile, updatedHistory, newUnlockId };
};
