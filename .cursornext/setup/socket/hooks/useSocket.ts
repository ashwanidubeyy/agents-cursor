'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SOCKET_EVENTS } from '@/constants/socket';
import { socketClient } from '@/lib/socketClient';

type UseSocketOptions = {
  url?: string;
  autoConnect?: boolean;
  reconnectMs?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: (event?: CloseEvent) => void;
  onError?: (error: Event) => void;
  onReconnecting?: (payload: { attempt: number; maxAttempts: number }) => void;
};

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    url,
    autoConnect = true,
    reconnectMs,
    maxReconnectAttempts,
    onMessage,
    onOpen,
    onClose,
    onError,
    onReconnecting,
  } = options;

  const [isConnected, setIsConnected] = useState(socketClient.isConnected());
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const handlersRef = useRef({ onMessage, onOpen, onClose, onError, onReconnecting });

  handlersRef.current = { onMessage, onOpen, onClose, onError, onReconnecting };

  const connect = useCallback(() => {
    if (!url) {
      return Promise.resolve();
    }
    return socketClient
      .connect(url, { reconnectMs, maxReconnectAttempts })
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        handlersRef.current.onError?.(error);
        return error;
      });
  }, [url, reconnectMs, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
    setIsConnected(false);
  }, []);

  const send = useCallback((payload: unknown) => socketClient.send(payload), []);

  useEffect(() => {
    const unsubOpen = socketClient.on(SOCKET_EVENTS.OPEN, () => {
      setIsConnected(true);
      handlersRef.current.onOpen?.();
    });

    const unsubMessage = socketClient.on(SOCKET_EVENTS.MESSAGE, (data) => {
      setLastMessage(data);
      handlersRef.current.onMessage?.(data);
    });

    const unsubClose = socketClient.on(SOCKET_EVENTS.CLOSE, (event) => {
      setIsConnected(false);
      handlersRef.current.onClose?.(event as CloseEvent);
    });

    const unsubError = socketClient.on(SOCKET_EVENTS.ERROR, (error) => {
      handlersRef.current.onError?.(error as Event);
    });

    const unsubReconnecting = socketClient.on(SOCKET_EVENTS.RECONNECTING, (payload) => {
      handlersRef.current.onReconnecting?.(
        payload as { attempt: number; maxAttempts: number },
      );
    });

    if (autoConnect && url) {
      connect();
    }

    return () => {
      unsubOpen();
      unsubMessage();
      unsubClose();
      unsubError();
      unsubReconnecting();
    };
  }, [autoConnect, url, connect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send,
  };
};
