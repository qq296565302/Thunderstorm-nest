/**
 * WebSocket服务使用示例
 * 展示如何在其他服务中使用WebSocket功能
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from './websocket.service';

/**
 * 示例服务类
 * 演示WebSocket服务的各种使用方法
 */
@Injectable()
export class WebSocketExampleService {
  private readonly logger = new Logger(WebSocketExampleService.name);

  constructor(private readonly webSocketService: WebSocketService) {}

  /**
   * 示例1: 发送广播消息
   */
  async sendBroadcastExample() {
    this.webSocketService.broadcastToAll('announcement', {
      title: '系统公告',
      message: '欢迎使用雷雨新闻服务',
      type: 'info',
    });
    this.logger.log('广播消息已发送');
  }

  /**
   * 示例2: 推送新闻更新
   */
  async pushNewsUpdate(newsData: any) {
    const formattedNews = {
      id: newsData.id || Date.now(),
      title: newsData.title,
      content: newsData.content,
      category: newsData.category || '综合',
      source: newsData.source || '雷雨新闻',
      publishTime: new Date().toISOString(),
      imageUrl: newsData.imageUrl,
      tags: newsData.tags || [],
    };

    this.webSocketService.pushNews(formattedNews);
    this.logger.log(`新闻推送完成: ${formattedNews.title}`);
  }

  /**
   * 示例3: 推送财经数据
   */
  async pushStockUpdate(stockData: any) {
    const formattedStock = {
      symbol: stockData.symbol,
      name: stockData.name,
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent,
      volume: stockData.volume,
      marketCap: stockData.marketCap,
      updateTime: new Date().toISOString(),
    };

    this.webSocketService.pushFinanceData(formattedStock);
    this.logger.log(`股票数据推送完成: ${formattedStock.symbol}`);
  }

  /**
   * 示例4: 发送系统通知
   */
  async sendSystemNotification(type: 'info' | 'warning' | 'error' | 'success', title: string, message: string, targetRoom?: string) {
    this.webSocketService.sendNotification(
      {
        title,
        message,
        type,
        level: type === 'error' ? 'high' : type === 'warning' ? 'medium' : 'low',
      },
      targetRoom,
    );
    this.logger.log(`系统通知已发送: ${title}`);
  }

  /**
   * 示例5: 向特定客户端发送个人消息
   */
  async sendPersonalMessage(clientId: string, messageData: any) {
    this.webSocketService.sendToClient(clientId, 'personalMessage', {
      type: 'personal',
      content: messageData,
      sender: 'system',
      priority: 'normal',
    });
    this.logger.log(`个人消息已发送到客户端: ${clientId}`);
  }

  /**
   * 示例6: 向特定房间发送消息
   */
  async sendRoomMessage(roomName: string, messageData: any) {
    this.webSocketService.sendToRoom(roomName, 'roomUpdate', {
      room: roomName,
      content: messageData,
      sender: 'system',
    });
    this.logger.log(`房间消息已发送到: ${roomName}`);
  }

  /**
   * 示例7: 获取WebSocket服务状态
   */
  async getWebSocketStatus() {
    const status = this.webSocketService.getStatus();
    this.logger.log('WebSocket服务状态:', status);
    return status;
  }

  /**
   * 示例8: 批量推送新闻列表
   */
  async pushNewsList(newsList: any[]) {
    if (!this.webSocketService.isAvailable()) {
      this.logger.warn('WebSocket服务不可用，无法推送新闻列表');
      return;
    }

    const connectedClients = this.webSocketService.getConnectedClientsCount();
    if (connectedClients === 0) {
      this.logger.log('没有连接的客户端，跳过新闻推送');
      return;
    }

    for (const news of newsList) {
      await this.pushNewsUpdate(news);
      // 添加小延迟避免消息过于频繁
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.logger.log(`批量推送完成，共推送 ${newsList.length} 条新闻`);
  }

  /**
   * 示例9: 定时推送热门新闻
   */
  async startHotNewsSchedule() {
    setInterval(async () => {
      try {
        // 这里应该从数据库或API获取热门新闻
        const hotNews = {
          title: '热门新闻推送',
          content: '这是一条定时推送的热门新闻',
          category: '热点',
          source: '雷雨新闻',
          isHot: true,
        };

        await this.pushNewsUpdate(hotNews);
      } catch (error) {
        this.logger.error('定时推送热门新闻失败:', error);
      }
    }, 300000); // 每5分钟推送一次

    this.logger.log('热门新闻定时推送已启动');
  }

  /**
   * 示例10: 处理紧急新闻推送
   */
  async pushUrgentNews(newsData: any) {
    // 先发送系统通知
    await this.sendSystemNotification(
      'warning',
      '紧急新闻',
      '有重要新闻更新，请注意查看',
    );

    // 延迟一秒后推送具体新闻内容
    setTimeout(async () => {
      const urgentNews = {
        ...newsData,
        isUrgent: true,
        priority: 'high',
        category: '紧急',
      };

      await this.pushNewsUpdate(urgentNews);
    }, 1000);

    this.logger.log('紧急新闻推送完成');
  }
}

/**
 * 使用示例函数
 * 展示如何在应用启动时初始化WebSocket功能
 */
export async function initializeWebSocketExamples(exampleService: WebSocketExampleService) {
  // 发送欢迎消息
  await exampleService.sendBroadcastExample();

  // 获取服务状态
  await exampleService.getWebSocketStatus();

  // 启动定时推送（可选）
  // await exampleService.startHotNewsSchedule();
}