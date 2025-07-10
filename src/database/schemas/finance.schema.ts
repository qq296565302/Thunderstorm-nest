import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 财经数据文档类型
 */
export type FinanceDocument = Finance & Document;

/**
 * 财经数据模型
 */
@Schema({
  timestamps: true, // 自动添加createdAt和updatedAt字段
  collection: 'finance'
})
export class Finance {
  /**
   * 股票代码
   */
  @Prop({ required: true, trim: true, uppercase: true })
  symbol: string;

  /**
   * 股票名称
   */
  @Prop({ required: true, trim: true })
  name: string;

  /**
   * 当前价格
   */
  @Prop({ required: true, min: 0 })
  price: number;

  /**
   * 涨跌额
   */
  @Prop({ required: true })
  change: number;

  /**
   * 涨跌幅百分比
   */
  @Prop({ required: true })
  changePercent: number;

  /**
   * 成交量
   */
  @Prop({ min: 0 })
  volume?: number;

  /**
   * 市值
   */
  @Prop({ min: 0 })
  marketCap?: number;

  /**
   * 开盘价
   */
  @Prop({ min: 0 })
  openPrice?: number;

  /**
   * 最高价
   */
  @Prop({ min: 0 })
  highPrice?: number;

  /**
   * 最低价
   */
  @Prop({ min: 0 })
  lowPrice?: number;

  /**
   * 昨收价
   */
  @Prop({ min: 0 })
  previousClose?: number;

  /**
   * 市场类型
   */
  @Prop({ 
    enum: ['stock', 'crypto', 'forex', 'commodity'], 
    default: 'stock' 
  })
  marketType: string;

  /**
   * 交易所
   */
  @Prop({ trim: true })
  exchange?: string;

  /**
   * 货币单位
   */
  @Prop({ default: 'USD', trim: true, uppercase: true })
  currency: string;

  /**
   * 数据更新时间
   */
  @Prop({ type: Date, default: Date.now })
  updateTime: Date;

  /**
   * 是否为活跃交易
   */
  @Prop({ default: true })
  isActive: boolean;

  /**
   * 52周最高价
   */
  @Prop({ min: 0 })
  week52High?: number;

  /**
   * 52周最低价
   */
  @Prop({ min: 0 })
  week52Low?: number;

  /**
   * 市盈率
   */
  @Prop({ min: 0 })
  peRatio?: number;

  /**
   * 股息收益率
   */
  @Prop({ min: 0 })
  dividendYield?: number;
}

/**
 * 财经数据Schema
 */
export const FinanceSchema = SchemaFactory.createForClass(Finance);

// 创建索引
FinanceSchema.index({ symbol: 1 }, { unique: true }); // 股票代码唯一索引
FinanceSchema.index({ marketType: 1 }); // 市场类型索引
FinanceSchema.index({ updateTime: -1 }); // 更新时间索引
FinanceSchema.index({ isActive: 1, updateTime: -1 }); // 活跃股票索引