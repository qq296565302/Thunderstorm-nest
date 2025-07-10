import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { WebSocketModule } from './websocket';
import { DatabaseModule } from './database';

/**
 * 应用主模块
 * 管理整个应用的模块导入和配置
 */
@Module({
  imports: [
    // 配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 使配置在全局可用
      envFilePath: '.env', // 指定环境变量文件路径
    }),
    // 数据库模块
    DatabaseModule,
    // 业务模块
    FinanceModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
