# WebSocket服务模块使用说明

## 概述

本项目提供了一个完整的WebSocket服务模块，采用单例模式设计，支持全局使用。该模块基于NestJS和Socket.IO构建，提供了实时双向通信功能。

## 功能特性

- ✅ 单例模式设计，全局唯一实例
- ✅ 支持客户端连接管理
- ✅ 支持房间（Room）功能
- ✅ 支持广播消息
- ✅ 支持点对点消息
- ✅ 支持新闻推送订阅
- ✅ 支持财经数据推送
- ✅ 支持系统通知
- ✅ 提供HTTP API接口用于测试
- ✅ 完整的日志记录

## 模块结构

```
src/websocket/
├── websocket.gateway.ts     # WebSocket网关，处理连接和消息
├── websocket.service.ts     # WebSocket服务，单例模式，提供全局方法
├── websocket.controller.ts  # HTTP控制器，用于测试WebSocket功能
├── websocket.module.ts      # WebSocket模块配置
└── index.ts                 # 统一导出文件
```

## 安装依赖

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

## 使用方法

### 1. 在其他模块中使用WebSocket服务

```typescript
import { Injectable } from '@nestjs/common';
import { WebSocketService } from '../websocket';

@Injectable()
export class YourService {
  constructor(private readonly webSocketService: WebSocketService) {}

  // 发送广播消息
  sendBroadcast() {
    this.webSocketService.broadcastToAll('announcement', {
      message: '这是一条广播消息',
      type: 'info'
    });
  }

  // 推送新闻
  pushNews(newsData: any) {
    this.webSocketService.pushNews(newsData);
  }

  // 发送通知
  sendNotification(notification: any) {
    this.webSocketService.sendNotification(notification);
  }
}
```

### 2. 获取WebSocket服务单例实例

```typescript
import { WebSocketService } from '../websocket';

// 方法1：通过依赖注入（推荐）
constructor(private readonly webSocketService: WebSocketService) {}

// 方法2：直接获取单例实例
const wsService = WebSocketService.getInstance();
```

### 3. 主要API方法

#### 广播消息
```typescript
// 向所有连接的客户端发送消息
webSocketService.broadcastToAll('eventName', data);
```

#### 房间消息
```typescript
// 向指定房间发送消息
webSocketService.sendToRoom('roomName', 'eventName', data);
```

#### 点对点消息
```typescript
// 向指定客户端发送消息
webSocketService.sendToClient('clientId', 'eventName', data);
```

#### 新闻推送
```typescript
// 推送新闻到订阅的客户端
webSocketService.pushNews({
  title: '新闻标题',
  content: '新闻内容',
  category: '科技',
  source: '新闻来源'
});
```

#### 财经数据推送
```typescript
// 推送财经数据
webSocketService.pushFinanceData({
  symbol: 'AAPL',
  price: 150.25,
  change: 2.5,
  volume: 1000000
});
```

#### 系统通知
```typescript
// 发送系统通知
webSocketService.sendNotification({
  title: '系统维护通知',
  message: '系统将于今晚进行维护',
  type: 'warning'
});
```

#### 服务状态查询
```typescript
// 检查服务是否可用
const isAvailable = webSocketService.isAvailable();

// 获取连接的客户端数量
const clientCount = webSocketService.getConnectedClientsCount();

// 获取所有客户端ID
const clientIds = webSocketService.getConnectedClientIds();

// 获取完整状态信息
const status = webSocketService.getStatus();
```

## HTTP API接口

服务提供了HTTP接口用于测试WebSocket功能：

### 获取服务状态
```http
GET /websocket/status
```

### 广播消息
```http
POST /websocket/broadcast
Content-Type: application/json

{
  "event": "announcement",
  "data": {
    "message": "这是一条广播消息",
    "type": "info"
  }
}
```

### 房间消息
```http
POST /websocket/room/{roomName}
Content-Type: application/json

{
  "event": "roomMessage",
  "data": {
    "message": "房间消息内容"
  }
}
```

### 客户端消息
```http
POST /websocket/client/{clientId}
Content-Type: application/json

{
  "event": "privateMessage",
  "data": {
    "message": "私人消息内容"
  }
}
```

### 新闻推送
```http
POST /websocket/news/push
Content-Type: application/json

{
  "title": "重要新闻",
  "content": "新闻详细内容",
  "category": "科技",
  "source": "科技日报"
}
```

### 财经数据推送
```http
POST /websocket/finance/push
Content-Type: application/json

{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.5,
  "volume": 1000000
}
```

### 系统通知
```http
POST /websocket/notification
Content-Type: application/json

{
  "title": "系统通知",
  "message": "通知内容",
  "type": "info",
  "targetRoom": "news"
}
```

