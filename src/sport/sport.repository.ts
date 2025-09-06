import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sport, SportDocument } from '../database/schemas/sport.schema';
import { League, LeagueDocument } from '../database/schemas/league.schema';
import { Article, ArticleDocument } from '../database/schemas/article.schema';

@Injectable()
export class SportRepository {
  private readonly logger = new Logger(SportRepository.name);

  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
    @InjectModel(League.name) private leagueModel: Model<LeagueDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  /**
   * 根据联赛名称获取联赛积分榜
   * @param leagueName 联赛名称
   * @returns 联赛积分榜
   */
  async getLeagueStandings(leagueName: string) {
    const standings = await this.leagueModel
      .find({ league: leagueName })
      .lean()
      .exec();
    return standings;
  }

  /**
   * 根据球队ID获取球员列表
   * @param teamId 球队ID
   * @returns 球员列表
   */
  async getPlayersByTeamId(teamId: string) {
    const team = await this.leagueModel
      .findOne({ team_id: teamId })
      .lean()
      .exec();

    if (!team) {
      this.logger.warn(`未找到球队数据: ${teamId}`);
      return [];
    }

    return team.person || [];
  }

  /**
   * 获取最新的文章记录
   * @param category 文章分类，可选
   * @returns 最新的文章记录
   */
  async getLatestArticle(category?: string) {
    const query = category ? { category } : {};
    return this.articleModel
      .findOne(query)
      .sort({ sort_timestamp: -1 })
      .lean()
      .exec();
  }

  /**
   * 获取数据库中的文章列表
   * @param category 文章分类，可选
   * @param limit 限制返回数量，默认50
   * @param skip 跳过数量，默认0
   * @returns 文章列表
   */
  async getArticleList(category?: string, limit: number = 50, skip: number = 0) {
    try {
      const query = category ? { category } : {};
      const articles = await this.articleModel
        .find(query)
        .sort({ createdAt: -1 }) // 按创建时间降序排列，最新的在前
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();
      
      this.logger.log(`从数据库获取到${articles.length}篇文章${category ? `(分类: ${category})` : ''}`);
      return articles;
    } catch (error) {
      this.logger.error(`获取文章列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return [];
    }
  }

  /**
   * 获取文章总数
   * @param category 文章分类，可选
   * @returns 文章总数
   */
  async getArticleCount(category?: string): Promise<number> {
    try {
      const query = category ? { category } : {};
      const count = await this.articleModel.countDocuments(query).exec();
      this.logger.log(`数据库中共有${count}篇文章${category ? `(分类: ${category})` : ''}`);
      return count;
    } catch (error) {
      this.logger.error(`获取文章总数失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return 0;
    }
  }

  /**
   * 保存文章数据到数据库
   * @param articles 文章数据数组
   * @returns 保存的文章数量
   */
  async saveArticles(articles: any[]) {
    if (!articles || articles.length === 0) {
      this.logger.warn('没有文章数据可保存');
      return 0;
    }

    this.logger.log(`准备保存${articles.length}篇文章到数据库`);
    
    // 检查数据库连接状态
    try {
      const count = await this.articleModel.countDocuments().exec();
      this.logger.log(`当前数据库中有${count}篇文章`);
    } catch (error) {
      this.logger.error(`数据库连接错误: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return 0;
    }

    let savedCount = 0;
    
    for (const article of articles) {
      try {
        // 检查文章数据是否完整
        if (!article.id) {
          this.logger.warn(`文章缺少id字段: ${JSON.stringify(article)}`);
          continue;
        }
        
        if (!article.title) {
          this.logger.warn(`文章缺少title字段: ${JSON.stringify(article)}`);
          continue;
        }
        
        if (!article.category) {
          this.logger.warn(`文章缺少category字段: ${JSON.stringify(article)}`);
          continue;
        }
        
        if (!article.sort_timestamp) {
          this.logger.warn(`文章缺少sort_timestamp字段: ${JSON.stringify(article)}`);
          continue;
        }
        
        // 使用upsert操作，避免重复键错误
        try {
          const result = await this.articleModel.updateOne(
            { id: article.id },
            { $setOnInsert: article },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            this.logger.log(`文章创建成功: ${article.title}, ID: ${article.id}, 分类: ${article.category}`);
            savedCount++;
          } else {
            this.logger.log(`文章已存在，跳过: ${article.title}, ID: ${article.id}`);
          }
        } catch (error) {
          // 捕获可能的唯一键冲突错误
          if (error.code === 11000) {
            this.logger.warn(`文章ID冲突，跳过: ${article.id}, ${article.title}`);
          } else {
            throw error; // 重新抛出非冲突类型的错误
          }
        }
      } catch (error) {
        this.logger.error(`保存文章失败: ${error.message}`);
        this.logger.error(`错误堆栈: ${error.stack}`);
        this.logger.error(`文章数据: ${JSON.stringify(article)}`);
      }
    }
    
    this.logger.log(`成功保存${savedCount}篇文章到数据库`);
    return savedCount;
  }
}
