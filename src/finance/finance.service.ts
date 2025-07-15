import { Injectable } from '@nestjs/common';
import { FinanceNews } from './interfaces/finance.interface';
import { FinanceRepository } from './finance.repository';
import { Finance } from '../database';

/**
 * 财经服务类
 * 处理财经相关的业务逻辑
 */
@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

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
    try {
      // 计算跳过的记录数
      const skip = (page - 1) * limit;
      
      // 从数据库查询财经数据（只查询已发布的数据）
      const data = await this.financeRepository.findByCondition(
        { isPublished: true },
        {
          sort: { publishTime: -1 }, // 按发布时间倒序排列
          skip,
          limit,
        }
      );
      
      // 获取总数量
      const total = await this.financeRepository.count({ isPublished: true });
      
      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      // 如果数据库查询失败，记录错误并返回空结果
      console.error('获取财经列表失败:', error);
      return {
        data: [],
        total: 0,
        page: Number(page),
        limit: Number(limit),
      };
    }
  }
}