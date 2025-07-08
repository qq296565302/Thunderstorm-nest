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
  },
  namespace: '/',
})
export class NewsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    this.logger.log(`客户端连接: ${client.id}, 当前连接数: ${this.connectedClients.size}`);
    
    // 向客户端发送连接成功消息
    client.emit('connected', {
      message: '连接成功',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 客户端断开连接时触发
   * @param client 断开连接的客户端Socket
   */
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`客户端断开连接: ${client.id}, 当前连接数: ${this.connectedClients.size}`);
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
      timestamp: new Date().toISOString(),
    });
    
    return body;
  }

  /**
   * 处理新闻推送订阅
   * @param body 订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('subscribeNews')
  handleNewsSubscription(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`客户端 ${client.id} 订阅新闻:`, body);
    
    // 将客户端加入新闻频道
    client.join('news');
    
    client.emit('subscriptionConfirmed', {
      message: '新闻订阅成功',
      subscription: body,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 处理新闻推送取消订阅
   * @param body 取消订阅信息
   * @param client 客户端Socket
   */
  @SubscribeMessage('unsubscribeNews')
  handleNewsUnsubscription(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`客户端 ${client.id} 取消订阅新闻:`, body);
    
    // 将客户端从新闻频道移除
    client.leave('news');
    
    client.emit('unsubscriptionConfirmed', {
      message: '取消新闻订阅成功',
      timestamp: new Date().toISOString(),
    });
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