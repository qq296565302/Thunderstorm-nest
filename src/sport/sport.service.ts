import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SportRepository } from './sport.repository';
import { WebSocketService } from '../websocket/websocket.service';
import { Person } from '../database/schemas/league.schema';
import { firstValueFrom } from 'rxjs';

/**
 * 体育新闻服务层
 */
@Injectable()
export class SportService {
  private readonly logger = new Logger(SportService.name);

  constructor(
    private readonly sportRepository: SportRepository,
    private readonly webSocketService: WebSocketService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 根据联赛名称获取联赛积分榜
   * @param leagueName 联赛名称
   * @returns 联赛积分榜
   */
  async getLeagueStandings(leagueName: string) {
    const standings = await this.sportRepository.getLeagueStandings(leagueName);
    return standings;
  }


  /**
   * 根据球队ID获取球员列表
   * @param teamId 球队ID
   * @returns 球员列表，包含position、jersey_number、name、appearances、goals、nationality_flag、person_id、detailed_type、avatar_url等字段
   */
  async getPlayersByTeamId(teamId: string): Promise<{
    code: number;
    message: string;
    data: Person[];
  }> {
    try {
      const players = await this.sportRepository.getPlayersByTeamId(teamId);
      
      return {
        code: 200,
        message: '获取球员列表成功',
        data: players,
      };
    } catch (error) {
      return {
        code: 500,
        message: '获取球员列表失败',
        data: [],
      };
    }
  }

  /**
   * 获取数据库中的动态文章列表
   * @param category 文章分类，可选
   * @param limit 限制返回数量，默认50
   * @param skip 跳过数量，默认0
   * @returns 包含文章列表的响应对象
   */
  async getArticleListFromDB(category?: string, limit: number = 50, skip: number = 0) {
    try {
      this.logger.log(`获取数据库文章列表，分类: ${category || '全部'}, 限制: ${limit}, 跳过: ${skip}`);
      
      const articles = await this.sportRepository.getArticleList(category, limit, skip);
      
      if (!articles || articles.length === 0) {
        this.logger.warn('数据库中没有找到文章');
        return {
          code: 200,
          message: '暂无文章数据',
          data: [],
          total: 0
        };
      }
      
      // 获取总数（用于分页）
       const total = await this.sportRepository.getArticleCount(category);
      
      this.logger.log(`成功获取${articles.length}篇文章，总计${total}篇`);
      
      return {
        code: 200,
        message: '获取文章列表成功',
        data: articles,
        total: total,
        pagination: {
          limit,
          skip,
          hasMore: skip + articles.length < total
        }
      };
    } catch (error) {
      this.logger.error(`获取数据库文章列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return {
        code: 500,
        message: '获取文章列表失败',
        data: [],
        total: 0
      };
    }
  }


  /**
   * 获取动态详情，根据传入的articleId，请求爬虫服务，接收爬虫返回详情数据
   * @param articleId 动态ID
   * @returns 动态详情
   */
  async getArticleDetail(articleId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://192.168.1.128:5560/api/spider/article`, {
          params: { articleId },
          timeout: 10000, // 10秒超时
        })
      );
      console.log('获取动态详情成功:', response.data);
      return {
        code: 200,
        message: '获取动态详情成功',
        data: response.data,
      };
    } catch (error) {
      console.error('获取动态详情失败:', error.message);
    }
  }

