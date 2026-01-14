import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useCart } from '../../src/context';
import { CartItem, EmptyState, Button } from '../../src/components';
import { formatCurrency } from '../../src/services/storeApi';
import type { CartItem as CartItemType, CartComboItem } from '../../src/types';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    combos,
    cartTotal,
    cartCount,
    hasItems,
    updateQuantity,
    removeFromCart,
    updateComboQuantity,
    removeComboFromCart,
    clearCart,
  } = useCart();

  // Combine products and combos for the list
  const allItems = [
    ...cart.map((item) => ({ ...item, type: 'product' as const })),
    ...combos.map((item) => ({ ...item, type: 'combo' as const })),
  ];

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const renderItem = ({ item }: { item: (CartItemType | CartComboItem) & { type: 'product' | 'combo' } }) => {
    if (item.type === 'combo') {
      return (
        <CartItem
          item={item as CartComboItem}
          onUpdateQuantity={(amount) => updateComboQuantity(item.id, amount)}
          onRemove={() => removeComboFromCart(item.id)}
        />
      );
    }

    return (
      <CartItem
        item={item}
        onUpdateQuantity={(amount) => updateQuantity(item.id, amount)}
        onRemove={() => removeFromCart(item.id)}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Carrinho</Text>
      {hasItems && (
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasItems) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cartCount} itens)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartTotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={styles.summaryNote}>Calculado no checkout</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
          </View>
        </View>

        <Button
          title="Finalizar Pedido"
          onPress={handleCheckout}
          fullWidth
          size="lg"
          icon={<Ionicons name="arrow-forward" size={20} color={COLORS.white} />}
          iconPosition="right"
        />

        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => router.push('/cardapio')}
        >
          <Text style={styles.continueShoppingText}>Continuar comprando</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!hasItems) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <EmptyState
          icon="cart-outline"
          title="Seu carrinho está vazio"
          description="Adicione produtos do cardápio para começar seu pedido"
          actionLabel="Ver Cardápio"
          onAction={() => router.push('/cardapio')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  footer: {
    marginTop: SPACING.lg,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  summaryNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
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
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  continueShoppingButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  continueShoppingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.marsala,
    fontWeight: '500',
  },
});
