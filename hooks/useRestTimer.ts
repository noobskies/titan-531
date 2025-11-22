
import { useState, useEffect, useRef } from 'react';
import { speak, playBeep } from '../services/audioService';

interface UseRestTimerProps {
    defaultTime: number;
    soundEnabled: boolean;
    voiceEnabled: boolean;
    onComplete?: () => void;
}

export const useRestTimer = ({ defaultTime, soundEnabled, voiceEnabled, onComplete }: UseRestTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(defaultTime);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    const start = (duration?: number) => {
        if (duration) setTimeLeft(duration);
        setIsRunning(true);
    };

    const stop = () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const adjust = (delta: number) => {
        setTimeLeft(prev => Math.max(0, prev + delta));
    };

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    const nextTime = prev - 1;
                    
                    if (voiceEnabled) {
                        if (nextTime === 30) speak("30 seconds remaining");
                        if (nextTime === 10) speak("10 seconds");
                        if (nextTime <= 3 && nextTime > 0) speak(nextTime.toString());
                        if (nextTime === 0) speak("Begin set");
                    }

                    if (nextTime <= 0) {
                        setIsRunning(false);
                        if (soundEnabled) playBeep();
                        if (onComplete) onComplete();
                        return 0;
                    }
                    return nextTime;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft, voiceEnabled, soundEnabled, onComplete]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
        timeLeft,
        isRunning,
        start,
        stop,
        adjust,
        formatTime,
        setIsRunning
    };
};
