# NestJS WebSockets 使用指南

## 概述

`@nestjs/websockets` 是 NestJS 框架提供的 WebSocket 支持模块，它允许开发者在 NestJS 应用中轻松集成实时双向通信功能。该模块基于 Socket.IO 或原生 WebSocket 构建，提供了装饰器驱动的开发体验。

## 安装依赖

```bash
# 安装 WebSocket 核心模块
npm install @nestjs/websockets

# 如果使用 Socket.IO（推荐）
npm install @nestjs/platform-socket.io socket.io

# 如果使用原生 WebSocket
npm install @nestjs/platform-ws ws
```

## 核心概念

### 1. WebSocket Gateway（网关）

WebSocket Gateway 是处理 WebSocket 连接和消息的核心组件，类似于 HTTP 控制器。

#### 基本结构

```typescript
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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/', // 命名空间
  port: 3001,     // 可选：自定义端口
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 客户端连接时触发
  handleConnection(client: Socket) {
    console.log(`客户端连接: ${client.id}`);
  }

  // 客户端断开连接时触发
  handleDisconnect(client: Socket) {
    console.log(`客户端断开: ${client.id}`);
  }

  // 处理特定消息
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    return { event: 'message', data: `收到消息: ${data}` };
  }
}
```

### 2. 核心装饰器详解

#### @WebSocketGateway(options?)

用于标记一个类为 WebSocket 网关。

**配置选项：**
```typescript
@WebSocketGateway({
  port: 3001,           // WebSocket 服务端口
  namespace: '/chat',   // 命名空间
  cors: {               // CORS 配置
    origin: ['http://localhost:3000'],
    credentials: true
  },
  transports: ['websocket'], // 传输方式
  pingTimeout: 60000,   // ping 超时时间
  pingInterval: 25000,  // ping 间隔
})
```

#### @WebSocketServer()

注入 WebSocket 服务器实例，用于主动向客户端发送消息。

```typescript
@WebSocketServer()
server: Server;

// 使用示例
sendToAll(data: any) {
  this.server.emit('broadcast', data);
}

sendToRoom(room: string, data: any) {
  this.server.to(room).emit('roomMessage', data);
}
```

#### @SubscribeMessage(event)

监听客户端发送的特定事件。

```typescript
@SubscribeMessage('chat')
handleChat(
  @MessageBody() data: any,
  @ConnectedSocket() client: Socket
) {
  // 处理聊天消息
  return { event: 'chatResponse', data: `处理结果: ${data}` };
}
```

#### @MessageBody()

提取消息体数据。

```typescript
@SubscribeMessage('userMessage')
handleUserMessage(@MessageBody() message: string) {
  console.log('收到消息:', message);
}
```

#### @ConnectedSocket()

注入当前连接的客户端 Socket 实例。

```typescript
@SubscribeMessage('joinRoom')
handleJoinRoom(
  @MessageBody() room: string,
  @ConnectedSocket() client: Socket
) {
  client.join(room);
  client.emit('joinedRoom', room);
}
```

### 3. 生命周期接口

#### OnGatewayConnection

客户端连接时触发。

```typescript
export class ChatGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`新客户端连接: ${client.id}`);
    
    // 可以在这里进行身份验证
    const token = client.handshake.auth.token;
    if (!this.validateToken(token)) {
      client.disconnect();
      return;
    }
    
    // 加入默认房间
    client.join('general');
  }
}
```

#### OnGatewayDisconnect

客户端断开连接时触发。

```typescript
export class ChatGateway implements OnGatewayDisconnect {
  handleDisconnect(client: Socket) {
    console.log(`客户端断开: ${client.id}`);
    
    // 清理资源
    this.removeUserFromAllRooms(client.id);
  }
}
```

#### OnGatewayInit

网关初始化完成时触发。

```typescript
export class ChatGateway implements OnGatewayInit {
  afterInit(server: Server) {
    console.log('WebSocket 服务器初始化完成');
    this.server = server;
  }
}
```

### 4. 高级功能

#### 房间（Rooms）管理

