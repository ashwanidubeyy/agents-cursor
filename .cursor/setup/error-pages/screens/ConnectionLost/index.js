import React from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';
import BaseScreen from '@layouts/BaseScreen';
import CustomButton from '@widgets/CustomButton';
import { setOnlineStatus } from '@store/Common/actions';
import { TITLES, TEST_IDS } from '@constants';
import styles from './style';

const ConnectionLost = () => {
  const dispatch = useDispatch();

  const handleRetry = () => {
    NetInfo.fetch().then((state) => {
      const isConnected =
        state?.isConnected === true && state?.isInternetReachable !== false;
      dispatch(setOnlineStatus(isConnected));
    });
  };

  return (
    <BaseScreen>
      <View style={styles.container} testID={TEST_IDS.ERROR_PAGES.CONNECTION_LOST}>
        <Text style={styles.title}>
          {TITLES.ERROR_PAGES.CONNECTION_LOST.TITLE}
        </Text>
        <Text style={styles.message}>
          {TITLES.ERROR_PAGES.CONNECTION_LOST.MESSAGE}
        </Text>
        <CustomButton
          title={TITLES.ERROR_PAGES.CONNECTION_LOST.RETRY}
          onPress={handleRetry}
          testID={TEST_IDS.ERROR_PAGES.CONNECTION_LOST_RETRY}
        />
      </View>
    </BaseScreen>
  );
};

export default ConnectionLost;
