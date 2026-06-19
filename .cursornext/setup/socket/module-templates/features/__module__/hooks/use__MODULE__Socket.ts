'use client';

import { useCallback } from 'react';
import { SOCKET_EVENTS } from '@/constants/socket';
import { useSocket } from '@/hooks/useSocket';
import { __module__Service } from '@/features/__module__/services/__module__.service';

export const use__MODULE__Socket = (url?: string) => {
  const handleMessage = useCallback((data: unknown) => {
    __module__Service.handleIncomingMessage(data);
  }, []);

  const { isConnected, lastMessage, connect, disconnect, send } = useSocket({
    url,
    autoConnect: Boolean(url),
    onMessage: handleMessage,
  });

  const sendMessage = useCallback(
    (payload: unknown) => {
      send(payload);
      return __module__Service.sendMessage(payload);
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
