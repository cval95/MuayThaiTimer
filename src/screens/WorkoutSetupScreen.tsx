import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Category, WorkoutConfig } from '../types';
import { CATEGORIES } from '../data/categories';
import { buildRoundPlans } from '../utils/workoutBuilder';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'WorkoutSetup'>;
};

const ROUND_DURATIONS = [60, 120, 180, 300];
const REST_DURATIONS = [30, 60, 120];
const SAVED_KEY = 'savedWorkouts';

function fmt(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60} min`;
}

export function WorkoutSetupScreen({ navigation }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([
    'boxing', 'kicks', 'combinations',
  ]);
  const [roundCount, setRoundCount] = useState(5);
  const [roundDuration, setRoundDuration] = useState(180);
  const [restDuration, setRestDuration] = useState(60);
  const [autoAssign, setAutoAssign] = useState(true);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const buildConfig = (): WorkoutConfig => {
    const config: WorkoutConfig = {
      id: Date.now().toString(),
      name: `${roundCount}R · ${fmt(roundDuration)} · ${selectedCategories.join(', ')}`,
      roundCount,
      roundDuration,
      restDuration,
      prepDuration: 10,
      selectedCategories,
      roundPlans: [],
      autoAssign,
    };
    if (autoAssign) {
      config.roundPlans = buildRoundPlans(config);
    }
    return config;
  };

  const saveAndStart = async (config: WorkoutConfig) => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const saved: WorkoutConfig[] = raw ? JSON.parse(raw) : [];
      const updated = [config, ...saved].slice(0, 10);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch (_) {}
    navigation.navigate('ActiveWorkout', { config });
  };

  const handleStart = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Select at least one focus area');
      return;
    }
    const config = buildConfig();
    if (!autoAssign) {
      navigation.navigate('RoundPlanner', { config });
    } else {
      saveAndStart(config);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Focus Areas */}
      <Text style={styles.sectionLabel}>FOCUS AREAS</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => {
          const selected = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catCard,
                { borderColor: selected ? cat.color : '#2D2D2D' },
                selected && { backgroundColor: cat.bgColor },
              ]}
              onPress={() => toggleCategory(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, { color: selected ? cat.color : '#9CA3AF' }]}>
                {cat.label}
              </Text>
              <Text style={styles.catDesc}>{cat.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rounds */}
      <Text style={styles.sectionLabel}>ROUNDS</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => setRoundCount(Math.max(1, roundCount - 1))}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{roundCount}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => setRoundCount(Math.min(12, roundCount + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Round Duration */}
      <Text style={styles.sectionLabel}>ROUND DURATION</Text>
      <View style={styles.pills}>
        {ROUND_DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.pill, roundDuration === d && styles.pillActive]}
            onPress={() => setRoundDuration(d)}
          >
            <Text style={[styles.pillText, roundDuration === d && styles.pillTextActive]}>
              {fmt(d)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rest Duration */}
      <Text style={styles.sectionLabel}>REST DURATION</Text>
      <View style={styles.pills}>
        {REST_DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.pill, restDuration === d && styles.pillActive]}
            onPress={() => setRestDuration(d)}
          >
            <Text style={[styles.pillText, restDuration === d && styles.pillTextActive]}>
              {fmt(d)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Auto Assign Toggle */}
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Auto-assign combos</Text>
          <Text style={styles.toggleSub}>
            {autoAssign ? 'App picks combos per round' : 'You plan each round manually'}
          </Text>
        </View>
        <Switch
          value={autoAssign}
          onValueChange={setAutoAssign}
          trackColor={{ true: '#EF4444', false: '#2D2D2D' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startBtnText}>
          {autoAssign ? 'START WORKOUT' : 'PLAN ROUNDS →'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingBottom: 60 },
  sectionLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCard: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2D2D2D',
    backgroundColor: '#1C1C1E',
    padding: 12,
    marginBottom: 4,
  },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  catDesc: { fontSize: 11, color: '#4B5563' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  stepBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2D2D2D',
  },
  stepBtnText: { color: '#FFFFFF', fontSize: 24, fontWeight: '300' },
  stepValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
  },
  pills: { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  pillActive: { backgroundColor: '#7F1D1D', borderColor: '#EF4444' },
  pillText: { color: '#9CA3AF', fontWeight: '600', fontSize: 14 },
  pillTextActive: { color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  toggleLabel: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  toggleSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  startBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
