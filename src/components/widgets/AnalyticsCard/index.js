import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './style';

const AnalyticsCard = ({ label, value, accentColor, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, accentColor ? { borderLeftColor: accentColor } : null]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      activeOpacity={onPress ? 0.8 : 1}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 0}</Text>
    </TouchableOpacity>
  );
};

export default AnalyticsCard;
