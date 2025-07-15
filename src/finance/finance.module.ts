// NestJS 核心模块装饰器
import { Module } from '@nestjs/common';
// HTTP 客户端模块，用于发起外部 API 请求
import { HttpModule } from '@nestjs/axios';
// 定时任务模块，用于执行定时同步任务
import { ScheduleModule } from '@nestjs/schedule';
// Mongoose ODM 模块，用于 MongoDB 数据库操作
import { MongooseModule } from '@nestjs/mongoose';

// 财经数据控制器，处理财经相关的 HTTP 请求
import { FinanceController } from './finance.controller';
// 财经数据服务，提供财经数据的业务逻辑
import { FinanceService } from './finance.service';
// 股票数据同步服务，负责从外部 API 同步股票数据
import { StockSyncService } from './stock-sync.service';
// 股票同步控制器，提供手动触发股票数据同步的接口
import { StockSyncController } from './stock-sync.controller';
// 财经数据仓储层，封装数据库操作
import { FinanceRepository } from './finance.repository';
// 财经数据模型和 Schema 定义
import { Finance, FinanceSchema } from '../database';

/**
 * 财经模块
 * 
 * 该模块负责管理所有与财经数据相关的功能，包括：
 * - 财经数据的 CRUD 操作
 * - 股票数据的定时同步
 * - 外部财经 API 的数据获取
 * - 财经数据的存储和查询
 * 
 * 主要功能：
 * 1. 提供财经数据的 RESTful API 接口
 * 2. 自动同步财联社和新浪财经的股票数据
 * 3. 支持手动触发数据同步
 * 4. 提供数据查询和统计功能
 */
@Module({
  imports: [
    // 注册 Finance 模型到 Mongoose，用于数据库操作
    MongooseModule.forFeature([{ name: Finance.name, schema: FinanceSchema }]),
    
    // 配置 HTTP 客户端模块
    HttpModule.register({
      timeout: 30000,      // 请求超时时间：30秒
      maxRedirects: 5,     // 最大重定向次数：5次
    }),
    
    // 启用定时任务模块，用于股票数据的定时同步
    ScheduleModule.forRoot(),
  ],
  
  // 注册控制器
  controllers: [
    FinanceController,    // 财经数据主控制器
    StockSyncController,  // 股票同步控制器
  ],
  
  // 注册服务提供者
  providers: [
    FinanceService,       // 财经数据业务服务
    StockSyncService,     // 股票数据同步服务
    FinanceRepository,    // 财经数据仓储服务
  ],
  
  // 导出服务，供其他模块使用
  exports: [
    FinanceService,       // 导出财经服务，供其他模块调用
    StockSyncService,     // 导出同步服务，供其他模块调用
    FinanceRepository,    // 导出仓储服务，供其他模块调用
  ],
})
export class FinanceModule {}