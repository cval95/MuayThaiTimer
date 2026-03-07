import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useWorkout } from '../hooks/useWorkout';
import { TimerRing } from '../components/TimerRing';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loadSounds, unloadSounds, playBellStart, playBellEnd, playBeep } from '../utils/audio';
import { getFocusInfo } from '../data/focuses';
import { COLORS } from '../utils/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ActiveWorkout'>;
  route: RouteProp<RootStackParamList, 'ActiveWorkout'>;
};

const PHASE_COLORS: Record<string, string> = {
  prep: COLORS.phasePrep,
  round: COLORS.phaseRound,
  rest: COLORS.phaseRest,
  complete: COLORS.phaseComplete,
};

export function ActiveWorkoutScreen({ navigation, route }: Props) {
  const { config } = route.params;
  const workout = useWorkout(config);
  const [started, setStarted] = useState(false);
  const prevPhaseRef = useRef(workout.phase);

  // Load sounds on mount, unload on unmount
  useEffect(() => {
    loadSounds();
    return () => { unloadSounds(); };
  }, []);

  // Auto-start when screen mounts
  useEffect(() => {
    if (!started) {
      setStarted(true);
      workout.start();
    }
  }, []);

  // Bell + vibration on phase transitions
  useEffect(() => {
    if (prevPhaseRef.current === workout.phase) return;
    prevPhaseRef.current = workout.phase;
    if (workout.phase === 'round') {
      playBellStart();
      Vibration.vibrate([0, 100, 80, 100]);
    } else if (workout.phase === 'rest') {
      playBellEnd();
      Vibration.vibrate(300);
    }
  }, [workout.phase]);

  // 3-2-1 countdown beeps before each phase ends
  useEffect(() => {
    if (workout.phase !== 'round' && workout.phase !== 'rest' && workout.phase !== 'prep') return;
    if (workout.remaining >= 1 && workout.remaining <= 3) {
      playBeep();
      Vibration.vibrate(40);
    }
  }, [workout.remaining]);

  // Navigate to complete screen when done
  useEffect(() => {
    if (workout.phase === 'complete') {
      navigation.replace('WorkoutComplete', {
        totalRounds: config.roundCount,
        totalTime: config.roundCount * config.roundDuration,
        config,
      });
    }
  }, [workout.phase]);

  const phaseColor = PHASE_COLORS[workout.phase] ?? '#EF4444';
  const ringTotal =
    workout.phase === 'prep'
      ? config.prepDuration
      : workout.phase === 'rest'
      ? config.restDuration
      : config.roundDuration;

  const phaseBanner =
    workout.phase === 'prep'
      ? 'GET READY'
      : workout.phase === 'rest'
      ? 'REST'
      : `ROUND ${workout.currentRound} OF ${workout.totalRounds}`;

  const handleStop = () => {
    Alert.alert('Stop Workout?', 'Your progress will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => {
          workout.stop();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSkip = () => {
    workout.skip();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Phase Banner */}
      <View style={[styles.phaseBanner, { backgroundColor: phaseColor + '22' }]}>
        <Text style={[styles.phaseText, { color: phaseColor }]}>{phaseBanner}</Text>
      </View>
      {config.selectedFocus ? (
        <Text style={styles.focusNote}>{getFocusInfo(config.selectedFocus).contextNote}</Text>
      ) : null}

      {/* Timer Ring */}
      <View style={styles.timerSection}>
        <TimerRing
          remaining={workout.remaining}
          total={ringTotal}
          color={phaseColor}
          size={240}
        />
      </View>

      {/* Combo Display */}
      <View style={styles.comboSection}>
        {workout.phase === 'round' && workout.currentRoundPlan ? (
          <>
            <Text style={styles.comboName}>{workout.currentRoundPlan.combo.name}</Text>
            <Text style={styles.comboTechniques}>
              {workout.currentRoundPlan.combo.techniques
                .map((t) => t.name)
                .join('  →  ')}
            </Text>
            {workout.currentRoundPlan.combo.coachingCue ? (
              <Text style={styles.cue}>
                "{workout.currentRoundPlan.combo.coachingCue}"
              </Text>
            ) : null}
          </>
        ) : workout.phase === 'prep' ? (
          <>
            <Text style={styles.comboName}>Prepare yourself</Text>
            {workout.nextRoundPlan ? (
              <Text style={styles.upNext}>
                Round 1: {workout.nextRoundPlan.combo.name}
              </Text>
            ) : null}
          </>
        ) : workout.phase === 'rest' ? (
          <>
            <Text style={styles.comboName}>Rest &amp; breathe</Text>
            {workout.nextRoundPlan ? (
              <View style={styles.nextRoundPreview}>
                <Text style={styles.nextRoundLabel}>NEXT ROUND</Text>
                <Text style={styles.nextRoundName}>
                  {workout.nextRoundPlan.combo.name}
                </Text>
                <Text style={styles.nextRoundTech}>
                  {workout.nextRoundPlan.combo.techniques
                    .map((t) => t.name)
                    .join(' → ')}
                </Text>
              </View>
            ) : (
              <Text style={styles.upNext}>Last round complete!</Text>
            )}
          </>
        ) : null}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
          <Text style={styles.stopBtnText}>■ STOP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pauseBtn, { borderColor: phaseColor }]}
          onPress={workout.isRunning ? workout.pause : workout.resume}
        >
          <Text style={[styles.pauseBtnText, { color: phaseColor }]}>
            {workout.isRunning ? '⏸ PAUSE' : '▶ RESUME'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipBtnText}>SKIP ▶▶</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  phaseBanner: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
  focusNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  timerSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  comboSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  comboName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  comboTechniques: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  cue: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  upNext: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  nextRoundPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  nextRoundLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  nextRoundName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextRoundTech: {
    color: COLORS.phaseRest,
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
    width: '100%',
  },
  stopBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  stopBtnText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
  pauseBtn: {
    flex: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: COLORS.surface,
  },
  pauseBtnText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  skipBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  skipBtnText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
});
