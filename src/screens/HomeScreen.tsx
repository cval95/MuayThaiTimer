import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutConfig } from '../types';
import { defaultWorkoutConfig } from '../utils/workoutBuilder';
import { FREESTYLE_COMBO } from '../data/combos';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { useWorkoutSync } from '../hooks/useWorkoutSync';

type HomeNavProp = StackNavigationProp<RootStackParamList>;

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function Stepper({ label, value, onDec, onInc, display }: {
  label: string; value: number; onDec: () => void; onInc: () => void; display: string;
}) {
  return (
    <View style={stepperStyles.row}>
      <Text style={stepperStyles.label}>{label}</Text>
      <View style={stepperStyles.controls}>
        <TouchableOpacity style={stepperStyles.btn} onPress={onDec}>
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={stepperStyles.value}>{display}</Text>
        <TouchableOpacity style={stepperStyles.btn} onPress={onInc}>
          <Text style={stepperStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  label: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '300' },
  value: { color: COLORS.accent, fontSize: 18, fontWeight: '700', minWidth: 52, textAlign: 'center' },
});

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuth();
  const { loadWorkouts } = useWorkoutSync();
  const [recent, setRecent] = useState<WorkoutConfig[]>([]);
  const [timerModal, setTimerModal] = useState(false);
  const [qtRounds, setQtRounds] = useState(5);
  const [qtRoundMin, setQtRoundMin] = useState(3);
  const [qtRestSec, setQtRestSec] = useState(60);

  const loadRecent = useCallback(async () => {
    try {
      const workouts = await loadWorkouts();
      setRecent(workouts);
    } catch (_) {}
  }, [loadWorkouts]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    return navigation.addListener('focus', loadRecent);
  }, [navigation, loadRecent]);

  const quickStart = () => {
    const config = recent.length > 0 ? recent[0] : defaultWorkoutConfig();
    navigation.navigate('ActiveWorkout', { config });
  };

  const startQuickTimer = () => {
    const roundDuration = qtRoundMin * 60;
    const config: WorkoutConfig = {
      id: Date.now().toString(),
      name: 'Quick Timer',
      roundCount: qtRounds,
      roundDuration,
      restDuration: qtRestSec,
      prepDuration: 10,
      selectedCategories: [],
      roundPlans: Array.from({ length: qtRounds }, (_, i) => ({
        roundNumber: i + 1,
        combo: FREESTYLE_COMBO,
      })),
      autoAssign: false,
    };
    setTimerModal(false);
    navigation.navigate('ActiveWorkout', { config });
  };

  const initials = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account row — user is always authenticated here */}
      <View style={styles.accountRow}>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
        <Text style={styles.accountEmail} numberOfLines={1}>{user?.email}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
          <Text style={styles.profileBtnText}>Account ›</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MUAY THAI</Text>
        <Text style={styles.subtitle}>TIMER</Text>
        <Text style={styles.tagline}>Train smart. Hit harder.</Text>
      </View>

      {/* Quick Start */}
      <TouchableOpacity style={styles.quickStartBtn} onPress={quickStart}>
        <Text style={styles.quickStartText}>⚡ QUICK START</Text>
      </TouchableOpacity>

      {/* New Workout */}
      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => navigation.navigate('WorkoutSetup')}
      >
        <Text style={styles.newBtnText}>+ New Workout</Text>
      </TouchableOpacity>

      {/* Quick Timer */}
      <TouchableOpacity style={styles.timerBtn} onPress={() => setTimerModal(true)}>
        <Text style={styles.timerBtnText}>Quick Timer</Text>
      </TouchableOpacity>

      {/* Quick Timer Modal */}
      <Modal visible={timerModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTimerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick Timer</Text>
            <TouchableOpacity onPress={() => setTimerModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Stepper
              label="Rounds"
              value={qtRounds}
              display={`${qtRounds}`}
              onDec={() => setQtRounds(r => Math.max(1, r - 1))}
              onInc={() => setQtRounds(r => Math.min(20, r + 1))}
            />
            <Stepper
              label="Round time"
              value={qtRoundMin}
              display={`${qtRoundMin} min`}
              onDec={() => setQtRoundMin(m => Math.max(1, m - 1))}
              onInc={() => setQtRoundMin(m => Math.min(10, m + 1))}
            />
            <Stepper
              label="Rest"
              value={qtRestSec}
              display={`${qtRestSec}s`}
              onDec={() => setQtRestSec(s => Math.max(15, s - 15))}
              onInc={() => setQtRestSec(s => Math.min(120, s + 15))}
            />
          </View>
          <TouchableOpacity style={styles.modalStartBtn} onPress={startQuickTimer}>
            <Text style={styles.modalStartBtnText}>START</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Recent Workouts */}
      {recent.filter(w => w.completedAt).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recent.filter(w => w.completedAt).slice(0, 3).map((cfg) => (
            <TouchableOpacity
              key={cfg.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('ActiveWorkout', { config: cfg })}
            >
              <View style={styles.recentHeader}>
                <Text style={styles.recentName}>{cfg.name}</Text>
                <Text style={styles.recentDate}>{relativeDate(cfg.completedAt!)}</Text>
              </View>
              <Text style={styles.recentMeta}>
                {cfg.roundCount} rounds · {cfg.roundDuration / 60} min · {cfg.restDuration}s rest
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Techniques</Text>
        <TouchableOpacity
          style={styles.catalogBtn}
          onPress={() => (navigation as any).navigate('ComboCatalog')}
        >
          <Text style={styles.catalogBtnText}>📖  Combo Catalog</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  accountEmail: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  profileBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  title: {
    color: COLORS.accent,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
  },
  subtitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 12,
    marginTop: -6,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
  quickStartBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStartText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  newBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  newBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  recentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  recentName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  recentDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  recentMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  catalogBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  catalogBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  timerBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 28,
  },
  timerBtnText: {
    color: COLORS.textDim,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.textDim,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: { color: COLORS.textMuted, fontSize: 20 },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modalStartBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    margin: 20,
  },
  modalStartBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
