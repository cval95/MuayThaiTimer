import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { COLORS, SPACING } from '../utils/theme';

type Props = StackScreenProps<RootStackParamList, 'Profile'>;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut, resetPassword, deleteAccount } = useAuth();
  const { isSubscribed, expiresDate, isTrial } = useSubscription();
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const initials = user?.email ? user.email[0].toUpperCase() : '?';
  const isEmailUser = user?.app_metadata?.provider === 'email';

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    Alert.alert(
      'Reset Password',
      `Send a password reset link to ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setResetLoading(true);
            const { error } = await resetPassword(user.email!);
            setResetLoading(false);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Email sent', 'Check your inbox for the reset link.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This will erase all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This is permanent. Your account and all associated data will be deleted immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            const { error } = await deleteAccount();
            setDeleteLoading(false);
            if (error) {
              Alert.alert('Error', error);
            }
          },
        },
      ]
    );
  };

  const subscriptionLabel = () => {
    if (!isSubscribed) return null;
    if (isTrial) return 'Free Trial';
    return 'Premium';
  };

  const subscriptionDetail = () => {
    if (!expiresDate) return null;
    if (isTrial) return `Trial ends in ${daysUntil(expiresDate)} days · ${formatDate(expiresDate)}`;
    return `Renews ${formatDate(expiresDate)}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Account</Text>
          <View style={styles.closePlaceholder} />
        </View>

        {/* Avatar + identity */}
        <View style={styles.identitySection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Subscription card */}
        {isSubscribed && (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{subscriptionLabel()}</Text>
              </View>
              <Text style={styles.cardDetail}>{subscriptionDetail()}</Text>
            </View>
            <TouchableOpacity style={styles.manageBtn} onPress={handleManageSubscription}>
              <Text style={styles.manageBtnText}>Manage Subscription →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          {isEmailUser && (
            <TouchableOpacity
              style={styles.row}
              onPress={handleResetPassword}
              disabled={resetLoading}
            >
              <Text style={styles.rowLabel}>Change Password</Text>
              {resetLoading ? (
                <ActivityIndicator color={COLORS.textMuted} size="small" />
              ) : (
                <Text style={styles.rowChevron}>›</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.row} onPress={handleManageSubscription}>
            <Text style={styles.rowLabel}>Subscription & Billing</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <ActivityIndicator color="#EF4444" size="small" />
          ) : (
            <Text style={styles.deleteText}>Delete Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: SPACING.lg,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  closeBtn: { padding: SPACING.xs },
  closeText: { color: COLORS.textSecondary, fontSize: 18 },
  closePlaceholder: { width: 30 },
  heading: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDetail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  manageBtn: { alignSelf: 'flex-start' },
  manageBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  rowChevron: {
    color: COLORS.textMuted,
    fontSize: 20,
  },
  signOutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  deleteText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
