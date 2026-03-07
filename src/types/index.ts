export type Category =
  | 'boxing'
  | 'kicks'
  | 'elbows'
  | 'knees'
  | 'clinch'
  | 'defense'
  | 'combinations';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Focus = 'straights' | 'lead-side' | 'southpaw' | 'power';

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
  focuses?: Focus[];
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
  selectedFocus?: Focus;
  roundPlans: RoundPlan[];
  autoAssign: boolean;
  completedAt?: string; // ISO timestamp set when workout is finished
}

export type WorkoutPhase = 'idle' | 'prep' | 'round' | 'rest' | 'complete';
