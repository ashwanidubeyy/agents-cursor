import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

const BaseScreen = ({ children, edges }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

export default BaseScreen;
