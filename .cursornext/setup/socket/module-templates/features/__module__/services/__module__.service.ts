import { SOCKET_EVENTS } from '@/constants/socket';
import {
  sendSocketMessage,
  subscribeSocketEvent,
} from '@/services/socket.service';

const handleIncomingMessage = (data: unknown) => data;

const sendMessage = (payload: unknown) => {
  sendSocketMessage(payload);
  return payload;
};

const subscribe = (handler: (data: unknown) => void) =>
  subscribeSocketEvent(SOCKET_EVENTS.MESSAGE, handler);

export const __module__Service = {
  handleIncomingMessage,
  sendMessage,
  subscribe,
};
