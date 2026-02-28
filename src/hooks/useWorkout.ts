import { useCallback, useRef, useState } from 'react';
import { WorkoutConfig, WorkoutPhase, RoundPlan } from '../types';
import { useTimer } from './useTimer';

interface WorkoutState {
  phase: WorkoutPhase;
  currentRound: number;
  totalRounds: number;
  remaining: number;
  isRunning: boolean;
  currentRoundPlan: RoundPlan | null;
  nextRoundPlan: RoundPlan | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
}

export function useWorkout(config: WorkoutConfig): WorkoutState {
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const phaseRef = useRef<WorkoutPhase>('idle');
  const roundRef = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;

  // Use a ref so advance can call timerStartRef.current without a circular dep
  const timerStartRef = useRef<(duration: number) => void>(() => {});
  const timerResetRef = useRef<() => void>(() => {});
  const timerPauseRef = useRef<() => void>(() => {});
  const timerResumeRef = useRef<() => void>(() => {});

  const advance = useCallback(() => {
    const cfg = configRef.current;

    if (phaseRef.current === 'idle') return;

    if (phaseRef.current === 'prep') {
      phaseRef.current = 'round';
      setPhase('round');
      roundRef.current = 1;
      setCurrentRound(1);
      timerStartRef.current(cfg.roundDuration);
      return;
    }

    if (phaseRef.current === 'round') {
      if (roundRef.current >= cfg.roundCount) {
        phaseRef.current = 'complete';
        setPhase('complete');
        return;
      }
      phaseRef.current = 'rest';
      setPhase('rest');
      timerStartRef.current(cfg.restDuration);
      return;
    }

    if (phaseRef.current === 'rest') {
      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;
      setCurrentRound(nextRound);
      phaseRef.current = 'round';
      setPhase('round');
      timerStartRef.current(cfg.roundDuration);
      return;
    }
  }, []);

  const timer = useTimer(advance);

  // Sync timer methods into refs after each render
  timerStartRef.current = timer.start;
  timerResetRef.current = timer.reset;
  timerPauseRef.current = timer.pause;
  timerResumeRef.current = timer.resume;

  const start = useCallback(() => {
    const cfg = configRef.current;
    phaseRef.current = 'prep';
    setPhase('prep');
    roundRef.current = 0;
    setCurrentRound(0);
    timerStartRef.current(cfg.prepDuration);
  }, []);

  const pause = useCallback(() => timerPauseRef.current(), []);
  const resume = useCallback(() => timerResumeRef.current(), []);

  const stop = useCallback(() => {
    timerResetRef.current();
    phaseRef.current = 'idle';
    setPhase('idle');
    roundRef.current = 0;
    setCurrentRound(0);
  }, []);

  const skip = useCallback(() => {
    timerResetRef.current();
    advance();
  }, [advance]);

  const currentRoundPlan =
    currentRound > 0 && currentRound <= config.roundPlans.length
      ? config.roundPlans[currentRound - 1]
      : null;

  const nextRoundPlan =
    currentRound < config.roundPlans.length
      ? config.roundPlans[currentRound]
      : null;

  return {
    phase,
    currentRound,
    totalRounds: config.roundCount,
    remaining: timer.remaining,
    isRunning: timer.isRunning,
    currentRoundPlan,
    nextRoundPlan,
    start,
    pause,
    resume,
    stop,
    skip,
  };
}
