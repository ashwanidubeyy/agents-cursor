import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dashboard, TicketList, TicketDetails, CreateTicket, Unauthorized } from '@screens';
import { SCREEN_NAMES } from '@constants';
import { navigationRef } from '@utility/navigationRef';

const Stack = createNativeStackNavigator();

const AppRouteConfig = () => {
  return (
    <NavigationContainer ref={navigationRef}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRouteConfig;
