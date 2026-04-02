import AsyncStorage from '@react-native-async-storage/async-storage';
import { Combo } from '../types';

const KEY = 'custom_combos_v1';

export async function loadCustomCombos(): Promise<Combo[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomCombo(combo: Combo): Promise<void> {
  const existing = await loadCustomCombos();
  const updated = [...existing.filter((c) => c.id !== combo.id), combo];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function deleteCustomCombo(id: string): Promise<void> {
  const existing = await loadCustomCombos();
  await AsyncStorage.setItem(KEY, JSON.stringify(existing.filter((c) => c.id !== id)));
}
