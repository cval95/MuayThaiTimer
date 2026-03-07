import React, { useCallback, useEffect, useState } from 'react';
import {
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

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuth();
  const { loadWorkouts } = useWorkoutSync();
  const [recent, setRecent] = useState<WorkoutConfig[]>([]);

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
    padding: 16,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.surfaceAlt,
  },
  newBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
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
});
