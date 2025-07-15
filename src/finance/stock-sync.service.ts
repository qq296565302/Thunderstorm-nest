import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { FinanceRepository } from './finance.repository';
import { firstValueFrom } from 'rxjs';

/**
 * * 股票数据同步服务
 * * 直接从指定API获取数据并存储到数据库
 * * 支持财联社和新浪财经
 * * 定时任务：每分钟同步一次数据
 * * 同步逻辑：
 * * 1. 从财联社API获取最新财经数据
 * * 2. 从新浪财经API获取最新财经数据
 * * 3. 对比数据是否已存在，避免重复
 * * 4. 新数据写入数据库
 * * 5. 记录同步时间
 */
@Injectable()
export class StockSyncService {
  private readonly logger = new Logger(StockSyncService.name);
  private readonly clsAPIUrl =
    'http://47.94.196.217:5500/api/public/stock_info_global_cls';
  private readonly sinaAPIUrl =
    'http://47.94.196.217:5500/api/public/stock_info_global_sina';
  constructor(
    private readonly httpService: HttpService,
    private readonly financeRepository: FinanceRepository,
  ) {}

  /**
   * 同步股票数据
   */
  async syncStockData(
    apiUrl: string,
    author: string,
  ): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    try {
      const params =
        author === '财联社'
          ? {
              symbol: '全部',
            }
          : undefined;
      // 请求股票数据
      const response = await firstValueFrom(
        this.httpService.get(apiUrl, {
          params: params,
          timeout: 30000,
        }),
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
          const formattedStock = this.formatStockData(stock, author);
          if (formattedStock) {
            // 检查数据是否已存在（根据publishTime、author和content三重判断）
            const exists = await this.financeRepository.exists(
              formattedStock.publishTime,
              formattedStock.author,
              formattedStock.content,
            );

            if (!exists) {
              // 数据不存在，插入新数据
              await this.financeRepository.create(formattedStock);
              successCount++;
              this.logger.debug(
                `新增${author}财经数据: ${formattedStock.title}`,
              );
            }
          }
        } catch (error) {
          this.logger.warn(
            `保存股票数据失败: ${stock['标题'] || stock.id || 'Unknown'}`,
            error.message,
          );
        }
      }

      const message = `股票数据同步完成，成功处理 ${successCount}/${stocks.length} 条数据`;

      return {
        success: true,
        count: successCount,
        message,
      };
    } catch (error) {
      const errorMessage = `股票数据同步失败: ${error.message}`;
      this.logger.error(errorMessage, error.stack);

      return {
        success: false,
        count: 0,
        message: errorMessage,
      };
    }
  }

  /**
   * 定时同步股票数据 - 每1分钟执行一次
   */
  @Cron('0 */1 * * * *')
  async scheduledSync(): Promise<void> {
    this.logger.log('定时任务：开始同步股票数据');
    await this.syncStockData(this.clsAPIUrl, '财联社');
    await this.syncStockData(this.sinaAPIUrl, '新浪财经');
  }

  /**
   * 格式化股票数据
   * @param rawData 原始股票数据
   * @returns 格式化后的股票数据
   */
  private formatStockData(rawData: any, author: string): any | null {
    try {
      if (!rawData) return null;

      return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 10),
        title: rawData['标题'] || '--',
        content: rawData['内容'],
        publishTime:
          author === '财联社'
            ? this.formatDateTime(rawData['发布日期'], rawData['发布时间'])
            : rawData['时间'],
        author: author,
        tags: [],
      };
    } catch (error) {
      this.logger.error('格式化股票数据失败', error, rawData);
      return null;
    }
  }

  /**
   * 格式化日期时间
   * @param dateStr 发布日期，格式如"2025-07-10T00:00:00.000"
   * @param timeStr 发布时间，格式如"10:02:29"
   * @returns 格式化后的日期时间字符串，格式如"2025-07-10 10:02:29"
   */
  private formatDateTime(dateStr: string, timeStr: string): string {
    try {
      if (!dateStr || !timeStr) {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      }

      // 从ISO格式日期中提取日期部分
      const datePart = dateStr.split('T')[0]; // "2025-07-10"

      // 组合日期和时间
      const formattedDateTime = `${datePart} ${timeStr}`; // "2025-07-10 10:02:29"

      return formattedDateTime;
    } catch (error) {
      this.logger.warn('日期时间格式化失败，使用当前时间', error);
      return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
  }
}
