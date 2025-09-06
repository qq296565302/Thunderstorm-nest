import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SportService } from './sport.service';

/**
 * 体育新闻控制器
 */
@ApiTags('体育新闻')
@Controller('sport')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  /**
   * 根据联赛名称获取联赛积分榜
   */
  @Get('league/rank')
  @ApiOperation({ summary: '根据联赛名称获取联赛积分榜' })
  @ApiQuery({ name: 'leagueName', description: '联赛名称，支持中文（如：英超、西甲、中超等）', required: true })
  @ApiResponse({
    status: 200,
    description: '获取联赛积分榜成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取联赛积分榜成功' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              team_id: { type: 'string', example: '131' },
              league: { type: 'string', example: '英超' },
              name: { type: 'string', example: '曼城' },
              city: { type: 'string', example: '伦敦' },
              foundedYear: { type: 'number', example: 1881 },
              logoUrl: {
                type: 'string',
                example:
                  'https://sd.qunliao.info/fastdfs3/M00/B5/7E/ChOxM1xC2TCAWMemAAAJsy8Pgbg246.png',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '获取联赛积分榜失败',
  })
  async getLeagueStandings(@Query('leagueName') leagueName: string) {
    return this.sportService.getLeagueStandings(leagueName);
  }

  /**
   * 根据球队ID获取球员列表
   */
  @Get('team/:teamId/players')
  @ApiOperation({ summary: '根据球队ID获取球员列表' })
  @ApiParam({ name: 'teamId', description: '球队ID' })
  @ApiResponse({
    status: 200,
    description: '获取球员列表成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取球员列表成功' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              position: { type: 'string', example: '教练' },
              jersey_number: { type: 'string', example: '~' },
              name: { type: 'string', example: '阿尔特塔' },
              appearances: { type: 'string', example: '~' },
              goals: { type: 'string', example: '~' },
              nationality_flag: {
                type: 'string',
                example:
                  'https://sd.qunliao.info/fastdfs3/M00/B5/7E/ChOxM1xC2TCAWMemAAAJsy8Pgbg246.png',
              },
              person_id: { type: 'string', example: '50002641' },
              detailed_type: { type: 'string', example: '主教练' },
              avatar_url: {
                type: 'string',
                example:
                  'https://sd.qunliao.info/fastdfs7/M00/EC/C2/rBUC6GidSPeAYYAzAAAdUnKDsLU051.jpg',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '获取球员列表失败',
  })
  async getPlayersByTeamId(@Param('teamId') teamId: string) {
    return this.sportService.getPlayersByTeamId(teamId);
  }

  /**
   * 获取数据库中的文章列表
   */
  @Get('article/list/db')
  @ApiOperation({ summary: '获取数据库中的文章列表' })
  @ApiQuery({ name: 'category', description: '文章分类（如：足球、篮球等）', required: false })
  @ApiQuery({ name: 'limit', description: '限制返回数量，默认50', required: false, type: 'number' })
  @ApiQuery({ name: 'skip', description: '跳过数量，默认0', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: '获取文章列表成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取文章列表成功' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '123456' },
              title: { type: 'string', example: '足球新闻标题' },
              category: { type: 'string', example: '足球' },
              sort_timestamp: { type: 'number', example: 1640995200000 },
              author: { type: 'string', example: '体育记者' },
              summary: { type: 'string', example: '新闻摘要' },
            },
          },
        },
        total: { type: 'number', example: 100 },
        pagination: {
          type: 'object',
          properties: {
            limit: { type: 'number', example: 50 },
            skip: { type: 'number', example: 0 },
            hasMore: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '获取文章列表失败',
  })
  async getArticleListFromDB(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const limitNum = limit ? Number(limit) : 50;
    const skipNum = skip ? Number(skip) : 0;
    return this.sportService.getArticleListFromDB(category, limitNum, skipNum);
  }

  /**
   * 获取动态详情，根据传入的articleId，请求爬虫服务，接收爬虫返回详情数据
   */
  @Get('article/detail')
  @ApiOperation({ summary: '获取动态详情' })
  @ApiQuery({ name: 'articleId', description: '动态ID', required: true })
  @ApiResponse({
    status: 200,
    description: '获取动态详情成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取动态详情成功' },
        data: {
          type: 'object',
          properties: {
            articleId: { type: 'string', example: '123456' },
            title: { type: 'string', example: '动态标题' },
            content: { type: 'string', example: '动态内容' },
            author: { type: 'string', example: '作者' },
            publishTime: { type: 'string', example: '2023-01-01 12:00:00' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '获取动态详情失败',
  })
  async getArticleDetail(@Query('articleId') articleId: string) {
    return this.sportService.getArticleDetail(articleId);
  }
}
