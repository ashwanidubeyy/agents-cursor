import { useCallback } from 'react';
import { SOCKET_EVENTS } from '@constants/socket';
import { useSocket } from '@hooks/useSocket';
import CustomerService from '@services/customer.service';

export const useCustomerSocket = (url) => {
  const handleMessage = useCallback((data) => {
    CustomerService.handleIncomingMessage(data);
  }, []);

  const { isConnected, lastMessage, connect, disconnect, send } = useSocket({
    url,
    autoConnect: Boolean(url),
    onMessage: handleMessage,
  });

  const sendMessage = useCallback(
    (payload) => {
      send(payload);
      return CustomerService.sendMessage(payload);
    },
    [send],
  );

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    events: SOCKET_EVENTS,
  };
};
