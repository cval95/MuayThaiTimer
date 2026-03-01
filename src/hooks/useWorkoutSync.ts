import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { WorkoutConfig } from '../types';

const SAVED_KEY = 'savedWorkouts';
const MAX_LOCAL = 10;

export function useWorkoutSync() {
  const { user } = useAuth();

  const saveWorkout = async (config: WorkoutConfig) => {
    // Always save to local AsyncStorage
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    const local: WorkoutConfig[] = raw ? JSON.parse(raw) : [];
    const updated = [config, ...local.filter(w => w.id !== config.id)].slice(0, MAX_LOCAL);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));

    // If signed in, also persist to Supabase
    if (user) {
      await supabase.from('workouts').upsert({
        id: config.id,
        user_id: user.id,
        config,
      });
    }
  };

  // Fetches workouts: merges Supabase (if signed in) with local AsyncStorage.
  // Supabase records take precedence; local fills the gap when offline/unauthed.
  const loadWorkouts = async (): Promise<WorkoutConfig[]> => {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    const local: WorkoutConfig[] = raw ? JSON.parse(raw) : [];

    if (!user) return local;

    const { data, error } = await supabase
      .from('workouts')
      .select('config, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_LOCAL);

    if (error || !data) return local;

    const remote: WorkoutConfig[] = data.map(row => row.config as WorkoutConfig);

    // Merge: remote first, then any local IDs not already in remote
    const remoteIds = new Set(remote.map(w => w.id));
    const merged = [...remote, ...local.filter(w => !remoteIds.has(w.id))].slice(0, MAX_LOCAL);

    // Back-fill local AsyncStorage with any remote workouts not stored locally
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(merged));

    return merged;
  };

  return { saveWorkout, loadWorkouts };
}
