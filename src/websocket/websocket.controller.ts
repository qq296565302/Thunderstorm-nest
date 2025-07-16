import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebSocketService } from './websocket.service';

/**
 * WebSocket控制器
 * 提供HTTP接口来测试和管理WebSocket功能
 */
@ApiTags('WebSocket')
@Controller('websocket')
export class WebSocketController {
  constructor(private readonly webSocketService: WebSocketService) {}

  /**
   * 获取WebSocket服务状态
   * @returns WebSocket服务状态信息
   */
  @Get('status')
  @ApiOperation({ summary: '获取WebSocket服务状态' })
  @ApiResponse({ status: 200, description: '返回WebSocket服务状态信息' })
  getStatus() {
    return this.webSocketService.getStatus();
  }

  /**
   * 向所有客户端广播消息
   * @param body 消息内容
   * @returns 操作结果
   */
  @Post('broadcast')
  @ApiOperation({ summary: '向所有客户端广播消息' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', description: '事件名称' },
        data: { type: 'object', description: '消息数据' },
      },
      required: ['event', 'data'],
    },
  })
  @ApiResponse({ status: 200, description: '消息广播成功' })
  broadcastMessage(@Body() body: { event: string; data: any }) {
    this.webSocketService.broadcastToAll(body.event, body.data);
    return {
      success: true,
      message: '消息已广播到所有客户端',
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };
  }

  /**
   * 向指定房间发送消息
   * @param room 房间名称
   * @param body 消息内容
   * @returns 操作结果
   */
  @Post('room/:room')
  @ApiOperation({ summary: '向指定房间发送消息' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', description: '事件名称' },
        data: { type: 'object', description: '消息数据' },
      },
      required: ['event', 'data'],
    },
  })
  @ApiResponse({ status: 200, description: '消息发送成功' })
  sendToRoom(@Param('room') room: string, @Body() body: { event: string; data: any }) {
    this.webSocketService.sendToRoom(room, body.event, body.data);
    return {
      success: true,
      message: `消息已发送到房间: ${room}`,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };
  }

  /**
   * 向指定客户端发送消息
   * @param clientId 客户端ID
   * @param body 消息内容
   * @returns 操作结果
   */
  @Post('client/:clientId')
  @ApiOperation({ summary: '向指定客户端发送消息' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', description: '事件名称' },
        data: { type: 'object', description: '消息数据' },
      },
      required: ['event', 'data'],
    },
  })
  @ApiResponse({ status: 200, description: '消息发送成功' })
  sendToClient(@Param('clientId') clientId: string, @Body() body: { event: string; data: any }) {
    this.webSocketService.sendToClient(clientId, body.event, body.data);
    return {
      success: true,
      message: `消息已发送到客户端: ${clientId}`,
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };
  }

  /**
   * 发送系统通知
   * @param body 通知内容
   * @returns 操作结果
   */
  @Post('notification')
  @ApiOperation({ summary: '发送系统通知' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '通知标题' },
        message: { type: 'string', description: '通知内容' },
        type: { type: 'string', description: '通知类型', enum: ['info', 'warning', 'error', 'success'] },
        targetRoom: { type: 'string', description: '目标房间（可选）' },
      },
      required: ['title', 'message'],
    },
  })
  @ApiResponse({ status: 200, description: '通知发送成功' })
  sendNotification(@Body() body: { title: string; message: string; type?: string; targetRoom?: string }) {
    this.webSocketService.sendNotification(
      {
        title: body.title,
        message: body.message,
        type: body.type || 'info',
      },
      body.targetRoom,
    );
    return {
      success: true,
      message: '系统通知已发送',
      timestamp: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00'),
    };
  }
}