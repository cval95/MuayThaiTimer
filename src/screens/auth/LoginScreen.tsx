import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING } from '../../utils/theme';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signInWithEmail, signInWithApple, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error);
    } else {
      navigation.goBack();
    }
  };

  const handleApple = async () => {
    setLoading(true);
    const { error } = await signInWithApple();
    setLoading(false);
    if (error) Alert.alert('Apple Sign-In failed', error);
    else navigation.goBack();
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) Alert.alert('Google Sign-In failed', error);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Save and sync your workout history</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleEmailSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialBtn, styles.appleBtn]}
              onPress={handleApple}
              disabled={loading}
            >
              <Text style={styles.appleBtnText}> Sign in with Apple</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.socialBtn, styles.googleBtn]}
            onPress={handleGoogle}
            disabled={loading}
          >
            <Text style={styles.googleBtnText}>G  Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('SignUp')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchAccent}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  socialBtn: {
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  appleBtn: {
    backgroundColor: '#000',
    borderColor: '#333',
  },
  appleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  googleBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  switchLink: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  switchAccent: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  forgotText: {
    color: COLORS.accent,
    fontSize: 13,
  },
});
