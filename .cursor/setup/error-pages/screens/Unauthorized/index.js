import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BaseScreen from '@layouts/BaseScreen';
import CustomButton from '@widgets/CustomButton';
import { TITLES, TEST_IDS } from '@constants';
import styles from './style';

const Unauthorized = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  return (
    <BaseScreen>
      <View style={styles.container} testID={TEST_IDS.ERROR_PAGES.UNAUTHORIZED}>
        <Text style={styles.title}>{TITLES.ERROR_PAGES.UNAUTHORIZED.TITLE}</Text>
        <Text style={styles.message}>
          {TITLES.ERROR_PAGES.UNAUTHORIZED.MESSAGE}
        </Text>
        <CustomButton
          title={TITLES.ERROR_PAGES.UNAUTHORIZED.GO_BACK}
          onPress={handleGoBack}
          testID={TEST_IDS.ERROR_PAGES.UNAUTHORIZED_GO_BACK}
        />
      </View>
    </BaseScreen>
  );
};

export default Unauthorized;
