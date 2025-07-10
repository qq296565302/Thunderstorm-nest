import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockSyncService } from './stock-sync.service';

/**
 * 股票数据同步控制器
 * 提供简单的股票数据同步API
 */
@ApiTags('股票同步')
@Controller('stock-sync')
export class StockSyncController {
  constructor(private readonly stockSyncService: StockSyncService) {}

  /**
   * 手动触发股票数据同步
   */
  @Post('sync')
  @ApiOperation({ summary: '手动同步股票数据' })
  @ApiResponse({ status: 200, description: '同步成功' })
  @ApiResponse({ status: 500, description: '同步失败' })
  async syncStockData() {
    return await this.stockSyncService.syncStockData();
  }

  /**
   * 获取同步状态
   */
  @Get('status')
  @ApiOperation({ summary: '获取同步状态' })
  @ApiResponse({ status: 200, description: '获取状态成功' })
  async getSyncStatus() {
    return await this.stockSyncService.getSyncStatus();
  }
}