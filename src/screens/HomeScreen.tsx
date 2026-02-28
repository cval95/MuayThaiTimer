import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutConfig } from '../types';
import { defaultWorkoutConfig } from '../utils/workoutBuilder';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeNavProp = StackNavigationProp<RootStackParamList>;

const SAVED_KEY = 'savedWorkouts';

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const [recent, setRecent] = useState<WorkoutConfig[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // Reload when screen is focused
  useEffect(() => {
    return navigation.addListener('focus', loadRecent);
  }, [navigation, loadRecent]);

  const quickStart = () => {
    const config = recent.length > 0 ? recent[0] : defaultWorkoutConfig();
    navigation.navigate('ActiveWorkout', { config });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  title: {
    color: '#EF4444',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 12,
    marginTop: -6,
  },
  tagline: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
  quickStartBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  newBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  recentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  recentName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  recentMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
  catalogBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  catalogBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
