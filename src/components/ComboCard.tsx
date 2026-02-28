import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Combo } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  combo: Combo;
  /** Large mode for the active workout screen */
  large?: boolean;
  showCue?: boolean;
}

export function ComboCard({ combo, large, showCue }: Props) {
  const techniqueStr = combo.techniques.map((t) => t.name).join('  →  ');
  const shortStr = combo.techniques.map((t) => t.shortCode).join(' – ');

  return (
    <View style={[styles.card, large && styles.cardLarge]}>
      <Text style={[styles.name, large && styles.nameLarge]}>{combo.name}</Text>

      {large ? (
        <Text style={styles.techniqueLarge}>{techniqueStr}</Text>
      ) : (
        <Text style={styles.shortCode}>{shortStr}</Text>
      )}

      {showCue && combo.coachingCue ? (
        <Text style={styles.cue}>"{combo.coachingCue}"</Text>
      ) : null}

      <View style={styles.badges}>
        {combo.categories.slice(0, 3).map((cat) => (
          <CategoryBadge key={cat} category={cat} small />
        ))}
        <View style={[styles.diffBadge, styles[combo.difficulty]]}>
          <Text style={styles.diffText}>{combo.difficulty}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardLarge: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  nameLarge: {
    fontSize: 24,
    marginBottom: 10,
  },
  shortCode: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 8,
  },
  techniqueLarge: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  cue: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    alignItems: 'center',
  },
  diffBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  beginner: { backgroundColor: '#166534' },
  intermediate: { backgroundColor: '#92400E' },
  advanced: { backgroundColor: '#7F1D1D' },
});
