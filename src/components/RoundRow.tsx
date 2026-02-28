import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RoundPlan } from '../types';

interface Props {
  plan: RoundPlan;
  onEdit: () => void;
  active?: boolean;
}

export function RoundRow({ plan, onEdit, active }: Props) {
  const shortCode = plan.combo.techniques.map((t) => t.shortCode).join(' – ');
  return (
    <View style={[styles.row, active && styles.activeRow]}>
      <View style={styles.roundNum}>
        <Text style={styles.roundNumText}>{plan.roundNumber}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.comboName}>{plan.combo.name}</Text>
        <Text style={styles.shortCode}>{shortCode}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  activeRow: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  roundNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roundNumText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  info: {
    flex: 1,
  },
  comboName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  shortCode: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
});
