import { io, Socket } from 'socket.io-client';

type SocketCallback = (data: unknown) => void;

interface SocketData {
  newOrders?: unknown[];
  orderUpdated?: unknown;
  syncComplete?: { synced: number };
}

class OrderSocket {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketCallback>> = new Map();
  private readonly maxReconnectAttempts = 10;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('/orders', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('subscribe');
    });

    this.socket.on('new-orders', (data: SocketData) => {
      this.emit('new-orders', data);
    });

    this.socket.on('order-updated', (data: SocketData) => {
      this.emit('order-updated', data);
    });

    this.socket.on('sync-complete', (data: SocketData) => {
      this.emit('sync-complete', data);
    });

    this.socket.on('disconnect', () => {
    });

    this.socket.on('error', () => {
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: SocketCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: SocketData) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
  }
}

export const orderSocket = new OrderSocket();