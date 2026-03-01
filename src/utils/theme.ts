export const COLORS = {
  background: '#0A0A0A',
  surface: '#1C1C1E',
  surfaceAlt: '#2D2D2D',
  border: '#2D2D2D',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textDim: '#4B5563',
  accent: '#EF4444',
  accentDark: '#7F1D1D',

  phasePrep: '#F59E0B',
  phaseRound: '#EF4444',
  phaseRest: '#3B82F6',
  phaseComplete: '#22C55E',
  phaseIdle: '#1A1A1A',
} as const;

export const FONTS = {
  timerDisplay: 96,
  phaseLabel: 22,
  comboLabel: 13,
  comboName: 20,
  techniqueCode: 14,
  techniqueName: 10,
  coachingCue: 14,
  sectionHeader: 11,
  buttonText: 16,
  stepperValue: 22,
  titleLarge: 28,
  titleSmall: 14,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
