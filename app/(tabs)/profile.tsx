import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import { useAuth, useWishlist } from '../../src/context';
import { Button } from '../../src/components';
import { STORE_INFO, APP_CONFIG } from '../../src/constants/config';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.marsala} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
    </View>
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const { wishlist } = useWishlist();

  const handleSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const openWhatsApp = async () => {
    const url = `https://wa.me/${STORE_INFO.WHATSAPP_NUMBER}`;
    await WebBrowser.openBrowserAsync(url);
  };

  const openEmail = async () => {
    const url = `mailto:${STORE_INFO.EMAIL}`;
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User Info */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // Navigate to edit profile
              }}
            >
              <Ionicons name="pencil" size={18} color={COLORS.marsala} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <Ionicons name="person-circle-outline" size={64} color={COLORS.gray300} />
            <Text style={styles.guestTitle}>Bem-vindo!</Text>
            <Text style={styles.guestText}>
              Faça login para acessar seus pedidos e favoritos
            </Text>
            <View style={styles.authButtons}>
              <Button
                title="Entrar"
                onPress={() => router.push('/auth/login')}
                variant="primary"
                style={styles.authButton}
              />
              <Button
                title="Criar conta"
                onPress={() => router.push('/auth/register')}
                variant="outline"
                style={styles.authButton}
              />
            </View>
          </View>
        )}

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="receipt-outline"
              label="Meus Pedidos"
              onPress={() => router.push('/orders')}
            />
            <MenuItem
              icon="heart-outline"
              label="Favoritos"
              value={wishlist.length > 0 ? `${wishlist.length} itens` : undefined}
              onPress={() => {
                // Navigate to favorites
              }}
            />
            <MenuItem
              icon="location-outline"
              label="Endereços"
              onPress={() => {
                // Navigate to addresses
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="logo-whatsapp"
              label="WhatsApp"
              value={STORE_INFO.WHATSAPP_NUMBER}
              onPress={openWhatsApp}
            />
            <MenuItem
              icon="mail-outline"
              label="E-mail"
              value={STORE_INFO.EMAIL}
              onPress={openEmail}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Ajuda"
              onPress={() => {
                // Navigate to help
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="information-circle-outline"
              label="Sobre o App"
              value={`v${APP_CONFIG.VERSION}`}
              onPress={() => {
                // Navigate to about
              }}
              showArrow={false}
            />
            <MenuItem
              icon="document-text-outline"
              label="Termos de Uso"
              onPress={() => {
                // Navigate to terms
              }}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Política de Privacidade"
              onPress={() => {
                // Navigate to privacy
              }}
            />
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.menuCard}>
              <MenuItem
                icon="log-out-outline"
                label="Sair da conta"
                onPress={handleSignOut}
                showArrow={false}
                danger
              />
            </View>
          </View>
        )}

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>PASTITA</Text>
          <Text style={styles.storeAddress}>
            {STORE_INFO.ADDRESS}
          </Text>
          <Text style={styles.storeAddress}>
            {STORE_INFO.CITY} - {STORE_INFO.STATE}
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.marsala,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  editButton: {
    padding: SPACING.sm,
  },
  guestCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  guestTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  guestText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  authButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  authButton: {
    flex: 1,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDanger: {
    backgroundColor: COLORS.errorLight,
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuLabelDanger: {
    color: COLORS.error,
  },
  menuValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  storeInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  storeName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.marsala,
    letterSpacing: 2,
  },
  storeAddress: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
