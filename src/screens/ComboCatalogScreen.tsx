import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Combo, Category, Difficulty } from '../types';
import { COMBOS } from '../data/combos';
import { CATEGORIES } from '../data/categories';
import { ComboCard } from '../components/ComboCard';
import { COLORS } from '../utils/theme';

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export function ComboCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [detailCombo, setDetailCombo] = useState<Combo | null>(null);

  const toggleCat = (cat: Category) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const filtered = COMBOS.filter((combo) => {
    const matchSearch =
      search.length === 0 ||
      combo.name.toLowerCase().includes(search.toLowerCase()) ||
      combo.techniques.some((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    const matchCat =
      selectedCats.length === 0 ||
      combo.categories.some((c) => selectedCats.includes(c as Category));
    const matchDiff = !selectedDiff || combo.difficulty === selectedDiff;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search combos..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCats.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                active && { backgroundColor: cat.bgColor, borderColor: cat.color },
              ]}
              onPress={() => toggleCat(cat.id)}
            >
              <Text style={[styles.chipText, active && { color: cat.color }]}>
                {cat.emoji} {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Difficulty filter */}
      <View style={styles.diffRow}>
        {DIFFICULTIES.map((diff) => (
          <TouchableOpacity
            key={diff}
            style={[styles.diffChip, selectedDiff === diff && styles.diffChipActive]}
            onPress={() => setSelectedDiff(selectedDiff === diff ? null : diff)}
          >
            <Text style={[styles.diffChipText, selectedDiff === diff && styles.diffChipTextActive]}>
              {diff}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{filtered.length} combos</Text>
      </View>

      {/* Combo List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setDetailCombo(item)}>
            <ComboCard combo={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No combos match your filters.</Text>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={detailCombo !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailCombo(null)}
      >
        {detailCombo && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{detailCombo.name}</Text>
              <TouchableOpacity onPress={() => setDetailCombo(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ComboCard combo={detailCombo} large showCue />
              <View style={styles.techList}>
                <Text style={styles.techListTitle}>Sequence</Text>
                {detailCombo.techniques.map((t, idx) => (
                  <View key={idx} style={styles.techItem}>
                    <View style={styles.techBadge}>
                      <Text style={styles.techCode}>{t.shortCode}</Text>
                    </View>
                    <Text style={styles.techName}>{t.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchRow: { padding: 12, paddingBottom: 0 },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  chipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  diffRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  diffChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  diffChipActive: { backgroundColor: COLORS.accentDark, borderColor: COLORS.accent },
  diffChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  diffChipTextActive: { color: COLORS.textPrimary },
  count: { color: COLORS.textDim, fontSize: 12, marginLeft: 'auto' },
  list: { padding: 12, paddingBottom: 40 },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 40,
    fontSize: 15,
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
    flex: 1,
  },
  modalClose: { color: COLORS.textMuted, fontSize: 20, paddingLeft: 12 },
  modalContent: { padding: 16, paddingBottom: 40 },
  techList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  techListTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  techBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  techCode: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 13 },
  techName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
});
