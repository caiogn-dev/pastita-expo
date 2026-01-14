import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency, buildMediaUrl } from '../services/storeApi';
import type { Combo } from '../types';

const { width } = Dimensions.get('window');

interface ComboCardProps {
  combo: Combo;
  onPress: () => void;
  onAddToCart: () => void;
  isLoading?: boolean;
}

const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  onPress,
  onAddToCart,
  isLoading = false,
}) => {
  const imageUrl = buildMediaUrl(combo.image_url);
  const hasDiscount = combo.original_price && combo.original_price > combo.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - combo.price / combo.original_price!) * 100)
    : 0;

  const handleAddToCart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          placeholder={require('../../assets/placeholder.png')}
          transition={200}
        />

        <View style={styles.comboBadge}>
          <Ionicons name="gift" size={14} color={COLORS.marsalaDark} />
          <Text style={styles.comboBadgeText}>COMBO</Text>
        </View>

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {combo.name}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {combo.description}
        </Text>

        <View style={styles.itemsContainer}>
          <Text style={styles.itemsLabel}>Inclui:</Text>
          {combo.items.slice(0, 3).map((item, index) => (
            <Text key={item.id} style={styles.itemText} numberOfLines={1}>
              • {item.quantity}x {item.product.name}
            </Text>
          ))}
          {combo.items.length > 3 && (
            <Text style={styles.moreItems}>+{combo.items.length - 3} itens</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatCurrency(combo.original_price!)}
              </Text>
            )}
            <Text style={styles.price}>{formatCurrency(combo.price)}</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={isLoading}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - SPACING.lg * 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  comboBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  comboBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.marsalaDark,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  itemsContainer: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  itemsLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  itemText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.marsala,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.marsala,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default ComboCard;
