import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sport, SportDocument } from '../database/schemas/sport.schema';
import { Team, TeamDocument } from '../database/schemas/team.schema';

/**
 * 体育新闻数据访问层
 */
@Injectable()
export class SportRepository {
  constructor(
    @InjectModel(Sport.name) private sportModel: Model<SportDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  /**
   * 根据球队ID获取球员列表
   * @param teamId 球队ID
   * @returns 球员列表
   */
  async getPlayersByTeamId(teamId: string) {
    const team = await this.teamModel.findOne({ team_id: teamId }).lean().exec();
    
    if (!team) {
      console.log('未找到球队数据');
      return [];
    }

    return team.person || [];
  }
}