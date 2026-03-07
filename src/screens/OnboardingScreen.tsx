import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING } from '../utils/theme';

export const ONBOARDING_KEY = 'hasSeenOnboarding';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

const FEATURES = [
  { icon: '⏱', text: 'Timed rounds with rest periods and bell sounds' },
  { icon: '🥊', text: '62 Muay Thai combinations across 7 categories' },
  { icon: '📊', text: 'Track and sync your workout history' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.glove}>🥊</Text>
          <Text style={styles.title}>Muay Thai Timer</Text>
          <Text style={styles.subtitle}>Structure your training with timed rounds and real technique combinations.</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleGetStarted} activeOpacity={0.85}>
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.trial}>Free 14-day trial · then £29.99/year</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  glove: { fontSize: 64 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  features: {
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  featureIcon: { fontSize: 24 },
  featureText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  footer: {
    gap: SPACING.sm,
    alignItems: 'center',
  },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  btnText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  trial: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
