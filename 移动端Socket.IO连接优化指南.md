# 移动端Socket.IO连接优化指南

## 问题描述

在安卓系统中，当用户点击通知跳转到应用时，Socket.IO连接经常会被断开。这是由于以下原因：

1. **应用生命周期变化**：通知点击可能导致Activity重建或WebView刷新
2. **网络状态切换**：Wi-Fi/蜂窝网络切换或代理变化
3. **系统节能策略**：安卓Doze模式和后台限制
4. **心跳超时**：后台时心跳包延迟导致服务端判定连接断开

## 服务端优化（已完成）

### 1. WebSocket网关配置优化

```typescript
@WebSocketGateway({
  // 针对移动端优化：增加心跳超时时间
  pingTimeout: 180000, // 3分钟，适应安卓后台限制
  pingInterval: 25000,  // 25秒发送一次心跳
  
  // 启用连接状态恢复，减少短暂断线的影响
  connectionStateRecovery: {
    maxDisconnectionDuration: 300000, // 5分钟内可恢复
    skipMiddlewares: true,
  },
  
  // 优化传输配置
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
})
```

### 2. 连接恢复检测

服务端现在能够：
- 检测恢复的连接并发送特殊标识
- 监听客户端应用状态变化
- 提供连接恢复通知功能

## 客户端优化建议

### 1. React Native / Expo 客户端

```javascript
import io from 'socket.io-client';
import { AppState } from 'react-native';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.subscribedRooms = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = Infinity;
    
    // 监听应用状态变化
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  connect() {
    this.socket = io('ws://your-server-url', {
      // 启用自动重连
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      
      // 优先使用WebSocket
      transports: ['websocket', 'polling'],
      
      // 启用连接状态恢复
      forceNew: false,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // 连接成功
    this.socket.on('connect', () => {
      console.log('Socket连接成功:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 重新订阅所有房间
      this.resubscribeRooms();
    });

    // 连接恢复
    this.socket.on('connected', (data) => {
      if (data.isRecovered) {
        console.log('连接已恢复，无需重新订阅');
      } else {
        console.log('新连接建立');
      }
    });

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('Socket断开连接:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // 服务端主动断开，需要手动重连
        this.socket.connect();
      }
    });

    // 重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('重连成功，尝试次数:', attemptNumber);
      this.resubscribeRooms();
    });

    // 重连错误
    this.socket.on('reconnect_error', (error) => {
      console.log('重连失败:', error);
      this.reconnectAttempts++;
    });

    // 应用恢复前台
    this.socket.on('appResumed', (data) => {
      console.log('应用已恢复前台:', data.message);
    });
  }

  // 处理应用状态变化
  handleAppStateChange(nextAppState) {
    // 通知服务端应用状态变化
    if (this.socket && this.isConnected) {
      this.socket.emit('appStateChange', nextAppState);
    }

    // 应用回到前台时检查连接状态
    if (nextAppState === 'active') {
      setTimeout(() => {
        if (!this.isConnected && this.socket) {
          console.log('应用恢复前台，检测到断线，尝试重连');
          this.socket.connect();
        }
      }, 1000);
    }
  }

  // 订阅房间
  subscribe(roomType, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe', { roomType, ...data });
      this.subscribedRooms.add(roomType);
    }
  }

  // 重新订阅所有房间
  resubscribeRooms() {
    this.subscribedRooms.forEach(roomType => {
      this.subscribe(roomType);
    });
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.subscribedRooms.clear();
    }
  }
}

// 使用示例
const socketManager = new SocketManager();
socketManager.connect();

// 订阅体育新闻
socketManager.subscribe('sport');
```

### 2. 原生安卓应用

