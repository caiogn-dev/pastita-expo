import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Using View with backgroundColor instead of LinearGradient for compatibility
import * as Haptics from '../../src/utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useStore, useCart, useWishlist, useAuth } from '../../src/context';
import { ProductCard, ComboCard, LoadingScreen, Button } from '../../src/components';
import { STORE_INFO } from '../../src/constants/config';
import { storage } from '../../src/services/storage';

const { width } = Dimensions.get('window');
const PROMO_STORAGE_KEY = 'pastita_promo_seen';

export default function HomeScreen() {
  const router = useRouter();
  const { featuredProducts, combos, products, isLoading, refreshCatalog } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    checkPromoStatus();
  }, []);

  const checkPromoStatus = async () => {
    const seen = await storage.getItem(PROMO_STORAGE_KEY);
    if (!seen && !isAuthenticated) {
      setTimeout(() => setShowPromo(true), 1500);
    }
  };

  const dismissPromo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await storage.setItem(PROMO_STORAGE_KEY, 'true');
    setShowPromo(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCatalog();
    setRefreshing(false);
  };

  const openWhatsApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://wa.me/${STORE_INFO.WHATSAPP_NUMBER}`;
    await Linking.openURL(url);
  };

  if (isLoading && !refreshing) {
    return <LoadingScreen message="Carregando cardápio..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Promo Modal */}
      <Modal
        visible={showPromo}
        transparent
        animationType="fade"
        onRequestClose={dismissPromo}
      >
        <TouchableOpacity
          style={styles.promoOverlay}
          activeOpacity={1}
          onPress={dismissPromo}
        >
          <View style={styles.promoModal}>
            <TouchableOpacity style={styles.promoClose} onPress={dismissPromo}>
              <Ionicons name="close" size={24} color={COLORS.gray500} />
            </TouchableOpacity>
            
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>Novidade</Text>
            </View>
            
            <Text style={styles.promoTitle}>Ganhe 10% OFF no primeiro pedido</Text>
            <Text style={styles.promoText}>
              Crie sua conta agora e receba um cupom exclusivo para usar na primeira compra.
            </Text>
            
            <View style={styles.promoActions}>
              <Button
                title="Criar conta e ganhar 10%"
                onPress={() => {
                  dismissPromo();
                  router.push('/auth/register');
                }}
                fullWidth
              />
              <TouchableOpacity
                style={styles.promoSecondary}
                onPress={dismissPromo}
              >
                <Text style={styles.promoSecondaryText}>Ver cardápio primeiro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.marsala}
            colors={[COLORS.marsala]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient}>
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <View style={styles.heroEyebrow}>
                  <Text style={styles.heroEyebrowText}>Artesanal & Prático</Text>
                </View>
                <Text style={styles.heroTitle}>
                  O verdadeiro sabor italiano em minutos.
                </Text>
                <Text style={styles.heroDescription}>
                  Massas frescas, recheios generosos e a praticidade que você precisa.
                </Text>
                <View style={styles.heroButtons}>
                  <TouchableOpacity
                    style={styles.heroPrimaryButton}
                    onPress={() => router.push('/cardapio')}
                  >
                    <Text style={styles.heroPrimaryButtonText}>Ver cardápio</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.heroImageContainer}>
                <Image
                  source={require('../../assets/banner.png')}
                  style={styles.heroImage}
                  contentFit="cover"
                />
              </View>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionEyebrow}>Simples assim</Text>
            <Text style={styles.sectionTitleCentered}>Como funciona</Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>01</Text>
              </View>
              <Text style={styles.stepTitle}>Escolha</Text>
              <Text style={styles.stepDescription}>
                Navegue pelo nosso cardápio e escolha suas massas favoritas.
              </Text>
            </View>

            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.gray300} />
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>02</Text>
              </View>
              <Text style={styles.stepTitle}>Receba</Text>
              <Text style={styles.stepDescription}>
                Entregamos congelado na sua casa, pronto para armazenar.
              </Text>
            </View>

            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.gray300} />
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>03</Text>
              </View>
              <Text style={styles.stepTitle}>Prepare</Text>
              <Text style={styles.stepDescription}>
                Tire do freezer, aqueça em minutos e sirva.
              </Text>
            </View>
          </View>
        </View>

        {/* Why Pastita Section */}
        <View style={styles.whyPastitaSection}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionEyebrow}>Diferenciais</Text>
            <Text style={styles.sectionTitleCentered}>Por que escolher Pastita?</Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="restaurant-outline" size={28} color={COLORS.marsala} />
              </View>
              <Text style={styles.featureTitle}>Massa artesanal</Text>
              <Text style={styles.featureDescription}>
                Feita com ingredientes selecionados e muito carinho.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="time-outline" size={28} color={COLORS.marsala} />
              </View>
              <Text style={styles.featureTitle}>Pronto em minutos</Text>
              <Text style={styles.featureDescription}>
                Do freezer para a mesa em menos de 15 minutos.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="heart-outline" size={28} color={COLORS.marsala} />
              </View>
              <Text style={styles.featureTitle}>Recheios generosos</Text>
              <Text style={styles.featureDescription}>
                Cada mordida é uma explosão de sabor.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="snow-outline" size={28} color={COLORS.marsala} />
              </View>
              <Text style={styles.featureTitle}>Entrega congelada</Text>
              <Text style={styles.featureDescription}>
                Mantém a qualidade e o frescor até você.
              </Text>
            </View>
          </View>
        </View>

        {/* Combos Section */}
        {combos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎁 Combos Especiais</Text>
              <TouchableOpacity onPress={() => router.push('/cardapio')}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.combosContainer}
            >
              {combos.slice(0, 5).map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  onPress={() => router.push(`/product/${combo.id}?type=combo`)}
                  onAddToCart={() => {}}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Destaques</Text>
              <TouchableOpacity onPress={() => router.push('/cardapio')}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onAddToCart={() => addToCart(product)}
                  onToggleFavorite={() => toggleWishlist(product)}
                  isFavorite={isInWishlist(product.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaGradient}>
            <Text style={styles.ctaTitle}>Pronto para experimentar?</Text>
            <Text style={styles.ctaDescription}>
              Descubra o sabor autêntico das massas artesanais Pastita.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/cardapio')}
            >
              <Text style={styles.ctaButtonText}>Ver cardápio completo</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.marsalaDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/cardapio')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="restaurant" size={24} color={COLORS.marsala} />
            </View>
            <Text style={styles.quickActionText}>Cardápio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/orders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="receipt" size={24} color={COLORS.gold} />
            </View>
            <Text style={styles.quickActionText}>Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="heart" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionText}>Favoritos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={openWhatsApp}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={styles.quickActionText}>Contato</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>PASTITA</Text>
          <Text style={styles.footerTagline}>
            Massas artesanais com o verdadeiro sabor italiano.
          </Text>
          <View style={styles.footerContact}>
            <Text style={styles.footerContactText}>{STORE_INFO.EMAIL}</Text>
            <Text style={styles.footerContactText}>{STORE_INFO.ADDRESS}</Text>
            <Text style={styles.footerContactText}>
              {STORE_INFO.CITY} - {STORE_INFO.STATE}
            </Text>
          </View>
          <Text style={styles.footerCopyright}>
            © 2026 Pastita. Todos os direitos reservados.
          </Text>
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
  scrollView: {
    flex: 1,
  },

  // Promo Modal
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  promoModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    ...SHADOWS.xl,
  },
  promoClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  promoBadge: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  promoBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.marsalaDark,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.marsala,
    marginBottom: SPACING.sm,
  },
  promoText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    lineHeight: FONT_SIZE.md * 1.5,
    marginBottom: SPACING.lg,
  },
  promoActions: {
    gap: SPACING.sm,
  },
  promoSecondary: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  promoSecondaryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.marsala,
    fontWeight: '500',
  },

  // Hero Section
  heroSection: {
    marginBottom: SPACING.xl,
  },
  heroGradient: {
    backgroundColor: COLORS.marsala,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  heroContent: {
    flexDirection: 'column',
  },
  heroTextContainer: {
    marginBottom: SPACING.lg,
  },
  heroEyebrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  heroEyebrowText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: FONT_SIZE.hero * 1.1,
    marginBottom: SPACING.sm,
  },
  heroDescription: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: FONT_SIZE.md * 1.5,
    marginBottom: SPACING.lg,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  heroPrimaryButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  heroPrimaryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.marsalaDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroImageContainer: {
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // How It Works Section
  howItWorksSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  sectionHeaderCentered: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sectionEyebrow: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.marsala,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  sectionTitleCentered: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.marsala,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.4,
    paddingHorizontal: SPACING.xs,
  },
  stepArrow: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },

  // Why Pastita Section
  whyPastitaSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  featureCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDF2F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.4,
  },

  // Sections
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZE.md,
    color: COLORS.marsala,
    fontWeight: '500',
  },
  combosContainer: {
    paddingHorizontal: SPACING.lg,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  // CTA Section
  ctaSection: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  ctaGradient: {
    backgroundColor: COLORS.marsala,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ctaDescription: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  ctaButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.marsalaDark,
    textTransform: 'uppercase',
  },

  // Quick Actions
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  quickActionCard: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray700,
    fontWeight: '500',
  },

  // Footer
  footer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  footerBrand: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.marsala,
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  footerTagline: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  footerContact: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  footerContactText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  footerCopyright: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },

  bottomPadding: {
    height: SPACING.lg,
  },
});
