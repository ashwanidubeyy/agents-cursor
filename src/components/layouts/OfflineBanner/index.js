import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { TITLES } from '@constants/titles';
import styles from './style';

const OfflineBanner = () => {
  const isOnline = useSelector((state) => state?.common?.isOnline);

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{TITLES.LABELS.OFFLINE}</Text>
    </View>
  );
};

export default OfflineBanner;
