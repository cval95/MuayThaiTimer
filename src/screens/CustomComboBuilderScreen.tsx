import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Category, Combo, Technique } from '../types';
import { saveCustomCombo } from '../utils/customCombos';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../utils/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CustomComboBuilder'>;
};

// Palette of techniques the user can tap to add
const TECHNIQUE_PALETTE: { name: string; shortCode: string; group: string }[] = [
  // Punches
  { name: 'Jab', shortCode: '1', group: 'Punches' },
  { name: 'Cross', shortCode: '2', group: 'Punches' },
  { name: 'Left Hook', shortCode: '3', group: 'Punches' },
  { name: 'Right Hook', shortCode: '4', group: 'Punches' },
  { name: 'Left Uppercut', shortCode: '5', group: 'Punches' },
  { name: 'Right Uppercut', shortCode: '6', group: 'Punches' },
  { name: 'Body Jab', shortCode: '1b', group: 'Punches' },
  { name: 'Body Cross', shortCode: '2b', group: 'Punches' },
  // Kicks
  { name: 'Teep', shortCode: 'T', group: 'Kicks' },
  { name: 'Lead Roundhouse', shortCode: 'LRK', group: 'Kicks' },
  { name: 'Rear Roundhouse', shortCode: 'RRK', group: 'Kicks' },
  { name: 'Low Kick', shortCode: 'LK', group: 'Kicks' },
  { name: 'Body Kick', shortCode: 'BRK', group: 'Kicks' },
  { name: 'Head Kick', shortCode: 'HK', group: 'Kicks' },
  { name: 'Switch Kick', shortCode: 'SK', group: 'Kicks' },
  // Defense
  { name: 'Check', shortCode: 'CH', group: 'Defense' },
  { name: 'Slip', shortCode: 'SL', group: 'Defense' },
  { name: 'Bob & Weave', shortCode: 'BW', group: 'Defense' },
  { name: 'Parry', shortCode: 'PA', group: 'Defense' },
  { name: 'Block', shortCode: 'BL', group: 'Defense' },
  // Elbows & Knees
  { name: 'Elbow', shortCode: 'E', group: 'Elbows & Knees' },
  { name: 'Upward Elbow', shortCode: 'EU', group: 'Elbows & Knees' },
  { name: 'Knee', shortCode: 'K', group: 'Elbows & Knees' },
  { name: 'Flying Knee', shortCode: 'FK', group: 'Elbows & Knees' },
];

const GROUPS = ['Punches', 'Kicks', 'Defense', 'Elbows & Knees'];

export function CustomComboBuilderScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [saving, setSaving] = useState(false);

  const addTechnique = (t: { name: string; shortCode: string }) => {
    setTechniques((prev) => [...prev, { name: t.name, shortCode: t.shortCode }]);
  };

  const removeLast = () => {
    setTechniques((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your combo a name.');
      return;
    }
    if (techniques.length < 2) {
      Alert.alert('Too short', 'Add at least 2 techniques.');
      return;
    }
    setSaving(true);
    const combo: Combo = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      techniques,
      categories: ['combinations'] as Category[],
      difficulty: 'intermediate',
      isCustom: true,
    };
    await saveCustomCombo(combo);
    setSaving(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Name input */}
      <Text style={styles.label}>COMBO NAME</Text>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={setName}
        placeholder="e.g. My 1-2-Check"
        placeholderTextColor={COLORS.textDim}
        maxLength={40}
        returnKeyType="done"
      />

      {/* Sequence preview */}
      <Text style={styles.label}>SEQUENCE</Text>
      <View style={styles.sequenceBox}>
        {techniques.length === 0 ? (
          <Text style={styles.sequencePlaceholder}>Tap techniques below to build your combo</Text>
        ) : (
          <View style={styles.sequenceRow}>
            {techniques.map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.seqArrow}>›</Text>}
                <View style={styles.seqBadge}>
                  <Text style={styles.seqCode}>{t.shortCode}</Text>
                  <Text style={styles.seqName}>{t.name}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
        {techniques.length > 0 && (
          <TouchableOpacity style={styles.undoBtn} onPress={removeLast}>
            <Text style={styles.undoBtnText}>⌫ Undo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Technique palette */}
      {GROUPS.map((group) => (
        <View key={group}>
          <Text style={styles.groupLabel}>{group.toUpperCase()}</Text>
          <View style={styles.palette}>
            {TECHNIQUE_PALETTE.filter((t) => t.group === group).map((t) => (
              <TouchableOpacity
                key={t.shortCode + t.name}
                style={styles.paletteBtn}
                onPress={() => addTechnique(t)}
              >
                <Text style={styles.paletteBtnCode}>{t.shortCode}</Text>
                <Text style={styles.paletteBtnName}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, (saving || techniques.length < 2 || !name.trim()) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving || techniques.length < 2 || !name.trim()}
      >
        <Text style={styles.saveBtnText}>{saving ? 'SAVING…' : 'SAVE COMBO'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 60 },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  sequenceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
  },
  sequencePlaceholder: {
    color: COLORS.textDim,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  seqBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 46,
  },
  seqCode: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  seqName: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  seqArrow: {
    color: COLORS.textDim,
    fontSize: 18,
    marginHorizontal: 2,
  },
  undoBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  undoBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  groupLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paletteBtnCode: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  paletteBtnName: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
