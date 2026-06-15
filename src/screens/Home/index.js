import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import CustomButton from '@widgets/CustomButton';
import { APP_NAME } from '@constants';
import styles from './style';

const Home = () => {
  const isAppReady = useSelector((state) => state?.common?.isAppReady);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Welcome to ${APP_NAME}`}</Text>
      <Text style={styles.subtitle}>
        {isAppReady ? 'App is ready' : 'Booting up...'}
      </Text>
      <CustomButton title="Get Started" onPress={() => {}} />
    </View>
  );
};

export default Home;
