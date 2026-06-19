import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard, TicketList, TicketDetails, CreateTicket, Unauthorized, Customer } from '@screens';
import { SCREEN_NAMES } from '@constants';
import { getCurrentRouteName, navigationRef } from '@utility/navigationRef';
import CustomerFab from '@widgets/CustomerFab';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const AppRouteConfig = () => {
  const [currentRoute, setCurrentRoute] = useState('');

  const syncRoute = useCallback(() => {
    setCurrentRoute(getCurrentRouteName());
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={syncRoute}
      onStateChange={syncRoute}>
      <View style={styles.root}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={SCREEN_NAMES.DASHBOARD} component={Dashboard} />
          <Stack.Screen name={SCREEN_NAMES.TICKET_LIST} component={TicketList} />
          <Stack.Screen name={SCREEN_NAMES.TICKET_DETAILS} component={TicketDetails} />
          <Stack.Screen
            name={SCREEN_NAMES.CREATE_TICKET}
            component={CreateTicket}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name={SCREEN_NAMES.UNAUTHORIZED} component={Unauthorized} />
          <Stack.Screen name={SCREEN_NAMES.CUSTOMER} component={Customer} />
        </Stack.Navigator>
        <CustomerFab currentRoute={currentRoute} />
      </View>
    </NavigationContainer>
  );
};

export default AppRouteConfig;
