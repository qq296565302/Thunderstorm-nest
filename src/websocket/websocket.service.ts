import { Injectable, Logger } from '@nestjs/common';
import { NewsWebSocketGateway } from './websocket.gateway';

/**
 * WebSocket消息接口
 */
export interface WebSocketMessage {
  event: string;
  data: any;
  room?: string;
  clientId?: string;
}

/**
 * WebSocket服务类 - 单例模式
 * 提供全局WebSocket消息发送和接收功能
 */
@Injectable()
export class WebSocketService {
  private static instance: WebSocketService;
  private readonly logger = new Logger(WebSocketService.name);
  private gateway: NewsWebSocketGateway;

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    WebSocketService.instance = this;
  }

  /**
   * 获取WebSocketService单例实例
   * @returns WebSocketService实例
   */
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * 设置WebSocket网关实例
   * @param gateway WebSocket网关实例
   */
  setGateway(gateway: NewsWebSocketGateway): void {
    this.gateway = gateway;
    this.logger.log('WebSocket网关已设置');
  }

  /**
   * 向所有连接的客户端广播消息
   * @param event 事件名称
   * @param data 消息数据
   * @returns 发送的客户端数量
   */
  broadcastToAll(event: string, data: any): number {
    if (!this.gateway?.server) {
      this.logger.warn('WebSocket服务器未初始化，无法发送广播消息');
      return 0;
    }

    const connectedCount = this.getConnectedClientsCount();
    if (connectedCount === 0) {
      this.logger.warn(`没有连接的客户端，无法广播消息: ${event}`);
      return 0;
    }

    const messageData = {
      ...data,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };

    // 使用 sockets.emit 确保发送到所有连接的客户端
    this.gateway.server.emit(event, messageData);
    
    this.logger.log(`广播消息到 ${connectedCount} 个客户端: ${event}`);
    
    return connectedCount;
  }

  /**
   * 向指定房间发送消息
   * @param room 房间名称
   * @param event 事件名称
   * @param data 消息数据
   */
  sendToRoom(room: string, event: string, data: any): void {
    if (!this.gateway?.server) {
      this.logger.warn('WebSocket服务器未初始化，无法发送房间消息');
      return;
    }

    this.gateway.server.to(room).emit(event, {
      ...data,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    });
    
    this.logger.log(`发送消息到房间 ${room}: ${event}`, data);
  }

  /**
   * 向指定客户端发送消息
   * @param clientId 客户端ID
   * @param event 事件名称
   * @param data 消息数据
   * @returns 是否发送成功
   */
  sendToClient(clientId: string, event: string, data: any): boolean {
    if (!this.gateway?.server) {
      this.logger.warn('WebSocket服务器未初始化，无法发送客户端消息');
      return false;
    }

    const clientIds = this.getConnectedClientIds();
    if (!clientIds.includes(clientId)) {
      this.logger.warn(`客户端 ${clientId} 未连接，无法发送消息`);
      return false;
    }

    const messageData = {
      ...data,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };

    this.gateway.server.to(clientId).emit(event, messageData);
    
    this.logger.log(`发送消息到客户端 ${clientId}: ${event}`, {
      event,
      clientId,
      messageData
    });
    
    return true;
  }

  /**
   * 发送新闻推送到订阅的客户端
   * @param newsData 新闻数据
   */
  pushNews(newsData: any): void {
    this.sendToRoom('news', 'newsPush', {
      type: 'news',
      content: newsData,
      message: '新闻推送',
    });
  }

  /**
   * 发送财经数据推送
   * @param financeData 财经数据
   */
  pushFinanceData(financeData: any): void {
    this.sendToRoom('finance', 'financePush', {
      type: 'finance',
      content: financeData,
      message: '财经数据推送',
    });
  }

  /**
   * 发送系统通知
   * @param notification 通知内容
   * @param targetRoom 目标房间（可选，不指定则广播给所有客户端）
   */
  sendNotification(notification: any, targetRoom?: string): void {
    const notificationData = {
      type: 'notification',
      content: notification,
      message: '系统通知',
    };

    if (targetRoom) {
      this.sendToRoom(targetRoom, 'notification', notificationData);
    } else {
      this.broadcastToAll('notification', notificationData);
    }
  }

  /**
   * 获取当前连接的客户端数量
   * @returns 连接数量
   */
  getConnectedClientsCount(): number {
    return this.gateway?.getConnectedClientsCount() || 0;
  }

  /**
   * 获取所有连接的客户端ID
   * @returns 客户端ID数组
   */
  getConnectedClientIds(): string[] {
    return this.gateway?.getConnectedClientIds() || [];
  }

  /**
   * 检查WebSocket服务是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return !!(this.gateway?.server);
  }

  /**
   * 获取WebSocket服务器状态信息
   * @returns 状态信息
   */
  getStatus(): any {
    return {
      isAvailable: this.isAvailable(),
      connectedClients: this.getConnectedClientsCount(),
      clientIds: this.getConnectedClientIds(),
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };
  }

  /**
   * 强制向所有客户端发送心跳消息
   * @returns 发送结果
   */
  sendHeartbeat(): number {
    return this.broadcastToAll('heartbeat', {
      message: 'Server heartbeat',
      serverTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00')
    });
  }
}