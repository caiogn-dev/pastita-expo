import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency, buildMediaUrl } from '../services/storeApi';
import type { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isLoading = false,
}) => {
  const imageUrl = buildMediaUrl(product.main_image_url);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;

  const handleAddToCart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart();
  };

  const handleToggleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite?.();
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

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {onToggleFavorite && (
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.gray500}
            />
          </TouchableOpacity>
        )}

        {product.status === 'out_of_stock' && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Esgotado</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.short_description && (
          <Text style={styles.description} numberOfLines={1}>
            {product.short_description}
          </Text>
        )}

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {hasDiscount && (
              <Text style={styles.comparePrice}>
                {formatCurrency(product.compare_at_price!)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              product.status === 'out_of_stock' && styles.addButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={product.status === 'out_of_stock' || isLoading}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
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
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    ...SHADOWS.sm,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZE.md * 1.3,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  comparePrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: COLORS.marsala,
    borderRadius: BORDER_RADIUS.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
});

export default ProductCard;
