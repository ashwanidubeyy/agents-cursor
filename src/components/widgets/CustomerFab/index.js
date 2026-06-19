import React, { useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { SCREEN_NAMES, TITLES, TEST_IDS } from '@constants';
import { Customer_CONSTANTS } from '@constants/customer';
import { navigate } from '@utility/navigationRef';
import styles from './style';

const CustomerFab = ({ currentRoute = '' }) => {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(() => {
    navigate(SCREEN_NAMES.CUSTOMER);
  }, []);

  if (currentRoute === SCREEN_NAMES.CUSTOMER) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: insets.bottom + moderateScale(24, 0.9) }]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={TITLES.CUSTOMER.FAB_LABEL}
      testID={TEST_IDS.CUSTOMER.FAB}
      activeOpacity={0.85}>
      <Text style={styles.fabIcon}>{Customer_CONSTANTS.FAB_ICON}</Text>
    </TouchableOpacity>
  );
};

export default CustomerFab;
