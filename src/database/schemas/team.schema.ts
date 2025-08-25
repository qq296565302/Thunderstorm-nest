import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 球队数据文档类型
 */
export type TeamDocument = Team & Document;

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
  collection: 'teams'
})
export class Team {
  /**
   * 球队唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  team_id: string;

  /**
   * 球队名称
   */
  @Prop({ required: true, trim: true })
  name: string;

  /**
   * 球队简称
   */
  @Prop({ trim: true })
  shortName?: string;

  /**
   * 球队所在城市
   */
  @Prop({ trim: true })
  city?: string;

  /**
   * 球队成立年份
   */
  @Prop()
  foundedYear?: number;

  /**
   * 球队logo URL
   */
  @Prop({ trim: true })
  logoUrl?: string;

  /**
   * 球员列表
   */
  @Prop({ type: [Object], default: [] })
  person: Person[];

  /**
   * 球队描述
   */
  @Prop({ trim: true })
  description?: string;

  /**
   * 是否为活跃球队
   */
  @Prop({ default: true })
  isActive?: boolean;

  /**
   * 数据更新时间
   */
  @Prop({ type: Date, default: Date.now })
  updateTime: Date;
}

/**
 * 球队数据Schema
 */
export const TeamSchema = SchemaFactory.createForClass(Team);

// 创建索引
TeamSchema.index({ team_id: 1 }, { unique: true }); // 球队ID唯一索引
TeamSchema.index({ name: 1 }); // 球队名称索引
TeamSchema.index({ city: 1 }); // 城市索引
TeamSchema.index({ isActive: 1 }); // 活跃状态索引
TeamSchema.index({ updateTime: -1 }); // 更新时间索引