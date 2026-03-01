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

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user, signOut } = useAuth();
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

  // Reload when screen gains focus or auth state changes
  useEffect(() => {
    return navigation.addListener('focus', loadRecent);
  }, [navigation, loadRecent]);

  useEffect(() => {
    loadRecent();
  }, [user]);

  const quickStart = () => {
    const config = recent.length > 0 ? recent[0] : defaultWorkoutConfig();
    navigation.navigate('ActiveWorkout', { config });
  };

  const initials = user?.email ? user.email[0].toUpperCase() : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Auth header */}
      <View style={styles.authRow}>
        {user ? (
          <View style={styles.authRowInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.authEmail} numberOfLines={1}>{user.email}</Text>
            <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInLinkText}>Sign In / Create Account</Text>
          </TouchableOpacity>
        )}
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

      {/* Save history nudge — shown only when not signed in */}
      {!user && (
        <TouchableOpacity
          style={styles.nudgeBanner}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.nudgeText}>
            📲  Sign up free to save your workout history across devices
          </Text>
        </TouchableOpacity>
      )}

      {/* Recent Workouts */}
      {recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recent.slice(0, 3).map((cfg) => (
            <TouchableOpacity
              key={cfg.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('ActiveWorkout', { config: cfg })}
            >
              <Text style={styles.recentName}>{cfg.name}</Text>
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
  authRow: {
    marginBottom: SPACING.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  authRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  authEmail: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  signOutBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  signInLink: {
    alignSelf: 'flex-end',
  },
  signInLinkText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  nudgeBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nudgeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
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
  recentName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
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
