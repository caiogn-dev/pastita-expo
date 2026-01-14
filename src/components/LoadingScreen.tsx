import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Carregando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.marsala} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
  },
});

export default LoadingScreen;
