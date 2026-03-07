import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../utils/theme';

type Props = StackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      setSent(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {sent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.primaryBtnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emailHighlight: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
