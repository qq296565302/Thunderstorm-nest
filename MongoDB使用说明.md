# MongoDB 数据库使用说明

## 概述

本项目已集成 MongoDB 数据库，用于存储新闻、财经数据和用户信息。使用 Mongoose ODM 进行数据建模和操作。

## 功能特性

- ✅ MongoDB 连接配置
- ✅ 数据模型定义（News、Finance、User）
- ✅ 数据库服务封装
- ✅ 环境变量配置
- ✅ 索引优化
- ✅ 数据验证
- ✅ 示例数据和测试

## 数据模型

### 1. 新闻模型 (News)

```typescript
{
  title: string;           // 新闻标题
  content: string;         // 新闻内容
  category: string;        // 新闻分类
  source: string;          // 新闻来源
  author: string;          // 作者
  imageUrl?: string;       // 图片URL
  tags: string[];          // 标签
  publishedAt: Date;       // 发布时间
  isHot: boolean;          // 是否热门
  isUrgent: boolean;       // 是否紧急
  status: string;          // 状态 (draft/published/archived)
  viewCount: number;       // 阅读次数
  likeCount: number;       // 点赞次数
}
```

### 2. 财经数据模型 (Finance)

```typescript
{
  symbol: string;          // 股票代码
  name: string;            // 股票名称
  price: number;           // 当前价格
  change: number;          // 涨跌额
  changePercent: number;   // 涨跌幅百分比
  volume?: number;         // 成交量
  marketCap?: number;      // 市值
  marketType: string;      // 市场类型 (stock/crypto/forex/commodity)
  exchange?: string;       // 交易所
  currency: string;        // 货币单位
  updateTime: Date;        // 数据更新时间
  isActive: boolean;       // 是否为活跃交易
}
```

### 3. 用户模型 (User)

```typescript
{
  userId: string;          // 用户ID
  nickname?: string;       // 用户昵称
  email?: string;          // 用户邮箱
  currentSocketId?: string; // 当前WebSocket连接ID
  subscriptions: {         // 订阅设置
    newsCategories: string[];
    stockSymbols: string[];
    systemNotifications: boolean;
    urgentNews: boolean;
  };
  status: string;          // 用户状态 (online/offline/away)
  lastOnline: Date;        // 最后在线时间
  preferences: object;     // 用户偏好设置
  tags: string[];          // 用户标签
  isVip: boolean;          // 是否为VIP用户
  level: number;           // 用户等级
  points: number;          // 用户积分
}
```

## 环境配置

### 1. 环境变量设置

在项目根目录的 `.env` 文件中配置：

```env
# MongoDB 数据库连接URI
MONGODB_URI=mongodb://localhost:27017/thunderstorm-news

# 服务器端口
PORT=3000

# Node 环境
NODE_ENV=development
```

### 2. MongoDB 安装

#### 本地安装 MongoDB

1. 下载并安装 MongoDB Community Server
2. 启动 MongoDB 服务：
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### 使用 Docker 运行 MongoDB

```bash
# 拉取 MongoDB 镜像
docker pull mongo:latest

# 运行 MongoDB 容器
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

## 数据库服务使用

### 1. 在其他模块中使用数据库服务

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database';

@Injectable()
export class YourService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createNews(newsData: any) {
    return await this.databaseService.createNews(newsData);
  }

  async getNewsList() {
    return await this.databaseService.getNewsList({ limit: 10 });
  }
}
```

### 2. 主要 API 方法

#### 新闻相关操作

```typescript
// 创建新闻
const news = await databaseService.createNews(newsData);

// 获取新闻列表
const newsList = await databaseService.getNewsList({
  category: 'technology',
  isHot: true,
  limit: 20,
  skip: 0
});

// 根据ID获取新闻
const news = await databaseService.getNewsById(newsId);

// 更新新闻阅读次数
await databaseService.incrementNewsViews(newsId);
```

#### 财经数据相关操作

```typescript
// 创建或更新财经数据
const financeData = await databaseService.upsertFinanceData({
  symbol: 'AAPL',
  name: '苹果公司',
  price: 150.25,
  change: 2.15,
  changePercent: 1.45
});

// 获取财经数据列表
const financeList = await databaseService.getFinanceList({
  marketType: 'stock',
  limit: 50
});

// 根据股票代码获取数据
const stockData = await databaseService.getFinanceBySymbol('AAPL');
```

#### 用户相关操作