```typescript
@SubscribeMessage('joinRoom')
handleJoinRoom(
  @MessageBody() data: { room: string },
  @ConnectedSocket() client: Socket
) {
  // 加入房间
  client.join(data.room);
  
  // 通知房间内其他用户
  client.to(data.room).emit('userJoined', {
    userId: client.id,
    room: data.room
  });
  
  // 确认加入
  client.emit('joinedRoom', data.room);
}

@SubscribeMessage('leaveRoom')
handleLeaveRoom(
  @MessageBody() data: { room: string },
  @ConnectedSocket() client: Socket
) {
  client.leave(data.room);
  client.to(data.room).emit('userLeft', {
    userId: client.id,
    room: data.room
  });
}

// 向特定房间发送消息
sendToRoom(room: string, event: string, data: any) {
  this.server.to(room).emit(event, data);
}
```

#### 命名空间（Namespaces）

```typescript
// 聊天命名空间
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  // 处理 /chat 命名空间的连接
}

// 通知命名空间
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationGateway {
  // 处理 /notifications 命名空间的连接
}
```

#### 中间件和守卫

```typescript
import { UseGuards, UsePipes } from '@nestjs/common';
import { WsGuard } from './ws.guard';
import { ValidationPipe } from './validation.pipe';

@UseGuards(WsGuard)
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class SecureGateway {
  @SubscribeMessage('secureMessage')
  handleSecureMessage(@MessageBody() data: any) {
    // 只有通过守卫验证的请求才能到达这里
  }
}
```

#### 异常处理

```typescript
import { WsException } from '@nestjs/websockets';

@SubscribeMessage('riskyOperation')
handleRiskyOperation(@MessageBody() data: any) {
  try {
    // 执行可能失败的操作
    this.performRiskyOperation(data);
  } catch (error) {
    throw new WsException('操作失败: ' + error.message);
  }
}
```

### 5. 模块集成

#### 在模块中注册 Gateway

```typescript
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
```

#### 在主模块中导入

```typescript
import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ChatModule],
})
export class AppModule {}
```

### 6. 客户端连接示例

#### JavaScript/TypeScript 客户端

```javascript
import { io } from 'socket.io-client';

// 连接到默认命名空间
const socket = io('http://localhost:3000');

// 连接到特定命名空间
const chatSocket = io('http://localhost:3000/chat');

// 监听连接事件
socket.on('connect', () => {
  console.log('连接成功:', socket.id);
});

// 发送消息
socket.emit('message', 'Hello Server!');

// 监听消息
socket.on('message', (data) => {
  console.log('收到消息:', data);
});

// 加入房间
socket.emit('joinRoom', { room: 'general' });

// 监听房间消息
socket.on('roomMessage', (data) => {
  console.log('房间消息:', data);
});

// 断开连接
socket.disconnect();
```

#### HTML 客户端示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket 客户端</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="输入消息">
    <button onclick="sendMessage()">发送</button>

    <script>
        const socket = io('http://localhost:3000');
        
        socket.on('connect', () => {
            console.log('连接成功');
        });
        
        socket.on('message', (data) => {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `<p>${data}</p>`;
        });
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            socket.emit('message', input.value);
            input.value = '';
        }
    </script>
</body>
</html>
```

### 7. 最佳实践

#### 1. 连接管理

```typescript
@WebSocketGateway()
export class ConnectionManagerGateway {
  private connectedClients = new Map<string, Socket>();
  
  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    console.log(`当前连接数: ${this.connectedClients.size}`);
  }
  
  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`当前连接数: ${this.connectedClients.size}`);
  }
  
  getConnectedClients(): Socket[] {
    return Array.from(this.connectedClients.values());
  }
}
```

#### 2. 消息验证

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsString()
  room?: string;
}

@SubscribeMessage('chat')
@UsePipes(new ValidationPipe())
handleChat(@MessageBody() message: MessageDto) {
  // 消息已通过验证
  return { event: 'chatResponse', data: message };
}
```

#### 3. 错误处理

