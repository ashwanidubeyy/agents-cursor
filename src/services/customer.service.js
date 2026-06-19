import { sendSocketMessage, subscribeSocketEvent } from '@services/socket.service';
import { SOCKET_EVENTS } from '@constants/socket';

const handleIncomingMessage = (data) => data;

const sendMessage = (payload) => {
  sendSocketMessage(payload);
  return payload;
};

const subscribe = (handler) =>
  subscribeSocketEvent(SOCKET_EVENTS.MESSAGE, handler);

const CustomerService = {
  handleIncomingMessage,
  sendMessage,
  subscribe,
};

export default CustomerService;
