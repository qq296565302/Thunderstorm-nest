import { Module, OnModuleInit } from '@nestjs/common';
import { NewsWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WebSocketController } from './websocket.controller';

/**
 * WebSocket模块
 * 提供WebSocket网关和服务的配置和初始化
 */
@Module({
  controllers: [WebSocketController],
  providers: [NewsWebSocketGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule implements OnModuleInit {
  constructor(
    private readonly webSocketGateway: NewsWebSocketGateway,
    private readonly webSocketService: WebSocketService,
  ) {}

  /**
   * 模块初始化时设置网关实例到服务中
   */
  onModuleInit() {
    this.webSocketService.setGateway(this.webSocketGateway);
  }
}