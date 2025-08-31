import { Injectable } from '@nestjs/common';
import { SportRepository } from './sport.repository';
import { WebSocketService } from '../websocket/websocket.service';
import { Person } from '../database/schemas/league.schema';

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
}