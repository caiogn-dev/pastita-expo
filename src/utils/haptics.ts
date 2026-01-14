import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Safe haptics utilities that work on all platforms including web
 */

export const impactAsync = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(style);
  } catch (e) {
    // Ignore haptics errors on unsupported platforms
  }
};

export const notificationAsync = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(type);
  } catch (e) {
    // Ignore haptics errors on unsupported platforms
  }
};

export const selectionAsync = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch (e) {
    // Ignore haptics errors on unsupported platforms
  }
};

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

export default {
  impactAsync,
  notificationAsync,
  selectionAsync,
};
