import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useStore, useCart, useWishlist } from '../../src/context';
import { ProductCard, CategoryChip, LoadingScreen, EmptyState } from '../../src/components';
import type { Product, Category } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

export default function CardapioScreen() {
  const router = useRouter();
  const { categories, products, isLoading, refreshCatalog, getProductsByCategory } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCatalog();
    setRefreshing(false);
  };

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (selectedCategory) {
      result = getProductsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.short_description?.toLowerCase().includes(query)
      );
    }

    // Only show active products
    return result.filter((product) => product.status === 'active');
  }, [products, selectedCategory, searchQuery, getProductsByCategory]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => router.push(`/product/${item.id}`)}
      onAddToCart={() => addToCart(item)}
      onToggleFavorite={() => toggleWishlist(item)}
      isFavorite={isInWishlist(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          placeholderTextColor={COLORS.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={COLORS.gray400}
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'Todos', slug: 'all' } as any, ...categories]}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <CategoryChip
            label={item.name}
            isSelected={selectedCategory === item.id}
            onPress={() => handleCategoryPress(item.id)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
        {selectedCategory && ' nesta categoria'}
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingScreen message="Carregando cardápio..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Cardápio</Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Nenhum produto encontrado"
            description={
              searchQuery
                ? `Não encontramos produtos para "${searchQuery}"`
                : 'Não há produtos disponíveis nesta categoria'
            }
            actionLabel="Limpar filtros"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.marsala}
            colors={[COLORS.marsala]}
          />
        }
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
  titleContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  headerContainer: {
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultsCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
});
