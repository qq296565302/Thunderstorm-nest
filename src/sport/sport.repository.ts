import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sport, SportDocument } from '../database/schemas/sport.schema';

/**
 * 体育新闻数据访问层
 */
@Injectable()
export class SportRepository {
  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
  ) {}

  /**
   * 获取体育新闻列表
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    keyword?: string;
    category?: string;
    author?: string;
    isPublished?: boolean;
    isTop?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      page = 1, 
      limit = 10, 
      keyword, 
      category, 
      author, 
      isPublished,
      isTop,
      sortBy = 'publishTime',
      sortOrder = 'desc'
    } = options;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query: any = {};
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }
    
    if (isTop !== undefined) {
      query.isTop = isTop;
    }
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (author) {
      query.author = author;
    }

    // 构建排序条件
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // 如果不是按置顶排序，则优先显示置顶内容
    if (sortBy !== 'isTop') {
      sort.isTop = -1;
    }

    const [data, total] = await Promise.all([
      this.sportModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sportModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID获取体育新闻详情
   * @param id 体育新闻ID
   * @returns 体育新闻详情
   */
  async findById(id: string): Promise<Sport | null> {
    return this.sportModel.findOne({ id, isPublished: true }).lean().exec();
  }

  /**
   * 创建体育新闻
   * @param sportData 体育新闻数据
   * @returns 创建的体育新闻
   */
  async create(sportData: Partial<Sport>): Promise<Sport> {
    const sport = new this.sportModel(sportData);
    return sport.save();
  }

  /**
   * 更新体育新闻
   * @param id 体育新闻ID
   * @param updateData 更新数据
   * @returns 更新后的体育新闻
   */
  async update(id: string, updateData: Partial<Sport>): Promise<Sport | null> {
    return this.sportModel
      .findOneAndUpdate(
        { id },
        { ...updateData, updateTime: new Date() },
        { new: true }
      )
      .lean()
      .exec();
  }

  /**
   * 删除体育新闻
   * @param id 体育新闻ID
   * @returns 删除结果
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sportModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  /**
   * 搜索体育新闻
   * @param keyword 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 搜索结果
   */
  async search(
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Sport[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const query = {
      isPublished: true,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ],
    };

    const [data, total] = await Promise.all([
      this.sportModel
        .find(query)
        .sort({ isTop: -1, publishTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.sportModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}