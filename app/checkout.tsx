import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../src/utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { useCart, useAuth } from '../src/context';
import { Button, Input } from '../src/components';
import { checkout, formatCurrency } from '../src/services/storeApi';
import type { CheckoutData } from '../src/types';

type DeliveryMethod = 'delivery' | 'pickup';
type PaymentMethod = 'pix' | 'cash';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, combos, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [name, setName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  // Address state
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Delivery fee (simplified - in production, calculate based on address)
  const deliveryFee = deliveryMethod === 'delivery' ? 10 : 0;
  const total = cartTotal + deliveryFee;

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

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Informe seu nome');
      return false;
    }
    if (!email.trim()) {
      setError('Informe seu e-mail');
      return false;
    }
    if (!phone.trim()) {
      setError('Informe seu telefone');
      return false;
    }
    if (deliveryMethod === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setError('Preencha o endereço completo');
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const checkoutData: CheckoutData = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.replace(/\D/g, ''),
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        delivery_notes: notes.trim(),
      };

      if (deliveryMethod === 'delivery') {
        checkoutData.delivery_address = {
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim(),
          neighborhood: neighborhood.trim(),
          city: 'Palmas',
          state: 'TO',
          zip_code: '',
        };
      }

      const response = await checkout(checkoutData);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await clearCart();

      // Navigate to success page
      if (response.order_number) {
        router.replace(`/order/${response.order_number}?success=true`);
      } else {
        router.replace('/orders');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Erro ao processar pedido');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart.length + combos.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Finalizar Pedido</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{itemCount} itens</Text>
                <Text style={styles.summaryValue}>{formatCurrency(cartTotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Entrega</Text>
                <Text style={styles.summaryValue}>
                  {deliveryMethod === 'pickup' ? 'Grátis' : formatCurrency(deliveryFee)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Dados</Text>

            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon="person-outline"
              required
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              required
            />

            <Input
              label="Celular"
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              maxLength={15}
              required
            />
          </View>

          {/* Delivery Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Entrega</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  deliveryMethod === 'delivery' && styles.optionCardSelected,
                ]}
                onPress={() => setDeliveryMethod('delivery')}
              >
                <Ionicons
                  name="bicycle"
                  size={24}
                  color={deliveryMethod === 'delivery' ? COLORS.marsala : COLORS.gray400}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    deliveryMethod === 'delivery' && styles.optionLabelSelected,
                  ]}
                >
                  Entrega
                </Text>
                <Text style={styles.optionPrice}>{formatCurrency(10)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  deliveryMethod === 'pickup' && styles.optionCardSelected,
                ]}
                onPress={() => setDeliveryMethod('pickup')}
              >
                <Ionicons
                  name="storefront"
                  size={24}
                  color={deliveryMethod === 'pickup' ? COLORS.marsala : COLORS.gray400}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    deliveryMethod === 'pickup' && styles.optionLabelSelected,
                  ]}
                >
                  Retirada
                </Text>
                <Text style={styles.optionPrice}>Grátis</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Address */}
          {deliveryMethod === 'delivery' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço de Entrega</Text>

              <Input
                label="Rua"
                placeholder="Nome da rua"
                value={street}
                onChangeText={setStreet}
                autoCapitalize="words"
                required
              />

              <View style={styles.row}>
                <View style={styles.smallInput}>
                  <Input
                    label="Número"
                    placeholder="Nº"
                    value={number}
                    onChangeText={setNumber}
                    keyboardType="numeric"
                    required
                  />
                </View>
                <View style={styles.largeInput}>
                  <Input
                    label="Complemento"
                    placeholder="Apto, bloco..."
                    value={complement}
                    onChangeText={setComplement}
                  />
                </View>
              </View>

              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={neighborhood}
                onChangeText={setNeighborhood}
                autoCapitalize="words"
                required
              />

              <Input
                label="Observações"
                placeholder="Ponto de referência, instruções..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'pix' && styles.optionCardSelected,
                ]}
                onPress={() => setPaymentMethod('pix')}
              >
                <Text style={styles.pixIcon}>PIX</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    paymentMethod === 'pix' && styles.optionLabelSelected,
                  ]}
                >
                  PIX
                </Text>
                <Text style={styles.optionHint}>Aprovação imediata</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  paymentMethod === 'cash' && styles.optionCardSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Ionicons
                  name="cash"
                  size={24}
                  color={paymentMethod === 'cash' ? COLORS.marsala : COLORS.gray400}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    paymentMethod === 'cash' && styles.optionLabelSelected,
                  ]}
                >
                  Dinheiro
                </Text>
                <Text style={styles.optionHint}>Na entrega</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.bottomTotalLabel}>Total</Text>
            <Text style={styles.bottomTotalValue}>{formatCurrency(total)}</Text>
          </View>

          <Button
            title="Confirmar Pedido"
            onPress={handleCheckout}
            loading={isLoading}
            size="lg"
            style={styles.confirmButton}
          />
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  optionCardSelected: {
    borderColor: COLORS.marsala,
    backgroundColor: '#FDF8F8',
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: SPACING.sm,
  },
  optionLabelSelected: {
    color: COLORS.marsala,
  },
  optionPrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  optionHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  pixIcon: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.success,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  smallInput: {
    width: 100,
  },
  largeInput: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: SPACING.md,
  },
  totalContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  bottomTotalValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  confirmButton: {
    flex: 1,
  },
});
