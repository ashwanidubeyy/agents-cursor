import { socketClient } from '@utility/socketClient';

export const connectSocket = (url, options = {}) =>
  socketClient.connect(url, options).catch((error) => error);

export const disconnectSocket = () => {
  socketClient.disconnect();
};

export const sendSocketMessage = (payload) => socketClient.send(payload);

export const subscribeSocketEvent = (event, handler) =>
  socketClient.on(event, handler);

export const unsubscribeSocketEvent = (event, handler) =>
  socketClient.off(event, handler);

export const getSocketConnectionStatus = () => socketClient.isConnected();
