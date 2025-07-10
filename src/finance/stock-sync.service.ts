import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { DatabaseService } from '../database/database.service';
import { firstValueFrom } from 'rxjs';

/**
 * 简单的股票数据同步服务
 * 直接从指定API获取数据并存储到数据库
 */
@Injectable()
export class StockSyncService {
  private readonly logger = new Logger(StockSyncService.name);
  private readonly apiUrl = 'http://47.94.196.217:5500/api/public/stock_info_global_cls';

  constructor(
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * 手动同步股票数据
   */
  async syncStockData(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      this.logger.log('开始同步股票数据...');
      
      // 请求股票数据
      const response = await firstValueFrom(
        this.httpService.get(this.apiUrl, {
          params: { symbol: '全部' },
          timeout: 30000,
        })
      );

      const stockData = response.data;
      
      if (!stockData || (!Array.isArray(stockData) && !stockData.data)) {
        throw new Error('API返回数据格式错误');
      }

      // 处理数据
      let stocks = Array.isArray(stockData) ? stockData : stockData.data || [];
      
      if (!Array.isArray(stocks)) {
        stocks = [stocks];
      }

      let successCount = 0;
      
      // 逐个保存股票数据
      for (const stock of stocks) {
        try {
          const formattedStock = this.formatStockData(stock);
          if (formattedStock) {
            await this.databaseService.upsertFinanceData(formattedStock);
            successCount++;
          }
        } catch (error) {
          this.logger.warn(`保存股票数据失败: ${stock.stock_code || stock.symbol}`, error.message);
        }
      }

      const message = `股票数据同步完成，成功处理 ${successCount}/${stocks.length} 条数据`;
      this.logger.log(message);
      
      return {
        success: true,
        count: successCount,
        message
      };
      
    } catch (error) {
      const errorMessage = `股票数据同步失败: ${error.message}`;
      this.logger.error(errorMessage, error.stack);
      
      return {
        success: false,
        count: 0,
        message: errorMessage
      };
    }
  }

  /**
   * 定时同步股票数据 - 每10分钟执行一次
   */
  @Cron('0 */10 * * * *')
  async scheduledSync(): Promise<void> {
    this.logger.log('定时任务：开始同步股票数据');
    await this.syncStockData();
  }

  /**
   * 格式化股票数据
   * @param rawData 原始股票数据
   * @returns 格式化后的股票数据
   */
  private formatStockData(rawData: any): any | null {
    try {
      if (!rawData) return null;

      // 获取股票代码
      const symbol = rawData.stock_code || rawData.symbol || rawData.code;
      if (!symbol) {
        this.logger.warn('股票数据缺少代码字段', rawData);
        return null;
      }

      // 获取价格
      const price = this.parseNumber(rawData.current_price || rawData.price || rawData.last_price);
      if (!price || price <= 0) {
        this.logger.warn(`股票 ${symbol} 价格数据无效`, rawData);
        return null;
      }

      return {
        symbol: symbol.toString().trim(),
        name: rawData.stock_name || rawData.name || symbol,
        price: price,
        change: this.parseNumber(rawData.price_change || rawData.change) || 0,
        changePercent: this.parseNumber(rawData.change_percent || rawData.change_pct) || 0,
        volume: this.parseNumber(rawData.volume || rawData.trade_volume) || 0,
        marketCap: this.parseNumber(rawData.market_cap || rawData.market_value) || 0,
        high: this.parseNumber(rawData.high || rawData.day_high) || price,
        low: this.parseNumber(rawData.low || rawData.day_low) || price,
        open: this.parseNumber(rawData.open || rawData.open_price) || price,
        close: this.parseNumber(rawData.close || rawData.close_price) || price,
        lastUpdate: new Date(),
        market: rawData.market || rawData.exchange || 'UNKNOWN',
        currency: rawData.currency || 'CNY',
        source: 'stock-api'
      };
    } catch (error) {
      this.logger.error('格式化股票数据失败', error, rawData);
      return null;
    }
  }

  /**
   * 安全解析数字
   * @param value 要解析的值
   * @returns 解析后的数字或null
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(): Promise<{ lastSync: Date | null; totalStocks: number }> {
    try {
      // 这里可以添加获取最后同步时间和股票总数的逻辑
      // 暂时返回简单状态
      return {
        lastSync: new Date(),
        totalStocks: 0
      };
    } catch (error) {
      this.logger.error('获取同步状态失败', error);
      return {
        lastSync: null,
        totalStocks: 0
      };
    }
  }
}