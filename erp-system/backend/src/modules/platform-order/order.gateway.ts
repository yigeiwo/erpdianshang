import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface OrderUpdatePayload {
  type: string;
  order?: unknown;
  orders?: unknown[];
  total?: number;
  timestamp: string;
}

interface SubscribePayload {
  userId?: string;
}

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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, @MessageBody() payload: SubscribePayload) {
    this.logger.log(`Client ${client.id} subscribed to order updates`);
    client.join('order-updates');
    return { event: 'subscribed', data: { success: true } };
  }

  emitNewOrders(orders: unknown[]) {
    this.server.to('order-updates').emit('new-orders', {
      type: 'new',
      orders,
      timestamp: new Date().toISOString(),
    } as OrderUpdatePayload);
    this.logger.log(`Emitted ${orders.length} new orders`);
  }

  emitOrderUpdate(order: unknown) {
    this.server.to('order-updates').emit('order-updated', {
      type: 'update',
      order,
      timestamp: new Date().toISOString(),
    } as OrderUpdatePayload);
  }

  emitSyncComplete(total: number) {
    this.server.to('order-updates').emit('sync-complete', {
      type: 'sync',
      total,
      timestamp: new Date().toISOString(),
    } as OrderUpdatePayload);
  }

  emitInventoryUpdate(data: unknown) {
    this.server.to('order-updates').emit('inventory-update', data);
  }

  emitProductUpdate(data: unknown) {
    this.server.to('order-updates').emit('product-update', data);
  }
}