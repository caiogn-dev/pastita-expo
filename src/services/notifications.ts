import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/config';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationState {
  token: string | null;
  notification: Notifications.Notification | null;
}

export const registerForPushNotifications = async (): Promise<string | null> => {
  let token: string | null = null;

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'pastita-mobile-app',
    });
    token = tokenData.data;

    // Store token locally
    await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

    console.log('Push token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Pastita',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#722F37',
    });

    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Pedidos',
      description: 'Notificações sobre seus pedidos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#722F37',
    });
  }

  return token;
};

export const getPushToken = async (): Promise<string | null> => {
  return await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null,
  });
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

export const removeNotificationSubscription = (
  subscription: Notifications.Subscription
): void => {
  Notifications.removeNotificationSubscription(subscription);
};

// Order status notification helpers
export const notifyOrderStatusChange = async (
  orderNumber: string,
  status: string
): Promise<void> => {
  const statusMessages: Record<string, { title: string; body: string }> = {
    confirmed: {
      title: 'Pedido Confirmado! ✅',
      body: `Seu pedido #${orderNumber} foi confirmado e está sendo preparado.`,
    },
    preparing: {
      title: 'Preparando seu Pedido 👨‍🍳',
      body: `Seu pedido #${orderNumber} está sendo preparado com carinho.`,
    },
    ready: {
      title: 'Pedido Pronto! 🎉',
      body: `Seu pedido #${orderNumber} está pronto para entrega/retirada.`,
    },
    out_for_delivery: {
      title: 'Saiu para Entrega! 🚗',
      body: `Seu pedido #${orderNumber} está a caminho!`,
    },
    delivered: {
      title: 'Pedido Entregue! 🍝',
      body: `Seu pedido #${orderNumber} foi entregue. Bom apetite!`,
    },
    cancelled: {
      title: 'Pedido Cancelado',
      body: `Seu pedido #${orderNumber} foi cancelado.`,
    },
  };

  const message = statusMessages[status];
  if (message) {
    await scheduleLocalNotification(message.title, message.body, {
      type: 'order_status',
      orderNumber,
      status,
    });
  }
};

export default {
  registerForPushNotifications,
  getPushToken,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  getBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
  notifyOrderStatusChange,
};
