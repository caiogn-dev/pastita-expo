import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { Button, LoadingScreen, EmptyState } from '../../src/components';
import { getOrder, getOrderWhatsApp, formatCurrency } from '../../src/services/storeApi';
import { STORE_INFO } from '../../src/constants/config';
import type { Order, OrderStatus } from '../../src/types';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap; description: string }
> = {
  pending: {
    label: 'Pendente',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
    icon: 'time-outline',
    description: 'Aguardando confirmação do pagamento',
  },
  confirmed: {
    label: 'Confirmado',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    icon: 'checkmark-circle-outline',
    description: 'Seu pedido foi confirmado e será preparado em breve',
  },
  preparing: {
    label: 'Preparando',
    color: COLORS.marsala,
    bgColor: '#F0E0E2',
    icon: 'restaurant-outline',
    description: 'Estamos preparando seu pedido com carinho',
  },
  ready: {
    label: 'Pronto',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    icon: 'checkmark-done-outline',
    description: 'Seu pedido está pronto!',
  },
  out_for_delivery: {
    label: 'Saiu para entrega',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    icon: 'bicycle-outline',
    description: 'Seu pedido está a caminho',
  },
  delivered: {
    label: 'Entregue',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    icon: 'checkmark-circle',
    description: 'Pedido entregue com sucesso!',
  },
  cancelled: {
    label: 'Cancelado',
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    icon: 'close-circle-outline',
    description: 'Este pedido foi cancelado',
  },
};

export default function OrderDetailScreen() {
  const { id, success } = useLocalSearchParams<{ id: string; success?: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setError(null);
      const data = await getOrder(id);
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError('Erro ao carregar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  };

  const handleWhatsApp = async () => {
    try {
      const data = await getOrderWhatsApp(id);
      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (err) {
      // Fallback to direct WhatsApp
      const message = `Olá! Gostaria de informações sobre meu pedido #${order?.order_number}`;
      const url = `https://wa.me/${STORE_INFO.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      await WebBrowser.openBrowserAsync(url);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando pedido..." />;
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes do Pedido</Text>
          <View style={styles.placeholder} />
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Erro ao carregar"
          description={error || 'Pedido não encontrado'}
          actionLabel="Tentar novamente"
          onAction={fetchOrder}
        />
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pedido #{order.order_number}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.marsala}
            colors={[COLORS.marsala]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        {success === 'true' && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Pedido realizado com sucesso!</Text>
              <Text style={styles.successText}>
                Você receberá atualizações sobre seu pedido
              </Text>
            </View>
          </View>
        )}

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
          <View style={styles.statusIconContainer}>
            <Ionicons name={statusConfig.icon} size={32} color={statusConfig.color} />
          </View>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Pedido</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.gray500} />
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.gray500} />
              <Text style={styles.infoLabel}>Horário</Text>
              <Text style={styles.infoValue}>{formattedTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={order.delivery_method === 'delivery' ? 'bicycle-outline' : 'storefront-outline'}
                size={20}
                color={COLORS.gray500}
              />
              <Text style={styles.infoLabel}>Entrega</Text>
              <Text style={styles.infoValue}>
                {order.delivery_method === 'delivery' ? 'Delivery' : 'Retirada'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        {order.delivery_method === 'delivery' && order.delivery_address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
            <View style={styles.infoCard}>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={20} color={COLORS.marsala} />
                <View style={styles.addressContent}>
                  <Text style={styles.addressText}>
                    {order.delivery_address.street}, {order.delivery_address.number}
                  </Text>
                  {order.delivery_address.complement && (
                    <Text style={styles.addressText}>{order.delivery_address.complement}</Text>
                  )}
                  <Text style={styles.addressText}>
                    {order.delivery_address.neighborhood}
                  </Text>
                  <Text style={styles.addressText}>
                    {order.delivery_address.city} - {order.delivery_address.state}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          <View style={styles.infoCard}>
            {order.items?.map((item, index) => (
              <View
                key={item.id}
                style={[styles.itemRow, index > 0 && styles.itemRowBorder]}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.total_price)}</Text>
              </View>
            ))}

            {order.combo_items?.map((item, index) => (
              <View
                key={item.id}
                style={[styles.itemRow, styles.itemRowBorder]}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                  <View style={styles.comboLabel}>
                    <Text style={styles.comboLabelText}>COMBO</Text>
                  </View>
                  <Text style={styles.itemName}>{item.combo_name}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.total_price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.infoCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entrega</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.delivery_fee)}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{formatCurrency(order.discount)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Falar no WhatsApp"
            onPress={handleWhatsApp}
            variant="outline"
            fullWidth
            icon={<Ionicons name="logo-whatsapp" size={20} color={COLORS.marsala} />}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
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
    fontSize: FONT_SIZE.lg,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  successText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  statusCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  statusIconContainer: {
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  itemQuantity: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.marsala,
    minWidth: 28,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  comboLabel: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  comboLabelText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.marsalaDark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  discountValue: {
    color: COLORS.success,
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
  actionsSection: {
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
