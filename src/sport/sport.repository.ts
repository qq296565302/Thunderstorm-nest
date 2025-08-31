import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sport, SportDocument } from '../database/schemas/sport.schema';
import { Team, TeamDocument } from '../database/schemas/team.schema';

@Injectable()
export class SportRepository {
  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  /**
   * 根据联赛名称获取联赛积分榜
   * @param leagueName 联赛名称
   * @returns 联赛积分榜
   */
  async getLeagueStandings(leagueName: string) {
    const standings = await this.teamModel
      .find({ league: leagueName })
      .sort({ rank: 1 })
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
    const team = await this.teamModel
      .findOne({ team_id: teamId })
      .lean()
      .exec();

    if (!team) {
      console.log('未找到球队数据', teamId);
      return [];
    }

    return team.person || [];
  }
}
