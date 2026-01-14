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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 0) {
      formatted = `(${cleaned.slice(0, 2)}`;
      if (cleaned.length > 2) {
        formatted += `) ${cleaned.slice(2, 7)}`;
        if (cleaned.length > 7) {
          formatted += `-${cleaned.slice(7, 11)}`;
        }
      }
    }

    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhoneNumber(text));
  };

  const handleRegister = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await signUp({
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.replace(/\D/g, '') || undefined,
    });

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Erro ao criar conta');
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

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.description}>
              Preencha seus dados para criar sua conta e começar a pedir
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Nome"
                  placeholder="Seu nome"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  required
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Sobrenome"
                  placeholder="Seu sobrenome"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  required
                />
              </View>
            </View>

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              required
            />

            <Input
              label="Celular"
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon="call-outline"
              maxLength={15}
            />

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              leftIcon="lock-closed-outline"
              required
            />

            <Input
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              leftIcon="lock-closed-outline"
              required
            />

            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com nossos{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>

            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={styles.loginLink}>Entrar</Text>
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
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
  },
  closeButton: {
    padding: SPACING.sm,
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
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  terms: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  termsLink: {
    color: COLORS.marsala,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
  loginText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  loginLink: {
    fontSize: FONT_SIZE.md,
    color: COLORS.marsala,
    fontWeight: '600',
  },
});
