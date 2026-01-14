import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../../src/constants/theme';
import { useAuth } from '../../src/context';
import { Button, Input } from '../../src/components';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await signIn(email.trim(), password);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={28} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PASTITA</Text>
            <Text style={styles.subtitle}>Massas artesanais</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.description}>
              Entre com seu e-mail e senha para acessar sua conta
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
            />

            <Input
              label="Senha"
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              leftIcon="lock-closed-outline"
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/register')}>
                <Text style={styles.registerLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.marsala,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  form: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.marsala,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    marginHorizontal: SPACING.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  registerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  registerLink: {
    fontSize: FONT_SIZE.md,
    color: COLORS.marsala,
    fontWeight: '600',
  },
});
