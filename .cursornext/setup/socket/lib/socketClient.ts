import { SOCKET_DEFAULTS, SOCKET_EVENTS } from '@/constants/socket';

type SocketEventHandler = (payload?: unknown) => void;

class SocketClient {
  private ws: WebSocket | null = null;

  private url = '';

  private listeners = new Map<string, Set<SocketEventHandler>>();

  private reconnectAttempts = 0;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private shouldReconnect = true;

  private reconnectMs = SOCKET_DEFAULTS.RECONNECT_MS;

  private maxReconnectAttempts = SOCKET_DEFAULTS.MAX_RECONNECT_ATTEMPTS;

  on(event: string, handler: SocketEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: SocketEventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, payload?: unknown) {
    this.listeners.get(event)?.forEach((handler) => {
      handler(payload);
    });
  }

  connect(url: string, options: { shouldReconnect?: boolean; reconnectMs?: number; maxReconnectAttempts?: number } = {}) {
    if (!url) {
      return Promise.reject(new Error('Socket URL is required'));
    }

    this.url = url;
    this.shouldReconnect = options.shouldReconnect !== false;
    this.reconnectMs = options.reconnectMs ?? SOCKET_DEFAULTS.RECONNECT_MS;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts ?? SOCKET_DEFAULTS.MAX_RECONNECT_ATTEMPTS;

    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.emit(SOCKET_EVENTS.OPEN);
          resolve();
        };

        this.ws.onmessage = (event) => {
          let data: unknown = event?.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch {
              data = event?.data;
            }
          }
          this.emit(SOCKET_EVENTS.MESSAGE, data);
        };

        this.ws.onerror = (error) => {
          this.emit(SOCKET_EVENTS.ERROR, error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.emit(SOCKET_EVENTS.CLOSE, event);
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || !this.url) {
      return;
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts += 1;
    this.emit(SOCKET_EVENTS.RECONNECTING, {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url, {
        shouldReconnect: this.shouldReconnect,
        reconnectMs: this.reconnectMs,
        maxReconnectAttempts: this.maxReconnectAttempts,
      }).catch(() => {});
    }, this.reconnectMs);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  send(payload: unknown) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      return false;
    }
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.ws.send(message);
    return true;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
