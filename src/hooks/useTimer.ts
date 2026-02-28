import { useRef, useState, useCallback, useEffect } from 'react';

interface TimerState {
  remaining: number;
  isRunning: boolean;
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useTimer(onComplete: () => void): TimerState {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = useCallback(() => {
    remainingRef.current -= 1;
    setRemaining(remainingRef.current);
    if (remainingRef.current <= 0) {
      clear();
      setIsRunning(false);
      onCompleteRef.current();
    }
  }, []);

  const start = useCallback((duration: number) => {
    clear();
    remainingRef.current = duration;
    setRemaining(duration);
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (remainingRef.current > 0) {
      setIsRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [tick]);

  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    remainingRef.current = 0;
    setRemaining(0);
  }, []);

  useEffect(() => () => clear(), []);

  return { remaining, isRunning, start, pause, resume, reset };
}
