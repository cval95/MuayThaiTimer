import { Category } from '../types';

export interface CategoryInfo {
  id: Category;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'boxing',
    label: 'Boxing',
    color: '#EF4444',
    bgColor: '#450A0A',
    emoji: '🥊',
    description: 'Jabs, crosses, hooks, uppercuts',
  },
  {
    id: 'kicks',
    label: 'Kicks',
    color: '#F97316',
    bgColor: '#431407',
    emoji: '🦵',
    description: 'Roundhouse, teep, low kick, switch kick',
  },
  {
    id: 'elbows',
    label: 'Elbows',
    color: '#EAB308',
    bgColor: '#422006',
    emoji: '💥',
    description: 'Horizontal, diagonal, spinning elbow',
  },
  {
    id: 'knees',
    label: 'Knees',
    color: '#22C55E',
    bgColor: '#052E16',
    emoji: '🦿',
    description: 'Straight knee, diagonal knee, flying knee',
  },
  {
    id: 'clinch',
    label: 'Clinch',
    color: '#3B82F6',
    bgColor: '#172554',
    emoji: '🤼',
    description: 'Clinch entries, sweeps, throws, plum',
  },
  {
    id: 'defense',
    label: 'Defense',
    color: '#A855F7',
    bgColor: '#2E1065',
    emoji: '🛡️',
    description: 'Slips, checks, catches, counters',
  },
  {
    id: 'combinations',
    label: 'Combinations',
    color: '#EC4899',
    bgColor: '#500724',
    emoji: '⚡',
    description: 'Mixed strike combos across weapons',
  },
];

export const getCategoryInfo = (id: Category): CategoryInfo =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
