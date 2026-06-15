import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import styles from './style';

const FilterChips = ({ options, selectedValue, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}>
      {options?.map?.((option) => {
        const isSelected = option?.value === selectedValue;
        return (
          <TouchableOpacity
            key={option?.value}
            style={[styles.chip, isSelected ? styles.chipSelected : null]}
            onPress={() => onSelect?.(option?.value)}
            accessibilityRole="button"
            accessibilityLabel={option?.label}
            accessibilityState={{ selected: isSelected }}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
              {option?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default FilterChips;
