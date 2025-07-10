import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

/**
 * 用户数据模型
 */
@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  /**
   * 用户唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  /**
   * 用户昵称
   */
  @Prop({ required: true })
  nickname: string;

  /**
   * 用户邮箱
   */
  @Prop({ required: true, unique: true, index: true })
  email: string;

  /**
   * 当前WebSocket连接ID
   */
  @Prop({ default: null })
  currentSocketId: string;

  /**
   * 订阅设置
   */
  @Prop({
    type: {
      newsCategories: [String],
      stockSymbols: [String],
      systemNotifications: { type: Boolean, default: true },
      emergencyNews: { type: Boolean, default: true },
    },
    default: {
      newsCategories: [],
      stockSymbols: [],
      systemNotifications: true,
      emergencyNews: true,
    },
  })
  subscriptions: {
    newsCategories: string[];
    stockSymbols: string[];
    systemNotifications: boolean;
    emergencyNews: boolean;
  };

  /**
   * 用户状态
   */
  @Prop({
    type: String,
    enum: ['active', 'inactive', 'banned', 'online', 'offline'],
    default: 'active',
    index: true,
  })
  status: string;

  /**
   * 最后在线时间
   */
  @Prop({ default: Date.now })
  lastOnline: Date;

  /**
   * 用户偏好设置
   */
  @Prop({
    type: {
      language: { type: String, default: 'zh' },
      timezone: { type: String, default: 'Asia/Shanghai' },
      theme: { type: String, default: 'light' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
    default: {
      language: 'zh',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
  })
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };

  /**
   * 用户标签
   */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /**
   * 是否为VIP用户
   */
  @Prop({ default: false, index: true })
  isVip: boolean;

  /**
   * 用户等级
   */
  @Prop({ default: 1, min: 1, max: 100 })
  level: number;

  /**
   * 用户积分
   */
  @Prop({ default: 0, min: 0 })
  points: number;

  /**
   * 设备信息
   */
  @Prop({
    type: {
      deviceType: String,
      deviceId: String,
      userAgent: String,
      ip: String,
    },
    default: {},
  })
  deviceInfo: {
    deviceType?: string;
    deviceId?: string;
    userAgent?: string;
    ip?: string;
  };

  /**
   * 账户激活状态
   */
  @Prop({ default: true })
  isActive: boolean;

  /**
   * 创建时间
   */
  createdAt?: Date;

  /**
   * 更新时间
   */
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 创建索引
UserSchema.index({ userId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isVip: 1 });
UserSchema.index({ lastOnline: -1 });
UserSchema.index({ 'subscriptions.newsCategories': 1 });
UserSchema.index({ 'subscriptions.stockSymbols': 1 });