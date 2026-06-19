module.exports = {
  SOCKET_DEFAULTS: {
    RECONNECT_MS: 3000,
    MAX_RECONNECT_ATTEMPTS: 5,
    PING_INTERVAL_MS: 30000,
  },
  SOCKET_EVENTS: {
    OPEN: 'open',
    CLOSE: 'close',
    ERROR: 'error',
    MESSAGE: 'message',
    RECONNECTING: 'reconnecting',
  },
  SOCKET_ALERTS: {
    CONNECTION_FAILED: 'socket.alerts.connectionFailed',
    DISCONNECTED: 'socket.alerts.disconnected',
    RECONNECTING: 'socket.alerts.reconnecting',
  },
};
