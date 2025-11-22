
import { UserProfile } from '../types';

export const getNextTrainingDate = (profile: UserProfile, offset: number, language: string = 'en'): string => {
    const trainingDays = (profile.trainingDays && profile.trainingDays.length > 0) 
        ? profile.trainingDays 
        : [1, 3, 5]; // Default Mon, Wed, Fri
    
    const today = new Date();
    const sortedDays = [...trainingDays].sort();
    
    let daysToCheck = 0;
    let scheduleHits = 0;
    
    // Look ahead up to 14 days to find the next training slots
    while (daysToCheck < 14) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() + daysToCheck);
        const dayOfWeek = checkDate.getDay(); // 0 (Sun) - 6 (Sat)
        
        if (sortedDays.includes(dayOfWeek)) {
            // If offset is 0, we want the very next workout (which could be today)
            if (daysToCheck === 0 && offset === 0) {
                return "Today";
            }
            
            // If we've skipped 'offset' number of valid training days, this is the one
            if (scheduleHits === offset) {
                if (daysToCheck === 0) return "Today";
                if (daysToCheck === 1) return "Tomorrow";
                return checkDate.toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' });
            }
            scheduleHits++;
        }
        daysToCheck++;
    }
    
    return "Soon";
};
