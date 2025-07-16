import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

/**
 * WebSocket网关
 * 处理WebSocket连接、断开和消息传递
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*'],
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class NewsWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NewsWebSocketGateway.name);
  private connectedClients = new Map<string, Socket>();

  /**
   * 客户端连接时触发
   * @param client 连接的客户端Socket
   */
  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(
      `客户端连接: ${client.id}, 当前连接数: ${this.connectedClients.size}`,
    );

    // 向客户端发送连接成功消息
    client.emit('connected', {
      message: '连接成功',
      clientId: client.id,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', '+08:00'),
    });
  }

  /**
   * 客户端断开连接时触发
   * @param client 断开连接的客户端Socket
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(
      `客户端断开连接: ${client.id}, 当前连接数: ${this.connectedClients.size}`,
    );
  }

  /**
   * 处理客户端发送的消息
   * @param body 消息内容
   * @param client 发送消息的客户端
   */
  @SubscribeMessage('message')
  handleMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`收到来自 ${client.id} 的消息:`, body);

    // 回显消息给发送者
    client.emit('messageReceived', {
      message: '消息已收到',
      originalMessage: body,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', '+08:00'),
    });

    return body;
  }

  /**
   * 处理房间订阅（统一订阅接口）
   * @param body 订阅信息，包含 roomType 字段
   * @param client 客户端Socket
   */
  @SubscribeMessage('subscribe')
  handleRoomSubscription(
    @MessageBody() body: { roomType: string; [key: string]: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomType, ...subscriptionData } = body;

    // 验证房间类型
    const validRooms = ['news', 'finance'];
    // 获取房间中文名称
    const roomNames = {
      news: '新闻',
      finance: '财经新闻',
    };
    if (!validRooms.includes(roomType)) {
      client.emit('subscriptionError', {
        message: `无效的房间类型: ${roomType}，支持的房间类型: ${validRooms.join(', ')}`,
        timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
          .toISOString()
          .replace('Z', '+08:00'),
      });
      return;
    }

    this.logger.log(`客户端 ${client.id} 订阅房间 ${roomType}:`);

    // 将客户端加入指定房间
    client.join(roomType);

    client.emit('subscriptionConfirmed', {
      message: `${roomNames[roomType]}订阅成功`,
      roomType,
      subscription: subscriptionData,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', '+08:00'),
    });
  }

  /**
   * 处理房间取消订阅（统一取消订阅接口）
   * @param body 取消订阅信息，包含 roomType 字段
   * @param client 客户端Socket
   */
  @SubscribeMessage('unsubscribe')
  handleRoomUnsubscription(
    @MessageBody() body: { roomType: string; [key: string]: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomType, ...unsubscriptionData } = body;

    // 验证房间类型
    const validRooms = ['news', 'finance'];
    if (!validRooms.includes(roomType)) {
      client.emit('unsubscriptionError', {
        message: `无效的房间类型: ${roomType}，支持的房间类型: ${validRooms.join(', ')}`,
        timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
          .toISOString()
          .replace('Z', '+08:00'),
      });
      return;
    }

    this.logger.log(
      `客户端 ${client.id} 取消订阅房间 ${roomType}:`,
      unsubscriptionData,
    );

    // 将客户端从指定房间移除
    client.leave(roomType);

    // 获取房间中文名称
    const roomNames = {
      news: '新闻',
      finance: '财经数据',
    };

    client.emit('unsubscriptionConfirmed', {
      message: `取消${roomNames[roomType]}订阅成功`,
      roomType,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .replace('Z', '+08:00'),
    });
  }

  /**
   * 处理新闻推送订阅（兼容旧接口）
   * @param body 订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('subscribeNews')
  handleNewsSubscription(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`客户端 ${client.id} 使用旧接口订阅新闻:`, body);

    // 调用统一订阅方法
    this.handleRoomSubscription({ roomType: 'news', ...body }, client);
  }

  /**
   * 处理新闻推送取消订阅（兼容旧接口）
   * @param body 取消订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('unsubscribeNews')
  handleNewsUnsubscription(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`客户端 ${client.id} 使用旧接口取消订阅新闻:`, body);

    // 调用统一取消订阅方法
    this.handleRoomUnsubscription({ roomType: 'news', ...body }, client);
  }

  /**
   * 处理财经数据订阅
   * @param body 订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('subscribeFinance')
  handleFinanceSubscription(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`客户端 ${client.id} 订阅财经数据:`, body);

    // 调用统一订阅方法
    this.handleRoomSubscription({ roomType: 'finance', ...body }, client);
  }

  /**
   * 处理财经数据取消订阅
   * @param body 取消订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('unsubscribeFinance')
  handleFinanceUnsubscription(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`客户端 ${client.id} 取消订阅财经数据:`, body);

    // 调用统一取消订阅方法
    this.handleRoomUnsubscription({ roomType: 'finance', ...body }, client);
  }

  /**
   * 获取当前连接的客户端数量
   * @returns 连接数量
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * 获取所有连接的客户端ID
   * @returns 客户端ID数组
   */
  getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
