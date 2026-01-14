import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../src/utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useStore, useCart, useWishlist } from '../../src/context';
import { Button, LoadingScreen } from '../../src/components';
import { formatCurrency, buildMediaUrl } from '../../src/services/storeApi';
import type { Product } from '../../src/types';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { products } = useStore();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const found = products.find((p) => p.id === id);
    setProduct(found || null);
  }, [id, products]);

  const handleAddToCart = async () => {
    if (!product) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    for (let i = 0; i < quantity; i++) {
      await addToCart(product);
    }
    
    router.back();
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    await toggleWishlist(product);
  };

  const incrementQuantity = async () => {
    await Haptics.selectionAsync();
    setQuantity((q) => q + 1);
  };

  const decrementQuantity = async () => {
    if (quantity > 1) {
      await Haptics.selectionAsync();
      setQuantity((q) => q - 1);
    }
  };

  if (!product) {
    return <LoadingScreen message="Carregando produto..." />;
  }

  const imageUrl = buildMediaUrl(product.main_image_url);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  const totalPrice = product.price * quantity;
  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.status === 'out_of_stock';

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            placeholder={require('../../assets/placeholder.png')}
            transition={300}
          />

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}

          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Produto Esgotado</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          {product.category && (
            <Text style={styles.category}>{product.category.name}</Text>
          )}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {hasDiscount && (
              <Text style={styles.comparePrice}>
                {formatCurrency(product.compare_at_price!)}
              </Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Product Type Info */}
          {product.product_type && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{product.product_type.name}</Text>
              </View>
            </View>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBarSafeArea}>
        <View style={styles.bottomBar}>
          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? COLORS.gray300 : COLORS.marsala}
              />
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
              <Ionicons name="add" size={20} color={COLORS.marsala} />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <View style={styles.addButtonContainer}>
            <Button
              title={`Adicionar • ${formatCurrency(totalPrice)}`}
              onPress={handleAddToCart}
              loading={cartLoading}
              disabled={isOutOfStock}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: height * 0.45,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: -SPACING.lg,
  },
  category: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.marsala,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  price: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  comparePrice: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
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
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textLight,
    lineHeight: FONT_SIZE.md * 1.6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  typeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.marsalaDark,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray600,
  },
  bottomPadding: {
    height: 120,
  },
  bottomBarSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 32,
    textAlign: 'center',
  },
  addButtonContainer: {
    flex: 1,
  },
});
