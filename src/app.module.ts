import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { WebSocketModule } from './websocket';

/**
 * 应用主模块
 * 管理整个应用的模块导入和配置
 */
@Module({
  imports: [FinanceModule, WebSocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
