export type Category =
  | 'boxing'
  | 'kicks'
  | 'elbows'
  | 'knees'
  | 'clinch'
  | 'defense'
  | 'combinations';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Technique {
  name: string;
  shortCode: string;
}

export interface Combo {
  id: string;
  name: string;
  techniques: Technique[];
  categories: Category[];
  difficulty: Difficulty;
  coachingCue?: string;
}

export interface RoundPlan {
  roundNumber: number;
  combo: Combo;
  focus?: string;
}

export interface WorkoutConfig {
  id: string;
  name: string;
  roundCount: number;
  roundDuration: number;
  restDuration: number;
  prepDuration: number;
  selectedCategories: Category[];
  roundPlans: RoundPlan[];
  autoAssign: boolean;
}

export type WorkoutPhase = 'idle' | 'prep' | 'round' | 'rest' | 'complete';
