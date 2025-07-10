import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { FinanceNews } from './interfaces/finance.interface';

/**
 * 财经控制器
 * 处理财经相关的HTTP请求
 */
@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * 获取财经列表
   * @param page 页码，默认为1
   * @param limit 每页数量，默认为10
   * @returns 财经列表
   */
  @Get()
  @ApiOperation({ summary: '获取财经列表', description: '分页获取财经列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '成功获取财经列表' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async getFinanceList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: FinanceNews[]; total: number; page: number; limit: number }> {
    return this.financeService.getFinanceList(page, limit);
  }
}