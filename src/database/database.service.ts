import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { Finance, FinanceDocument } from './schemas/finance.schema';
import { User, UserDocument } from './schemas/user.schema';

/**
 * 数据库服务类
 * 提供常用的数据库操作方法
 */
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ==================== 新闻相关操作 ====================
  
  /**
   * 创建新闻
   */
  async createNews(newsData: Partial<News>): Promise<News> {
    try {
      const news = new this.newsModel(newsData);
      return await news.save();
    } catch (error) {
      this.logger.error('创建新闻失败', error);
      throw error;
    }
  }

  /**
   * 更新或插入新闻数据
   */
  async upsertNews(newsData: Partial<News>): Promise<News> {
    try {
      const filter = newsData.newsId ? { newsId: newsData.newsId } : { title: newsData.title };
      return await this.newsModel.findOneAndUpdate(
        filter,
        newsData,
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error('更新新闻失败', error);
      throw error;
    }
  }

  /**
   * 根据分类获取新闻
   */
  async getNewsByCategory(category: string, limit: number = 10): Promise<News[]> {
    return await this.newsModel
      .find({ category, status: 'published' })
      .sort({ publishTime: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * 获取最新新闻
   */
  async getLatestNews(limit: number = 10): Promise<News[]> {
    return await this.newsModel
      .find({ status: 'published' })
      .sort({ publishTime: -1 })
      .limit(limit)
      .exec();
  }

  // ==================== 财经相关操作 ====================
  
  /**
   * 创建财经数据
   */
  async createFinance(financeData: Partial<Finance>): Promise<Finance> {
    try {
      const finance = new this.financeModel(financeData);
      return await finance.save();
    } catch (error) {
      this.logger.error('创建财经数据失败', error);
      throw error;
    }
  }

  /**
   * 插入财经数据（仅新增，不更新）
   */
  async upsertFinanceData(financeData: Partial<Finance>): Promise<Finance> {
    try {
      const finance = new this.financeModel(financeData);
      return await finance.save();
    } catch (error) {
      this.logger.error('插入财经数据失败', error);
      throw error;
    }
  }

  /**
   * 根据财经信息ID获取财经数据
   */
  async getFinanceById(id: string): Promise<Finance | null> {
    return await this.financeModel.findOne({ id }).exec();
  }

  /**
   * 获取所有财经数据
   */
  async getAllFinanceData(limit: number = 50): Promise<Finance[]> {
    return await this.financeModel
      .find({ isPublished: true })
      .sort({ publishTime: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * 检查财经数据是否已存在
   * 根据publishTime、author和content三个字段进行判断
   */
  async checkFinanceDataExists(publishTime: string, author: string, content: string): Promise<boolean> {
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

  // ==================== 用户相关操作 ====================
  
  /**
   * 创建用户
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const user = new this.userModel(userData);
      return await user.save();
    } catch (error) {
      this.logger.error('创建用户失败', error);
      throw error;
    }
  }

  /**
   * 更新或插入用户数据
   */
  async upsertUser(userData: Partial<User>): Promise<User> {
    try {
      const filter = userData.userId ? { userId: userData.userId } : { email: userData.email };
      return await this.userModel.findOneAndUpdate(
        filter,
        userData,
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error('更新用户失败', error);
      throw error;
    }
  }

  /**
   * 根据用户ID获取用户
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userModel.findOne({ userId }).exec();
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  /**
   * 更新用户WebSocket连接ID
   */
  async updateUserSocketId(userId: string, socketId: string): Promise<User | null> {
    return await this.userModel.findOneAndUpdate(
      { userId },
      { currentSocketId: socketId, lastOnline: new Date() },
      { new: true }
    ).exec();
  }

  /**
   * 获取在线用户
   */
  async getOnlineUsers(): Promise<User[]> {
    return await this.userModel
      .find({ 
        status: 'online',
        currentSocketId: { $ne: null }
      })
      .exec();
  }

  // ==================== 统计相关操作 ====================
  
  /**
   * 获取新闻统计
   */
  async getNewsStats() {
    const total = await this.newsModel.countDocuments();
    const published = await this.newsModel.countDocuments({ status: 'published' });
    const draft = await this.newsModel.countDocuments({ status: 'draft' });
    
    return { total, published, draft };
  }

  /**
   * 获取用户统计
   */
  async getUserStats() {
    const total = await this.userModel.countDocuments();
    const active = await this.userModel.countDocuments({ status: 'active' });
    const online = await this.userModel.countDocuments({ status: 'online' });
    const vip = await this.userModel.countDocuments({ isVip: true });
    
    return { total, active, online, vip };
  }

  /**
   * 获取财经数据统计
   */
  async getFinanceStats() {
    const total = await this.financeModel.countDocuments();
    const published = await this.financeModel.countDocuments({ isPublished: true });
    const draft = await this.financeModel.countDocuments({ isPublished: false });
    const topNews = await this.financeModel.countDocuments({ isTop: true });
    
    return { total, published, draft, topNews };
  }

  // ==================== 通用操作 ====================
  
  /**
   * 根据集合名称和数据插入或更新
   */
  async upsertData(collection: string, data: any, filter?: any): Promise<any> {
    try {
      let model: Model<any>;
      
      switch (collection) {
        case 'news':
          model = this.newsModel;
          break;
        case 'finance':
          model = this.financeModel;
          break;
        case 'users':
          model = this.userModel;
          break;
        default:
          throw new Error(`不支持的集合: ${collection}`);
      }

      const query = filter || {};
      return await model.findOneAndUpdate(
        query,
        data,
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error(`更新${collection}数据失败`, error);
      throw error;
    }
  }

  /**
   * 根据集合名称查询数据
   */
  async findData(collection: string, query: any = {}, options: any = {}): Promise<any[]> {
    try {
      let model: Model<any>;
      
      switch (collection) {
        case 'news':
          model = this.newsModel;
          break;
        case 'finance':
          model = this.financeModel;
          break;
        case 'users':
          model = this.userModel;
          break;
        default:
          throw new Error(`不支持的集合: ${collection}`);
      }

      return await model.find(query, null, options).exec();
    } catch (error) {
      this.logger.error(`查询${collection}数据失败`, error);
      throw error;
    }
  }
}