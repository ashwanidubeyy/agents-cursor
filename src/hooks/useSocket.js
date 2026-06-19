import { useCallback, useEffect, useRef, useState } from 'react';
import { SOCKET_EVENTS } from '@constants/socket';
import { socketClient } from '@utility/socketClient';

export const useSocket = (options = {}) => {
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
  const [lastMessage, setLastMessage] = useState(null);
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

  const send = useCallback((payload) => socketClient.send(payload), []);

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
      handlersRef.current.onClose?.(event);
    });

    const unsubError = socketClient.on(SOCKET_EVENTS.ERROR, (error) => {
      handlersRef.current.onError?.(error);
    });

    const unsubReconnecting = socketClient.on(
      SOCKET_EVENTS.RECONNECTING,
      (payload) => {
        handlersRef.current.onReconnecting?.(payload);
      },
    );

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
