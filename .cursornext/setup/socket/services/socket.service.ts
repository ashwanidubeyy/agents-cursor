import { socketClient } from '@/lib/socketClient';

export const connectSocket = (
  url: string,
  options?: { shouldReconnect?: boolean; reconnectMs?: number; maxReconnectAttempts?: number },
) => socketClient.connect(url, options).catch((error) => error);

export const disconnectSocket = () => {
  socketClient.disconnect();
};

export const sendSocketMessage = (payload: unknown) => socketClient.send(payload);

export const subscribeSocketEvent = (event: string, handler: (payload?: unknown) => void) =>
  socketClient.on(event, handler);

export const unsubscribeSocketEvent = (event: string, handler: (payload?: unknown) => void) =>
  socketClient.off(event, handler);

export const getSocketConnectionStatus = () => socketClient.isConnected();
