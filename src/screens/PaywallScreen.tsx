import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING } from '../utils/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Paywall'>;
};

const BENEFITS = [
  { icon: '🥊', text: '60+ Muay Thai combos across 7 categories' },
  { icon: '🧠', text: 'Smart round planning with difficulty progression' },
  { icon: '🔔', text: 'Audio cues, countdown beeps & vibration' },
  { icon: '☁️', text: 'Workout history synced across your devices' },
];

export default function PaywallScreen({ navigation }: Props) {
  const { subscribe, restorePurchases } = useSubscription();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const { error } = await subscribe();
    setLoading(false);
    if (error) Alert.alert('Purchase failed', error);
    // On success, SubscriptionContext updates isSubscribed → AppNavigator auto-transitions to main app
  };

  const handleRestore = async () => {
    setLoading(true);
    const { error } = await restorePurchases();
    setLoading(false);
    if (error) Alert.alert('Restore failed', error);
    // On success, same auto-transition applies
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Wordmark */}
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkTop}>MUAY THAI</Text>
          <Text style={styles.wordmarkBottom}>TIMER</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Train smart. Hit harder.</Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Price block */}
        <View style={styles.priceBlock}>
          <Text style={styles.price}>£29.99 / year</Text>
          <Text style={styles.trialNote}>14-day free trial · Cancel anytime</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.trialBtn, loading && styles.btnDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={styles.trialBtnText}>Start Free Trial</Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Catalog preview */}
        <TouchableOpacity
          style={styles.catalogBtn}
          onPress={() => navigation.navigate('ComboCatalogPreview')}
          disabled={loading}
        >
          <Text style={styles.catalogBtnText}>📖  Browse Combo Catalog</Text>
        </TouchableOpacity>

        {/* Sign out link */}
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut} disabled={loading}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  wordmark: { alignItems: 'center', marginBottom: SPACING.sm },
  wordmarkTop: {
    color: COLORS.accent,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  wordmarkBottom: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 12,
    marginTop: -6,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: SPACING.xl,
  },
  benefits: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  benefitText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  priceBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  price: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  trialNote: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  trialBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  btnDisabled: { opacity: 0.6 },
  trialBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  restoreBtn: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  restoreBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  catalogBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  catalogBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  signOutBtn: { marginTop: SPACING.sm },
  signOutText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
