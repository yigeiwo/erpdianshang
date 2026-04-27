import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
      ];

      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }

      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  },
  namespace: '/orders',
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);
  private connectedClients = 0;

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(`Client connected: ${client.id}, Total: ${this.connectedClients}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(`Client disconnected: ${client.id}, Total: ${this.connectedClients}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: any) {
    this.logger.log(`Client ${client.id} subscribed to order updates`);
    client.join('order-updates');
    return { event: 'subscribed', data: { success: true } };
  }

  emitNewOrders(orders: any[]) {
    if (this.connectedClients > 0) {
      this.server.to('order-updates').emit('new-orders', {
        type: 'new',
        orders,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`Emitted ${orders.length} new orders to ${this.connectedClients} clients`);
    }
  }

  emitOrderUpdate(order: any) {
    if (this.connectedClients > 0) {
      this.server.to('order-updates').emit('order-updated', {
        type: 'update',
        order,
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitSyncComplete(total: number) {
    this.server.to('order-updates').emit('sync-complete', {
      total,
      timestamp: new Date().toISOString(),
    });
  }

  emitInventoryUpdate(data: any) {
    if (this.connectedClients > 0) {
      this.server.to('order-updates').emit('inventory-update', data);
    }
  }

  emitProductUpdate(data: any) {
    if (this.connectedClients > 0) {
      this.server.to('order-updates').emit('product-update', data);
    }
  }
}