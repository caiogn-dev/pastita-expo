import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../services/storeApi';
import type { CartItem as CartItemType, CartComboItem } from '../types';

interface CartItemProps {
  item: CartItemType | CartComboItem;
  onUpdateQuantity: (amount: number) => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const isCombo = 'isCombo' in item && item.isCombo;
  const totalPrice = item.price * item.quantity;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        placeholder={require('../../assets/placeholder.png')}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {isCombo && (
              <View style={styles.comboBadge}>
                <Text style={styles.comboBadgeText}>COMBO</Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </View>

          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(-1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.marsala} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(1)}
            >
              <Ionicons name="add" size={16} color={COLORS.marsala} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>
              {formatCurrency(item.price)} un.
            </Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalPrice)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.sm,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  comboBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  comboBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.marsalaDark,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: FONT_SIZE.md * 1.3,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
  },
  totalPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.marsala,
  },
});

export default CartItem;
