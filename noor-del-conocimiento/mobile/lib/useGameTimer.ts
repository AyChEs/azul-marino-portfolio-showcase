import { useEffect, useRef, useState, useCallback } from "react";

interface UseGameTimerOptions {
  initialTime: number;
  onTimeOut: () => void;
  isPaused: boolean;
  isActive: boolean;
}

export function useGameTimer({ initialTime, onTimeOut, isPaused, isActive }: UseGameTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(initialTime);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;
  }, [initialTime]);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft((t) => {
      const next = t + seconds;
      timeLeftRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isActive || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && isActive && !isPaused) {
      onTimeOut();
    }
  }, [timeLeft, isActive, isPaused, onTimeOut]);

  return {
    timeLeft,
    timeLeftRef,
    resetTimer,
    addTime,
  };
}
