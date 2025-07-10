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
   * 财经信息唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  id: string;

  /**
   * 财经标题
   */
  @Prop({ required: true, trim: true })
  title: string;

  /**
   * 财经内容
   */
  @Prop({ required: true })
  content: string;

  /**
   * 发布时间
   */
  @Prop({ required: true })
  publishTime: string;

  /**
   * 图片URL
   */
  @Prop({ trim: true })
  imageUrl?: string;

  /**
   * 作者
   */
  @Prop({ trim: true })
  author?: string;

  /**
   * 标签列表
   */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /**
   * 财经分类
   */
  @Prop({ trim: true })
  category?: string;

  /**
   * 是否已发布
   */
  @Prop({ default: true })
  isPublished?: boolean;

  /**
   * 数据更新时间
   */
  @Prop({ type: Date, default: Date.now })
  updateTime: Date;
}

/**
 * 财经数据Schema
 */
export const FinanceSchema = SchemaFactory.createForClass(Finance);

// 创建索引
FinanceSchema.index({ id: 1 }, { unique: true }); // 财经信息ID唯一索引
FinanceSchema.index({ title: 'text', content: 'text' }); // 全文搜索索引
FinanceSchema.index({ publishTime: -1 }); // 发布时间索引
FinanceSchema.index({ category: 1 }); // 分类索引
FinanceSchema.index({ author: 1 }); // 作者索引
FinanceSchema.index({ tags: 1 }); // 标签索引
FinanceSchema.index({ isPublished: 1, publishTime: -1 }); // 已发布文章索引
FinanceSchema.index({ isTop: -1, publishTime: -1 }); // 置顶文章索引
FinanceSchema.index({ updateTime: -1 }); // 更新时间索引