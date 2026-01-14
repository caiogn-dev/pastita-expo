import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const showPassword = isPassword && isPasswordVisible;

  const inputContainerStyles: any[] = [
    styles.inputContainer,
    isFocused ? styles.inputContainerFocused : null,
    error ? styles.inputContainerError : null,
  ].filter(Boolean);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyles}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? COLORS.error : isFocused ? COLORS.marsala : COLORS.gray400}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
          placeholderTextColor={COLORS.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={error ? COLORS.error : COLORS.gray400}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: COLORS.marsala,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  rightIconButton: {
    padding: SPACING.md,
  },
  error: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
});

export default Input;
