import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 球队数据文档类型
 */
export type LeagueDocument = League & Document;

/**
 * 球员信息接口
 */
export interface Person {
  position: string;
  jersey_number: string;
  name: string;
  appearances: string;
  goals: string;
  nationality_flag: string;
  person_id: string;
  detailed_type: string;
  avatar_url: string;
}

/**
 * 球队数据模型
 */
@Schema({
  timestamps: true, // 自动添加createdAt和updatedAt字段
  collection: 'league'
})
export class League {
  /**
   * 球队唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  team_id: string;

  /**
   * 联赛名称
   */
  @Prop({ required: true, trim: true })
  league: string;

  /**
   * 球员列表
   */
  @Prop({ type: [Object], default: [] })
  person: Person[];

}

/**
 * 联赛数据Schema
 */
export const LeagueSchema = SchemaFactory.createForClass(League);

// 创建索引
LeagueSchema.index({ team_id: 1 }, { unique: true }); // 球队ID唯一索引
LeagueSchema.index({ league: 1 }); // 联赛索引
LeagueSchema.index({ name: 1 }); // 球队名称索引
LeagueSchema.index({ city: 1 }); // 城市索引
LeagueSchema.index({ isActive: 1 }); // 活跃状态索引
LeagueSchema.index({ updateTime: -1 }); // 更新时间索引