## 客户端连接示例

### JavaScript/TypeScript客户端

```javascript
import { io } from 'socket.io-client';

// 连接到WebSocket服务器
const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

// 监听连接成功事件
socket.on('connected', (data) => {
  console.log('连接成功:', data);
});

// 监听消息
socket.on('message', (data) => {
  console.log('收到消息:', data);
});

// 监听新闻推送
socket.on('newsPush', (data) => {
  console.log('收到新闻推送:', data);
});

// 监听财经数据推送
socket.on('financePush', (data) => {
  console.log('收到财经数据:', data);
});

// 监听系统通知
socket.on('notification', (data) => {
  console.log('收到系统通知:', data);
});

// 发送消息
socket.emit('message', {
  type: 'chat',
  content: 'Hello Server!'
});

// 订阅新闻
socket.emit('subscribeNews', {
  categories: ['科技', '财经']
});

// 取消订阅新闻
socket.emit('unsubscribeNews', {});
```

### HTML客户端示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket客户端测试</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="输入消息">
    <button onclick="sendMessage()">发送消息</button>
    <button onclick="subscribeNews()">订阅新闻</button>

    <script>
        const socket = io('http://localhost:3000');
        const messagesDiv = document.getElementById('messages');

        // 连接成功
        socket.on('connected', (data) => {
            addMessage('连接成功: ' + JSON.stringify(data));
        });

        // 接收消息
        socket.on('messageReceived', (data) => {
            addMessage('消息确认: ' + JSON.stringify(data));
        });

        // 接收新闻推送
        socket.on('newsPush', (data) => {
            addMessage('新闻推送: ' + JSON.stringify(data));
        });

        // 接收通知
        socket.on('notification', (data) => {
            addMessage('系统通知: ' + JSON.stringify(data));
        });

        function addMessage(message) {
            const div = document.createElement('div');
            div.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            messagesDiv.appendChild(div);
        }

        function sendMessage() {
            const input = document.getElementById('messageInput');
            socket.emit('message', {
                type: 'chat',
                content: input.value
            });
            input.value = '';
        }

        function subscribeNews() {
            socket.emit('subscribeNews', {
                categories: ['科技', '财经']
            });
        }
    </script>
</body>
</html>
```

## 事件说明

### 客户端可发送的事件

- `message`: 发送普通消息
- `subscribeNews`: 订阅新闻推送
- `unsubscribeNews`: 取消订阅新闻推送

### 服务器发送的事件

- `connected`: 连接成功确认
- `messageReceived`: 消息接收确认
- `subscriptionConfirmed`: 订阅确认
- `unsubscriptionConfirmed`: 取消订阅确认
- `newsPush`: 新闻推送
- `financePush`: 财经数据推送
- `notification`: 系统通知

## 配置说明

### CORS配置

WebSocket网关默认允许所有来源的连接，生产环境中建议修改CORS配置：

```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/',
})
```

### 端口配置

WebSocket服务默认使用与HTTP服务相同的端口。如需自定义端口：

```typescript
@WebSocketGateway({
  port: 3001, // 自定义端口
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

## 注意事项

1. **单例模式**: WebSocketService采用单例模式，确保全局只有一个实例
2. **模块初始化**: 确保WebSocketModule已在AppModule中导入
3. **错误处理**: 服务会自动检查WebSocket服务器是否可用，避免在未初始化时发送消息
4. **日志记录**: 所有WebSocket操作都会记录日志，便于调试和监控
5. **内存管理**: 客户端断开连接时会自动清理相关资源

## 故障排除

### 常见问题

1. **连接失败**
   - 检查CORS配置
   - 确认端口是否正确
   - 检查防火墙设置

2. **消息发送失败**
   - 确认WebSocket服务是否已初始化
   - 检查客户端是否已连接
   - 查看服务器日志

3. **房间功能不工作**
   - 确认客户端已加入对应房间
   - 检查房间名称是否正确

### 调试方法

1. 使用HTTP API接口测试功能
2. 查看服务器控制台日志
3. 使用浏览器开发者工具检查WebSocket连接
4. 调用`getStatus()`方法查看服务状态

## 扩展功能

可以根据需要扩展以下功能：

1. **身份验证**: 添加JWT token验证
2. **消息持久化**: 将消息保存到数据库
3. **消息队列**: 集成Redis等消息队列
4. **集群支持**: 支持多实例部署
5. **消息加密**: 添加端到端加密

## 性能优化

1. **连接池管理**: 限制最大连接数
2. **消息压缩**: 启用消息压缩
3. **心跳检测**: 定期检查连接状态
4. **负载均衡**: 使用Redis适配器支持多实例

---

更多详细信息请参考NestJS和Socket.IO官方文档。