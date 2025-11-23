import { useState, useEffect, useCallback, useRef } from "react";

export function useRestTimer(defaultDuration: number = 60) {
  const [remaining, setRemaining] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback((duration?: number) => {
    if (duration !== undefined) {
      setRemaining(duration);
    }
    setIsRunning(true);
    setIsComplete(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resume = useCallback(() => {
    if (remaining > 0) {
      start();
    }
  }, [remaining, start]);

  const reset = useCallback(() => {
    pause();
    setRemaining(defaultDuration);
    setIsComplete(false);
  }, [defaultDuration, pause]);

  const addTime = useCallback((seconds: number) => {
    setRemaining((prev) => Math.max(0, prev + seconds));
  }, []);

  return {
    remaining,
    isRunning,
    isComplete,
    start,
    pause,
    resume,
    reset,
    addTime,
  };
}
