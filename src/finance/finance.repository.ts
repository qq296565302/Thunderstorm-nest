import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Finance, FinanceDocument } from '../database';

/**
 * 财经数据仓储类
 * 专门处理财经数据的数据库操作
 */
@Injectable()
export class FinanceRepository {
  private readonly logger = new Logger(FinanceRepository.name);

  constructor(
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
  ) {}

  /**
   * 创建财经数据
   * @param financeData 财经数据
   * @returns 创建的财经数据
   */
  async create(financeData: Partial<Finance>): Promise<Finance> {
    try {
      const finance = new this.financeModel(financeData);
      return await finance.save();
    } catch (error) {
      this.logger.error('创建财经数据失败', error);
      throw error;
    }
  }

  /**
   * 根据财经信息ID获取财经数据
   * @param id 财经信息ID
   * @returns 财经数据或null
   */
  async findById(id: string): Promise<Finance | null> {
    try {
      return await this.financeModel.findOne({ id }).exec();
    } catch (error) {
      this.logger.error(`根据ID获取财经数据失败: ${id}`, error);
      throw error;
    }
  }

  /**
   * 获取所有已发布的财经数据
   * @param limit 限制数量，默认50条
   * @returns 财经数据列表
   */
  async findAllPublished(limit: number = 50): Promise<Finance[]> {
    try {
      return await this.financeModel
        .find({ isPublished: true })
        .sort({ publishTime: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error('获取已发布财经数据失败', error);
      throw error;
    }
  }

  /**
   * 检查财经数据是否已存在
   * 根据publishTime、author和content三个字段进行判断
   * @param publishTime 发布时间
   * @param author 作者
   * @param content 内容
   * @returns 是否存在
   */
  async exists(publishTime: string, author: string, content: string): Promise<boolean> {
    try {
      const existingData = await this.financeModel.findOne({
        publishTime,
        author,
        content
      }).exec();
      
      return !!existingData;
    } catch (error) {
      this.logger.error('检查财经数据是否存在失败', error);
      return false;
    }
  }

  /**
   * 根据条件查找财经数据
   * @param filter 查询条件
   * @param options 查询选项（排序、分页等）
   * @returns 财经数据列表
   */
  async findByCondition(
    filter: Partial<Finance>,
    options?: {
      sort?: Record<string, 1 | -1>;
      limit?: number;
      skip?: number;
    }
  ): Promise<Finance[]> {
    try {
      let query = this.financeModel.find(filter);
      
      if (options?.sort) {
        query = query.sort(options.sort);
      }
      
      if (options?.skip) {
        query = query.skip(options.skip);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      return await query.exec();
    } catch (error) {
      this.logger.error('根据条件查找财经数据失败', error);
      throw error;
    }
  }

  /**
   * 统计财经数据数量
   * @param filter 查询条件
   * @returns 数据数量
   */
  async count(filter: Partial<Finance> = {}): Promise<number> {
    try {
      return await this.financeModel.countDocuments(filter).exec();
    } catch (error) {
      this.logger.error('统计财经数据数量失败', error);
      throw error;
    }
  }
}