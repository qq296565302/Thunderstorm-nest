import { Injectable, NotFoundException } from '@nestjs/common';
import { SportRepository } from './sport.repository';
import { Sport } from '../database/schemas/sport.schema';
import { WebSocketService } from '../websocket/websocket.service';

/**
 * 体育新闻服务层
 */
@Injectable()
export class SportService {
  constructor(
    private readonly sportRepository: SportRepository,
    private readonly webSocketService: WebSocketService,
  ) {}

  /**
   * 获取体育新闻列表
   */
  async findAll(query: any) {
    return this.sportRepository.findAll(query);
  }

  /**
   * 根据ID获取体育新闻详情
   * @param id 体育新闻ID
   * @returns 体育新闻详情
   */
  async getSportById(id: string): Promise<{
    code: number;
    message: string;
    data: Sport | null;
  }> {
    try {
      const sport = await this.sportRepository.findById(id);
      
      if (!sport) {
        return {
          code: 404,
          message: '体育新闻不存在',
          data: null,
        };
      }

      return {
        code: 200,
        message: '获取体育新闻详情成功',
        data: sport,
      };
    } catch (error) {
      return {
        code: 500,
        message: '获取体育新闻详情失败',
        data: null,
      };
    }
  }

  /**
   * 创建体育新闻
   * @param sportData 体育新闻数据
   * @returns 创建结果
   */
  async createSport(sportData: Partial<Sport>): Promise<{
    code: number;
    message: string;
    data: Sport | null;
  }> {
    try {
      const sport = await this.sportRepository.create(sportData);
      
      // 推送新体育新闻到WebSocket订阅者
      if (sport.isPublished) {
        this.webSocketService.pushSportData({
          action: 'create',
          data: sport,
          message: '新体育新闻发布',
        });
      }
      
      return {
        code: 201,
        message: '创建体育新闻成功',
        data: sport,
      };
    } catch (error) {
      return {
        code: 500,
        message: '创建体育新闻失败',
        data: null,
      };
    }
  }

  /**
   * 创建体育新闻
   */
  async create(sportData: Partial<Sport>) {
    // 设置默认发布时间
    if (!sportData.publishTime) {
      sportData.publishTime = new Date().toISOString();
    }
    
    const newSport = await this.sportRepository.create(sportData);
    
    // 如果是已发布的体育新闻，通过WebSocket推送
    if (newSport.isPublished) {
      this.webSocketService.pushSportData({
        type: 'new_sport',
        data: newSport,
        timestamp: new Date().toISOString(),
      });
    }
    
    return newSport;
  }

  /**
   * 更新体育新闻
   * @param id 体育新闻ID
   * @param updateData 更新数据
   * @returns 更新结果
   */
  async updateSport(id: string, updateData: Partial<Sport>): Promise<{
    code: number;
    message: string;
    data: Sport | null;
  }> {
    try {
      const sport = await this.sportRepository.update(id, updateData);
      
      if (!sport) {
        return {
          code: 404,
          message: '体育新闻不存在',
          data: null,
        };
      }

      // 推送体育新闻更新到WebSocket订阅者
      if (sport.isPublished) {
        this.webSocketService.pushSportData({
          action: 'update',
          data: sport,
          message: '体育新闻更新',
        });
      }

      return {
        code: 200,
        message: '更新体育新闻成功',
        data: sport,
      };
    } catch (error) {
      return {
        code: 500,
        message: '更新体育新闻失败',
        data: null,
      };
    }
  }

  /**
   * 更新体育新闻
   */
  async update(id: string, updateData: Partial<Sport>) {
    // 设置更新时间
    updateData.updateTime = new Date();
    
    const updatedSport = await this.sportRepository.update(id, updateData);
    
    // 如果更新后是已发布状态，通过WebSocket推送
    if (updatedSport && updatedSport.isPublished) {
      this.webSocketService.pushSportData({
        type: 'update_sport',
        data: updatedSport,
        timestamp: new Date().toISOString(),
      });
    }
    
    return updatedSport;
  }

  /**
   * 删除体育新闻
   * @param id 体育新闻ID
   * @returns 删除结果
   */
  async deleteSport(id: string): Promise<{
    code: number;
    message: string;
    data: boolean;
  }> {
    try {
      const result = await this.sportRepository.delete(id);
      
      if (!result) {
        return {
          code: 404,
          message: '体育新闻不存在',
          data: false,
        };
      }

      return {
        code: 200,
        message: '删除体育新闻成功',
        data: true,
      };
    } catch (error) {
      return {
        code: 500,
        message: '删除体育新闻失败',
        data: false,
      };
    }
  }

  /**
   * 搜索体育新闻
   * @param keyword 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 搜索结果
   */
  async searchSport(
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    code: number;
    message: string;
    data: {
      list: Sport[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const result = await this.sportRepository.search(keyword, page, limit);
      
      return {
        code: 200,
        message: '搜索体育新闻成功',
        data: {
          list: result.data,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: '搜索体育新闻失败',
        data: {
          list: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
  }
}