  /**
   * 获取动态列表并保存足球类文章到数据库
   * @returns 动态列表和保存结果
   */
  async getArticleList() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://www.dongqiudi.com/api/app/tabs/web/1.json`)
      );      
      // 检查response.data是否存在
      if (!response || !response.data) {
        this.logger.error('API返回数据为空或无效');
        return {
          code: 400,
          message: 'API返回数据为空或无效',
          data: [],
        };
      }
      // 检查response.data.articles是否存在
      if (!response.data.articles || !Array.isArray(response.data.articles)) {
        this.logger.error('API返回的articles数据为空或无效');
        return {
          code: 400,
          message: 'API返回的articles数据为空或无效',
          data: [],
        };
      }
      
      return {
        code: 200,
        message: '获取动态列表成功',
        data: response.data.articles,
      };
    } catch (error) {
      this.logger.error(`获取动态列表失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return {
        code: 500,
        message: '获取动态列表失败',
        data: [],
      };
    }
  }

  /**
   * 保存足球类文章到数据库
   * 根据文章ID判断是否已存在，不存在则保存
   * @param articles 文章数据数组
   * @returns 保存的文章数量
   */
  async saveFootballArticles(articles: any) {
    // 检查articles是否为数组
    if (!articles || !Array.isArray(articles)) {
      this.logger.error(`saveFootballArticles方法接收到无效数据: ${typeof articles}`);
      return 0;
    }
    
    if (articles.length === 0) {
      this.logger.warn('没有文章数据可保存');
      return 0;
    }

    this.logger.log(`准备处理${articles.length}条文章数据`);
    
    try {
      // 1. 只过滤出足球类文章
      const footballArticles = articles
        .filter(article => {
          if (!article || typeof article !== 'object') {
            return false;
          }
          const isFootball = article.category === '足球';
          return isFootball;
        })
        .filter(article => {
          if (!article.sort_timestamp) {
            this.logger.warn(`文章缺少sort_timestamp字段: ${article.title}`);
            return false;
          }
          return true; // 不再基于时间戳过滤，保留所有有效的足球文章
        })
        .sort((a, b) => a.sort_timestamp - b.sort_timestamp); // 按时间戳升序排序，确保先保存较早的文章

      if (footballArticles.length === 0) {
        this.logger.log('没有足球文章需要处理');
        return 0;
      }

      this.logger.log(`找到${footballArticles.length}篇足球文章，将检查并保存不存在的文章`);

      // 2. 保存文章到数据库，repository层会处理重复ID的情况
      const savedCount = await this.sportRepository.saveArticles(footballArticles);
      this.logger.log(`成功保存${savedCount}篇新的足球文章`);
      
      return savedCount;
    } catch (error) {
      this.logger.error(`保存足球文章失败: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      return 0;
    }
  }

  /**
   * 定时获取动态列表并保存足球类文章到数据库
   * 每30分钟执行一次
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchArticleListScheduled() {
    this.logger.log('执行定时任务: 获取动态列表并保存足球类文章');
    try {
      const articleList = await this.getArticleList();
      
      if (articleList && articleList.code === 200) {
        if (!articleList.data) {
          this.logger.warn('定时任务警告: API返回的data字段为空');
          return;
        }
        
        if (!Array.isArray(articleList.data)) {
          this.logger.error(`定时任务错误: API返回的data不是数组，而是 ${typeof articleList}`);
          this.logger.error(`data内容: ${JSON.stringify(articleList.data).substring(0, 200)}...`);
          return;
        }
                
        // 保存足球类文章到数据库
        const savedCount = await this.saveFootballArticles(articleList.data);
        
        // 如果有新文章保存成功，通过WebSocket推送最新动态列表给客户端
        if (savedCount > 0) {
          const clientCount = this.webSocketService.broadcastToAll('articleListUpdate', {
            message: `有${savedCount}篇新的足球文章更新`,
            articles: await this.sportRepository.getLatestArticle('足球')
          });
          this.logger.log(`定时任务完成: 已保存${savedCount}篇足球文章并推送给${clientCount}个客户端`);
        } else {
          this.logger.log('定时任务完成: 没有新的足球文章需要保存');
        }
      } else {
        this.logger.warn(`定时任务失败: 获取动态列表失败 ${articleList ? articleList.message : '未知错误'}`);
      }
    } catch (error) {
      this.logger.error(`定时任务失败: ${error.message}`);
    }
  }
}