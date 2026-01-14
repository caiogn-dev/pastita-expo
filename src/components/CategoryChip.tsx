import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from '../utils/haptics';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ label, isSelected, onPress }) => {
  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.marsala,
    borderColor: COLORS.marsala,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  labelSelected: {
    color: COLORS.white,
  },
});

export default CategoryChip;