```typescript
@SubscribeMessage('sensitiveOperation')
handleSensitiveOperation(@MessageBody() data: any) {
  try {
    // 执行敏感操作
    return this.performSensitiveOperation(data);
  } catch (error) {
    // 记录错误
    this.logger.error('敏感操作失败', error);
    
    // 返回用户友好的错误信息
    throw new WsException({
      error: 'OPERATION_FAILED',
      message: '操作失败，请稍后重试'
    });
  }
}
```

#### 4. 性能优化

```typescript
@WebSocketGateway({
  // 启用压缩
  compression: true,
  
  // 设置合理的超时时间
  pingTimeout: 60000,
  pingInterval: 25000,
  
  // 限制传输方式
  transports: ['websocket'],
  
  // 启用 HTTP 长轮询作为后备
  allowEIO3: true,
})
export class OptimizedGateway {
  // 使用节流避免消息过于频繁
  @SubscribeMessage('frequentMessage')
  @Throttle(10, 60) // 每分钟最多10次
  handleFrequentMessage(@MessageBody() data: any) {
    // 处理频繁消息
  }
}
```

### 8. 测试

#### 单元测试

```typescript
import { Test } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let mockSocket: Partial<Socket>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();
    
    gateway = module.get<ChatGateway>(ChatGateway);
    mockSocket = {
      id: 'test-socket-id',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    };
  });
  
  it('应该处理消息', () => {
    const result = gateway.handleMessage('test message', mockSocket as Socket);
    expect(result).toEqual({
      event: 'message',
      data: '收到消息: test message'
    });
  });
});
```

#### 集成测试

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { AppModule } from '../src/app.module';

describe('WebSocket Integration', () => {
  let app: INestApplication;
  let client: Socket;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.listen(3000);
    
    client = io('http://localhost:3000');
  });
  
  afterAll(async () => {
    client.disconnect();
    await app.close();
  });
  
  it('应该建立连接', (done) => {
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });
  });
  
  it('应该接收消息', (done) => {
    client.emit('message', 'test');
    client.on('message', (data) => {
      expect(data).toContain('test');
      done();
    });
  });
});
```

### 9. 常见问题和解决方案

#### CORS 问题

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
```

#### 身份验证

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@UseGuards(AuthGuard)
@WebSocketGateway()
export class SecureGateway {
  handleConnection(client: Socket) {
    // 连接已通过身份验证
    const user = client.data.user;
    console.log(`用户 ${user.id} 已连接`);
  }
}
```

#### 内存泄漏预防

```typescript
@WebSocketGateway()
export class MemoryEfficientGateway {
  private readonly connections = new Map<string, Socket>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  
  handleConnection(client: Socket) {
    this.connections.set(client.id, client);
    
    // 设置连接超时
    const timer = setTimeout(() => {
      client.disconnect();
    }, 300000); // 5分钟
    
    this.timers.set(client.id, timer);
  }
  
  handleDisconnect(client: Socket) {
    // 清理资源
    this.connections.delete(client.id);
    
    const timer = this.timers.get(client.id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(client.id);
    }
  }
}
```

### 10. 部署注意事项

#### 生产环境配置

```typescript
@WebSocketGateway({
  // 生产环境建议使用环境变量
  port: process.env.WS_PORT || 3001,
  
  // 严格的 CORS 配置
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
    credentials: true,
  },
  
  // 性能优化
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  
  // 启用压缩
  compression: true,
})
```

#### 负载均衡

使用 Redis 适配器支持多实例部署：

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    await Promise.all([pubClient.connect(), subClient.connect()]);
    
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }
  
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

## 总结

`@nestjs/websockets` 提供了强大而灵活的 WebSocket 支持，主要特点包括：

1. **装饰器驱动**：使用熟悉的 NestJS 装饰器模式
2. **类型安全**：完整的 TypeScript 支持
3. **灵活配置**：支持多种传输方式和配置选项
4. **生产就绪**：内置错误处理、验证和安全功能
5. **易于测试**：提供完整的测试支持
6. **可扩展**：支持中间件、守卫和管道

通过合理使用这些功能，可以构建高性能、可维护的实时应用程序。