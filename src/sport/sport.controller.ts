import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SportService } from './sport.service';

/**
 * 体育新闻控制器
 */
@ApiTags('体育新闻')
@Controller('sport')
export class SportController {
  constructor(private readonly sportService: SportService) {}

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
              nationality_flag: { type: 'string', example: 'https://sd.qunliao.info/fastdfs3/M00/B5/7E/ChOxM1xC2TCAWMemAAAJsy8Pgbg246.png' },
              person_id: { type: 'string', example: '50002641' },
              detailed_type: { type: 'string', example: '主教练' },
              avatar_url: { type: 'string', example: 'https://sd.qunliao.info/fastdfs7/M00/EC/C2/rBUC6GidSPeAYYAzAAAdUnKDsLU051.jpg' },
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
}