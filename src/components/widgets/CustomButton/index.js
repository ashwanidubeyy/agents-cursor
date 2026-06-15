import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './style';

const CustomButton = ({ title, onPress, disabled, testID }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled ? styles.disabled : null]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
      activeOpacity={0.8}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
