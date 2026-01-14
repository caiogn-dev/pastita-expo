import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';
import { useAuth } from '../../src/context';
import { getUserOrders } from '../../src/services/storeApi';
import { OrderCard, EmptyState, LoadingScreen, Button } from '../../src/components';
import type { Order } from '../../src/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getUserOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Pedidos</Text>
        </View>
        <EmptyState
          icon="log-in-outline"
          title="Faça login para ver seus pedidos"
          description="Entre na sua conta para acompanhar seus pedidos"
          actionLabel="Entrar"
          onAction={() => router.push('/auth/login')}
        />
      </SafeAreaView>
    );
  }

  if (isLoading && !refreshing) {
    return <LoadingScreen message="Carregando pedidos..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Pedidos</Text>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Erro ao carregar"
          description={error}
          actionLabel="Tentar novamente"
          onAction={fetchOrders}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Meus Pedidos</Text>
            {orders.length > 0 && (
              <Text style={styles.subtitle}>
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Nenhum pedido ainda"
            description="Seus pedidos aparecerão aqui"
            actionLabel="Fazer primeiro pedido"
            onAction={() => router.push('/cardapio')}
          />
        }
        contentContainerStyle={styles.listContent}
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.marsala,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
});
