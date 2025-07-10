import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { StockSyncService } from './stock-sync.service';
import { StockSyncController } from './stock-sync.controller';
import { DatabaseModule } from '../database/database.module';

/**
 * 财经模块
 * 管理财经相关的控制器和服务
 */
@Module({
  imports: [
    DatabaseModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [FinanceController, StockSyncController],
  providers: [FinanceService, StockSyncService],
  exports: [FinanceService, StockSyncService],
})
export class FinanceModule {}