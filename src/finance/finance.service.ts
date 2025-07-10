import { Injectable } from '@nestjs/common';
import { Finance } from './interfaces/finance.interface';

/**
 * 财经服务类
 * 处理财经相关的业务逻辑
 */
@Injectable()
export class FinanceService {
  // 模拟财经数据
  private readonly mockFinance: Finance[] = [

  ];

  /**
   * 获取财经列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页的财经列表
   */
  async getFinanceList(
    page: number,
    limit: number,
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = this.mockFinance.slice(startIndex, endIndex);

    return {
      data,
      total: this.mockFinance.length,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 根据ID获取财经详情
   * @param id 财经ID
   * @returns 财经详情
   */
  async getFinanceById(id: string): Promise<Finance> {
    const finance = this.mockFinance.find((item) => item.id === id);
    if (!finance) {
      throw new Error(`财经信息ID ${id} 不存在`);
    }
    return finance;
  }

  /**
   * 根据分类获取财经信息
   * @param category 财经分类
   * @param page 页码
   * @param limit 每页数量
   * @returns 分类财经列表
   */
  async getFinanceByCategory(
    category: string,
    page: number,
    limit: number,
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    const filteredFinance = this.mockFinance.filter(
      (finance) => finance.category === category,
    );
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredFinance.slice(startIndex, endIndex);

    return {
      data,
      total: filteredFinance.length,
      page: Number(page),
      limit: Number(limit),
    };
  }
}