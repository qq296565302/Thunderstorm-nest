import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { Finance } from './interfaces/finance.interface';

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
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    return this.financeService.getFinanceList(page, limit);
  }

  /**
   * 根据ID获取财经详情
   * @param id 财经ID
   * @returns 财经详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取财经详情', description: '根据财经ID获取详细信息' })
  @ApiParam({ name: 'id', description: '财经ID', example: '1' })
  @ApiResponse({ status: 200, description: '成功获取财经详情' })
  async getFinanceById(@Param('id') id: string): Promise<Finance> {
    return this.financeService.getFinanceById(id);
  }

  /**
   * 根据分类获取财经信息
   * @param category 财经分类
   * @param page 页码
   * @param limit 每页数量
   * @returns 分类财经列表
   */
  @Get('category/:category')
  @ApiOperation({ summary: '根据分类获取财经信息', description: '获取指定分类的财经列表' })
  @ApiParam({ name: 'category', description: '财经分类', example: 'stock' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '成功获取分类财经列表' })
  async getFinanceByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    return this.financeService.getFinanceByCategory(category, page, limit);
  }
}