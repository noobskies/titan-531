
import { WorkoutSession } from '../types';

export const generateWorkoutSummary = (session: WorkoutSession): string => {
    const lines = [
        `🏋️ Titan 531 Log`,
        `${session.title} - ${session.date}`,
        `Duration: ${Math.floor(session.durationSeconds / 60)}m`,
        '',
    ];

    if (session.type === 'Conditioning' && session.conditioningData) {
        const cd = session.conditioningData;
        lines.push(`Activity: ${cd.activity}`);
        lines.push(`Intensity: ${cd.intensity}`);
        if (cd.distance) lines.push(`Distance: ${cd.distance} ${cd.distanceUnit}`);
    } else {
        session.exercises.forEach(ex => {
            // Only show exercises that have at least one completed set or are marked completed
            if (ex.completed || ex.sets.some(s => s.completed)) {
                lines.push(`▪️ ${ex.name}`);
                ex.sets.forEach((set, i) => {
                    if (set.completed) {
                        const rpeText = set.rpe ? ` @ RPE ${set.rpe}` : '';
                        const amrapText = set.isAmrap ? ' (AMRAP)' : '';
                        const reps = set.actualReps || set.reps;
                        lines.push(`   Set ${i+1}: ${set.weight} x ${reps}${amrapText}${rpeText}`);
                    }
                });
                lines.push('');
            }
        });
    }

    if (session.notes) {
        lines.push(`📝 Notes: ${session.notes}`);
    }

    return lines.join('\n');
};
