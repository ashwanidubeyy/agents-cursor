import { useCallback } from 'react';
import { SOCKET_EVENTS } from '@constants/socket';
import { useSocket } from '@hooks/useSocket';
import __MODULE__Service from '@services/__module__.service';

export const use__MODULE__Socket = (url) => {
  const handleMessage = useCallback((data) => {
    __MODULE__Service.handleIncomingMessage(data);
  }, []);

  const { isConnected, lastMessage, connect, disconnect, send } = useSocket({
    url,
    autoConnect: Boolean(url),
    onMessage: handleMessage,
  });

  const sendMessage = useCallback(
    (payload) => {
      send(payload);
      return __MODULE__Service.sendMessage(payload);
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
