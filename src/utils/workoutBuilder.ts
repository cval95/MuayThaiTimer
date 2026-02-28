import { Combo, Category, RoundPlan, WorkoutConfig } from '../types';
import { COMBOS } from '../data/combos';

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

export function buildRoundPlans(config: WorkoutConfig): RoundPlan[] {
  const { roundCount, selectedCategories } = config;

  // Filter combos by selected categories
  let pool = selectedCategories.length > 0
    ? COMBOS.filter((combo) =>
        combo.categories.some((c) => selectedCategories.includes(c as Category))
      )
    : COMBOS;

  // Sort by difficulty ascending
  pool = [...pool].sort(
    (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
  );

  const plans: RoundPlan[] = [];
  let lastComboId = '';

  for (let i = 0; i < roundCount; i++) {
    // Gradually increase difficulty across rounds
    const progressRatio = i / Math.max(roundCount - 1, 1);
    let targetDifficulty: 'beginner' | 'intermediate' | 'advanced';
    if (progressRatio < 0.4) {
      targetDifficulty = 'beginner';
    } else if (progressRatio < 0.75) {
      targetDifficulty = 'intermediate';
    } else {
      targetDifficulty = 'advanced';
    }

    // Get candidates at target difficulty (fallback to any difficulty if none available)
    let candidates = pool.filter(
      (c) => c.difficulty === targetDifficulty && c.id !== lastComboId
    );
    if (candidates.length === 0) {
      candidates = pool.filter((c) => c.id !== lastComboId);
    }
    if (candidates.length === 0) {
      candidates = pool;
    }

    // Prefer diverse categories — pick a category that hasn't been used recently
    const recentCategories = plans
      .slice(-2)
      .flatMap((p) => p.combo.categories);

    const fresh = candidates.filter(
      (c) => !c.categories.some((cat) => recentCategories.includes(cat))
    );

    const chosen = fresh.length > 0
      ? fresh[Math.floor(Math.random() * fresh.length)]
      : candidates[Math.floor(Math.random() * candidates.length)];

    plans.push({ roundNumber: i + 1, combo: chosen });
    lastComboId = chosen.id;
  }

  return plans;
}

export function defaultWorkoutConfig(): WorkoutConfig {
  const config: WorkoutConfig = {
    id: Date.now().toString(),
    name: 'Quick Workout',
    roundCount: 5,
    roundDuration: 180,
    restDuration: 60,
    prepDuration: 10,
    selectedCategories: ['boxing', 'kicks', 'combinations'],
    roundPlans: [],
    autoAssign: true,
  };
  config.roundPlans = buildRoundPlans(config);
  return config;
}
