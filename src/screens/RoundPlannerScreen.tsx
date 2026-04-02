import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Combo, RoundPlan, WorkoutConfig } from '../types';
import { COMBOS, FREESTYLE_COMBO } from '../data/combos';
import { DRILL_PRESETS } from '../data/drillPresets';
import { RoundRow } from '../components/RoundRow';
import { ComboCard } from '../components/ComboCard';
import { buildRoundPlans } from '../utils/workoutBuilder';
import { loadCustomCombos } from '../utils/customCombos';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../utils/theme';
import { useWorkoutSync } from '../hooks/useWorkoutSync';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RoundPlanner'>;
  route: RouteProp<RootStackParamList, 'RoundPlanner'>;
};

function DrillCard({ drill }: { drill: Combo }) {
  return (
    <View style={drillStyles.card}>
      <View style={drillStyles.header}>
        <Text style={drillStyles.name}>{drill.name}</Text>
        <View style={drillStyles.badge}>
          <Text style={drillStyles.badgeText}>DRILL</Text>
        </View>
      </View>
      {drill.techniques.length > 0 && (
        <View style={drillStyles.chipsRow}>
          {drill.techniques.map((t) => (
            <View key={t.shortCode} style={drillStyles.chip}>
              <Text style={drillStyles.chipCode}>{t.shortCode}</Text>
              <Text style={drillStyles.chipName}>{t.name}</Text>
            </View>
          ))}
        </View>
      )}
      {drill.coachingCue ? (
        <Text style={drillStyles.cue}>"{drill.coachingCue}"</Text>
      ) : null}
    </View>
  );
}

const drillStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: COLORS.accentDark,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 46,
  },
  chipCode: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  chipName: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  cue: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});

export function RoundPlannerScreen({ navigation, route }: Props) {
  const { saveWorkout } = useWorkoutSync();
  const incoming = route.params.config;
  const [roundPlans, setRoundPlans] = useState<RoundPlan[]>(() => {
    if (incoming.roundPlans.length === incoming.roundCount) return incoming.roundPlans;
    return buildRoundPlans(incoming);
  });
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [customCombos, setCustomCombos] = useState<Combo[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCustomCombos().then(setCustomCombos);
    }, [])
  );

  const filteredCombos = [
    ...customCombos,
    ...COMBOS.filter((c) =>
      c.categories.some((cat) => incoming.selectedCategories.includes(cat))
    ),
  ];

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
    try { await saveWorkout(config); } catch (_) {}
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
            <Text style={styles.modalTitle}>Round {editingRound}</Text>
            <View style={styles.modalHeaderRight}>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => { setEditingRound(null); navigation.navigate('CustomComboBuilder'); }}
              >
                <Text style={styles.createBtnText}>+ Custom</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingRound(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.modalList}>
            {/* Freestyle */}
            <TouchableOpacity onPress={() => selectCombo(FREESTYLE_COMBO)}>
              <ComboCard combo={FREESTYLE_COMBO} />
            </TouchableOpacity>

            {/* Drill Presets */}
            <Text style={styles.sectionLabel}>DRILL ROUNDS</Text>
            {DRILL_PRESETS.map((drill) => (
              <TouchableOpacity key={drill.id} onPress={() => selectCombo(drill)}>
                <DrillCard drill={drill} />
              </TouchableOpacity>
            ))}

            {/* Regular Combos */}
            <Text style={styles.sectionLabel}>COMBOS</Text>
            {filteredCombos.map((combo) => (
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
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createBtn: {
    backgroundColor: COLORS.accentDark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  createBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  modalClose: { color: COLORS.textMuted, fontSize: 20 },
  modalList: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 10,
  },
});
