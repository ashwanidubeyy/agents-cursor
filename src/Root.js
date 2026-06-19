import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createAppStore } from '@store';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import Toast from '@widgets/Toast';
import AppRouteConfig from '@/AppRouteConfig';
import NetworkGate from '@layouts/NetworkGate';

const store = createAppStore();

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const AppContent = () => {
  useNetworkStatus();
  return (
    <View style={styles.root} testID="app-root">
      <NetworkGate>
        <AppRouteConfig />
      </NetworkGate>
      <Toast />
    </View>
  );
};

const Root = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default Root;