```kotlin
class SocketManager : Application.ActivityLifecycleCallbacks {
    private var socket: Socket? = null
    private val subscribedRooms = mutableSetOf<String>()
    
    fun connect() {
        val options = IO.Options().apply {
            reconnection = true
            reconnectionAttempts = Int.MAX_VALUE
            reconnectionDelay = 1000
            reconnectionDelayMax = 5000
            timeout = 20000
            transports = arrayOf("websocket", "polling")
        }
        
        socket = IO.socket("ws://your-server-url", options)
        setupEventListeners()
        socket?.connect()
    }
    
    private fun setupEventListeners() {
        socket?.apply {
            on(Socket.EVENT_CONNECT) {
                Log.d("Socket", "连接成功")
                resubscribeRooms()
            }
            
            on(Socket.EVENT_DISCONNECT) { args ->
                Log.d("Socket", "断开连接: ${args[0]}")
            }
            
            on(Socket.EVENT_RECONNECT) {
                Log.d("Socket", "重连成功")
                resubscribeRooms()
            }
        }
    }
    
    // Activity生命周期回调
    override fun onActivityResumed(activity: Activity) {
        socket?.emit("appStateChange", "active")
        
        // 检查连接状态
        if (socket?.connected() == false) {
            Log.d("Socket", "应用恢复，尝试重连")
            socket?.connect()
        }
    }
    
    override fun onActivityPaused(activity: Activity) {
        socket?.emit("appStateChange", "background")
    }
}
```

### 3. H5/WebView 客户端

```javascript
class MobileSocketManager {
  constructor() {
    this.socket = null;
    this.subscribedRooms = new Set();
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handlePageVisible();
      } else {
        this.handlePageHidden();
      }
    });
    
    // 监听页面焦点变化
    window.addEventListener('focus', () => this.handlePageVisible());
    window.addEventListener('blur', () => this.handlePageHidden());
  }
  
  connect() {
    this.socket = io('ws://your-server-url', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });
    
    this.setupEventListeners();
  }
  
  handlePageVisible() {
    if (this.socket) {
      this.socket.emit('appStateChange', 'active');
      
      // 检查连接状态
      if (!this.socket.connected) {
        console.log('页面恢复可见，尝试重连');
        this.socket.connect();
      }
    }
  }
  
  handlePageHidden() {
    if (this.socket) {
      this.socket.emit('appStateChange', 'background');
    }
  }
}
```

## 系统级优化建议

### 1. 安卓应用配置

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<application>
    <!-- 防止应用被系统杀死 -->
    <service android:name=".SocketService"
             android:enabled="true"
             android:exported="false" />
</application>
```

### 2. 通知处理优化

```kotlin
// 优化通知点击处理，避免Activity重建
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 检查是否从通知启动
        if (intent.getBooleanExtra("from_notification", false)) {
            // 从通知启动，检查Socket连接状态
            checkSocketConnection()
        }
    }
    
    private fun checkSocketConnection() {
        // 延迟检查，给WebView时间加载
        Handler(Looper.getMainLooper()).postDelayed({
            // 检查并重连Socket
            socketManager.checkAndReconnect()
        }, 2000)
    }
}
```

## 测试验证

### 1. 测试场景

- [ ] 应用在前台时接收通知并点击
- [ ] 应用在后台时接收通知并点击
- [ ] 网络切换（Wi-Fi ↔ 蜂窝网络）
- [ ] 应用被系统杀死后通过通知启动
- [ ] 长时间后台后恢复前台

### 2. 验证方法

```javascript
// 在客户端添加连接状态监控
setInterval(() => {
  console.log('Socket状态:', {
    connected: socket.connected,
    id: socket.id,
    transport: socket.io.engine.transport.name
  });
}, 10000);
```

## 故障排查

### 1. 常见问题

- **连接频繁断开**：检查网络稳定性和心跳配置
- **重连失败**：检查服务端是否正常运行
- **房间订阅丢失**：确保重连后重新订阅
- **通知点击无响应**：检查Activity启动模式和Intent处理

### 2. 调试工具

```javascript
// 启用Socket.IO调试日志
localStorage.debug = 'socket.io-client:socket';

// 或在React Native中
import { enableDebug } from 'socket.io-client';
enableDebug('socket.io-client:socket');
```

## 总结

通过以上优化，可以显著改善移动端Socket.IO连接的稳定性：

1. **服务端**：增加心跳超时、启用连接恢复
2. **客户端**：实现自动重连、状态监听、房间重订阅
3. **系统级**：优化应用配置、通知处理

建议按照上述指南逐步实施，并在实际环境中充分测试验证效果。