```typescript
// 创建或更新用户
const user = await databaseService.upsertUser({
  userId: 'user_001',
  nickname: '新闻爱好者',
  subscriptions: {
    newsCategories: ['technology', 'finance'],
    stockSymbols: ['AAPL', 'TSLA']
  }
});

// 更新用户在线状态
await databaseService.updateUserStatus('user_001', 'online', socketId);

// 更新用户订阅设置
await databaseService.updateUserSubscriptions('user_001', {
  newsCategories: ['technology'],
  urgentNews: true
});

// 获取在线用户列表
const onlineUsers = await databaseService.getOnlineUsers();
```

#### 统计信息

```typescript
// 获取数据库统计信息
const stats = await databaseService.getStatistics();
console.log(stats);
// 输出：
// {
//   newsCount: 150,
//   financeCount: 50,
//   userCount: 1000,
//   onlineUserCount: 25
// }
```

## 测试和示例

### 1. 初始化示例数据

项目提供了 `DatabaseExampleService` 用于创建示例数据：

```typescript
import { DatabaseExampleService } from '../database/database.example';

// 在控制器或服务中使用
@Injectable()
export class TestService {
  constructor(private readonly exampleService: DatabaseExampleService) {}

  async initData() {
    await this.exampleService.initializeSampleData();
  }

  async testOperations() {
    await this.exampleService.testDatabaseOperations();
  }
}
```

### 2. HTTP API 测试

可以通过现有的 WebSocket 控制器测试数据库功能：

```bash
# 获取服务状态（包含数据库统计）
GET http://localhost:3000/websocket/status

# 推送新闻（会保存到数据库）
POST http://localhost:3000/websocket/news
Content-Type: application/json

{
  "title": "测试新闻",
  "content": "这是一条测试新闻",
  "category": "technology"
}
```

## 数据库索引

为了优化查询性能，已为各个模型创建了相应的索引：

### News 索引
- `category`: 分类索引
- `status, publishedAt`: 复合索引
- `isHot, publishedAt`: 热门新闻索引
- `isUrgent, publishedAt`: 紧急新闻索引
- `tags`: 标签索引

### Finance 索引
- `symbol`: 股票代码唯一索引
- `marketType`: 市场类型索引
- `updateTime`: 更新时间索引
- `isActive, updateTime`: 活跃股票索引

### User 索引
- `userId`: 用户ID唯一索引
- `email`: 邮箱索引（稀疏索引）
- `status`: 状态索引
- `lastOnline`: 最后在线时间索引
- `isActive, status`: 活跃用户索引

## 注意事项

1. **连接配置**：确保 MongoDB 服务正在运行，并且连接URI正确
2. **数据验证**：所有模型都包含数据验证规则，确保数据完整性
3. **错误处理**：数据库操作都包含错误处理和日志记录
4. **性能优化**：合理使用索引和分页查询
5. **数据备份**：定期备份重要数据

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 MongoDB 服务是否启动
   - 验证连接URI是否正确
   - 检查网络连接和防火墙设置

2. **数据验证错误**
   - 检查数据格式是否符合模型定义
   - 确保必填字段都有值
   - 验证数据类型是否正确

3. **性能问题**
   - 检查是否正确使用了索引
   - 优化查询条件
   - 使用分页查询避免大量数据加载

### 调试技巧

1. 启用 MongoDB 查询日志
2. 使用 MongoDB Compass 可视化工具
3. 检查应用日志中的数据库操作记录

## 扩展功能

### 1. 添加新的数据模型

1. 在 `src/database/schemas/` 目录下创建新的 Schema 文件
2. 在 `database.module.ts` 中注册新模型
3. 在 `database.service.ts` 中添加相关操作方法

### 2. 数据迁移

可以创建数据迁移脚本来处理数据库结构变更：

```typescript
// migration.service.ts
@Injectable()
export class MigrationService {
  async migrateData() {
    // 执行数据迁移逻辑
  }
}
```

### 3. 数据库监控

可以添加数据库性能监控和健康检查：

```typescript
@Injectable()
export class DatabaseHealthService {
  async checkHealth() {
    // 检查数据库连接状态
    // 监控查询性能
    // 检查磁盘空间等
  }
}
```

## 总结

MongoDB 数据库模块已成功集成到项目中，提供了完整的数据存储和管理功能。通过合理的数据建模、索引优化和服务封装，为应用提供了高效、可靠的数据支持。