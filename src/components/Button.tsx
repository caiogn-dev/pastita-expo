import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from '../utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  onPress,
  ...props
}) => {
  const handlePress = async (event: any) => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const loaderColor = variant === 'primary' || variant === 'danger' ? COLORS.white : COLORS.marsala;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },

  // Variants
  primaryButton: {
    backgroundColor: COLORS.marsala,
  },
  secondaryButton: {
    backgroundColor: COLORS.gold,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.marsala,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },

  // Sizes
  smButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
  },
  mdButton: {
    paddingVertical: SPACING.md - 4,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  lgButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 52,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.marsalaDark,
  },
  outlineText: {
    color: COLORS.marsala,
  },
  ghostText: {
    color: COLORS.marsala,
  },
  dangerText: {
    color: COLORS.white,
  },

  // Text sizes
  smText: {
    fontSize: FONT_SIZE.sm,
  },
  mdText: {
    fontSize: FONT_SIZE.md,
  },
  lgText: {
    fontSize: FONT_SIZE.lg,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
