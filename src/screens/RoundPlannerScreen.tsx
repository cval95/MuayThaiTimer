import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Combo, RoundPlan, WorkoutConfig } from '../types';
import { COMBOS } from '../data/combos';
import { RoundRow } from '../components/RoundRow';
import { ComboCard } from '../components/ComboCard';
import { buildRoundPlans } from '../utils/workoutBuilder';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../utils/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RoundPlanner'>;
  route: RouteProp<RootStackParamList, 'RoundPlanner'>;
};

const SAVED_KEY = 'savedWorkouts';

export function RoundPlannerScreen({ navigation, route }: Props) {
  const incoming = route.params.config;
  const [roundPlans, setRoundPlans] = useState<RoundPlan[]>(() => {
    if (incoming.roundPlans.length === incoming.roundCount) return incoming.roundPlans;
    return buildRoundPlans(incoming);
  });
  const [editingRound, setEditingRound] = useState<number | null>(null);

  const availableCombos = COMBOS.filter((c) =>
    c.categories.some((cat) => incoming.selectedCategories.includes(cat))
  );

  const selectCombo = (combo: Combo) => {
    if (editingRound === null) return;
    setRoundPlans((prev) =>
      prev.map((p) =>
        p.roundNumber === editingRound ? { ...p, combo } : p
      )
    );
    setEditingRound(null);
  };

  const handleStart = async () => {
    const config: WorkoutConfig = {
      ...incoming,
      roundPlans,
      autoAssign: false,
    };
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const saved: WorkoutConfig[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        SAVED_KEY,
        JSON.stringify([config, ...saved].slice(0, 10))
      );
    } catch (_) {}
    navigation.navigate('ActiveWorkout', { config });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={roundPlans}
        keyExtractor={(item) => item.roundNumber.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.hint}>
            Tap Edit to change a round's combo. Swipe down to dismiss.
          </Text>
        }
        renderItem={({ item }) => (
          <RoundRow
            plan={item}
            onEdit={() => setEditingRound(item.roundNumber)}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startBtnText}>START WORKOUT</Text>
          </TouchableOpacity>
        }
      />

      {/* Combo Picker Modal */}
      <Modal
        visible={editingRound !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingRound(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Combo — Round {editingRound}</Text>
            <TouchableOpacity onPress={() => setEditingRound(null)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalList}>
            {availableCombos.map((combo) => (
              <TouchableOpacity key={combo.id} onPress={() => selectCombo(combo)}>
                <ComboCard combo={combo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 40 },
  hint: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  startBtnText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  modalClose: { color: COLORS.textMuted, fontSize: 20 },
  modalList: { padding: 16, paddingBottom: 40 },
});
