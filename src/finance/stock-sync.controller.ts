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
    const clsResult = await this.stockSyncService.syncStockData(
      'http://47.94.196.217:5500/api/public/stock_info_global_cls',
      '财联社'
    );
    
    const sinaResult = await this.stockSyncService.syncStockData(
      'http://47.94.196.217:5500/api/public/stock_info_global_sina',
      '新浪财经'
    );

    return {
      success: clsResult.success && sinaResult.success,
      results: {
        cls: clsResult,
        sina: sinaResult
      },
      totalCount: clsResult.count + sinaResult.count
    };
  }
}