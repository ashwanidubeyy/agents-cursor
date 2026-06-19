export const SOCKET_DEFAULTS = {
  RECONNECT_MS: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL_MS: 30000,
} as const;

export const SOCKET_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  MESSAGE: 'message',
  RECONNECTING: 'reconnecting',
} as const;

export const SOCKET_ALERTS = {
  CONNECTION_FAILED: 'socket.alerts.connectionFailed',
  DISCONNECTED: 'socket.alerts.disconnected',
  RECONNECTING: 'socket.alerts.reconnecting',
} as const;
