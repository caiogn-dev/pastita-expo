import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../services/storeApi';
import type { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: {
    label: 'Pendente',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
    icon: 'time-outline',
  },
  confirmed: {
    label: 'Confirmado',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    icon: 'checkmark-circle-outline',
  },
  preparing: {
    label: 'Preparando',
    color: COLORS.marsala,
    bgColor: '#F0E0E2',
    icon: 'restaurant-outline',
  },
  ready: {
    label: 'Pronto',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    icon: 'checkmark-done-outline',
  },
  out_for_delivery: {
    label: 'Saiu para entrega',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    icon: 'bicycle-outline',
  },
  delivered: {
    label: 'Entregue',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    icon: 'checkmark-circle',
  },
  cancelled: {
    label: 'Cancelado',
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    icon: 'close-circle-outline',
  },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemCount = (order.items?.length || 0) + (order.combo_items?.length || 0);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>Pedido #{order.order_number}</Text>
          <Text style={styles.date}>
            {formattedDate} às {formattedTime}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color={COLORS.gray500} />
          <Text style={styles.infoText}>
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name={order.delivery_method === 'delivery' ? 'bicycle-outline' : 'storefront-outline'}
            size={16}
            color={COLORS.gray500}
          />
          <Text style={styles.infoText}>
            {order.delivery_method === 'delivery' ? 'Entrega' : 'Retirada'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  arrowContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    marginTop: -10,
  },
});

export default OrderCard;
