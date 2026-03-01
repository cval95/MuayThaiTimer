import { Focus } from '../types';

export interface FocusInfo {
  id: Focus;
  label: string;
  emoji: string;
  description: string;
  contextNote: string;
}

export const FOCUSES: FocusInfo[] = [
  {
    id: 'straights',
    label: 'Straights',
    emoji: '🎯',
    description: 'Jab & cross only',
    contextNote: 'Straights only — snap sharp, bring it back',
  },
  {
    id: 'lead-side',
    label: 'Lead Side',
    emoji: '👊',
    description: 'Lead hand & leg dominant',
    contextNote: 'Lead side — jab, hook, teep',
  },
  {
    id: 'southpaw',
    label: 'vs. Southpaw',
    emoji: '🔄',
    description: 'Fighting a southpaw opponent',
    contextNote: 'vs. Southpaw — step to their outside, attack the open side',
  },
  {
    id: 'power',
    label: 'Power Shots',
    emoji: '💥',
    description: 'Heavy finishing combos',
    contextNote: 'Power shots — commit, drive through the target',
  },
];

export function getFocusInfo(id: Focus): FocusInfo {
  return FOCUSES.find((f) => f.id === id)!;
}
