import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 体育新闻数据文档类型
 */
export type SportDocument = Sport & Document;

/**
 * 体育新闻数据模型
 */
@Schema({
  timestamps: true, // 自动添加createdAt和updatedAt字段
  collection: 'sport'
})
export class Sport {
  /**
   * 体育新闻唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  id: string;

  /**
   * 体育新闻标题
   */
  @Prop({ required: true, trim: true })
  title: string;

  /**
   * 体育新闻内容
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
   * 是否置顶
   */
  @Prop({ default: false })
  isTop?: boolean;

  /**
   * 标签列表
   */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /**
   * 体育分类（如：足球、篮球、网球等）
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
 * 体育新闻数据Schema
 */
export const SportSchema = SchemaFactory.createForClass(Sport);

// 创建索引
SportSchema.index({ id: 1 }, { unique: true }); // 体育新闻ID唯一索引
SportSchema.index({ title: 'text', content: 'text' }); // 全文搜索索引
SportSchema.index({ publishTime: -1 }); // 发布时间索引
SportSchema.index({ category: 1 }); // 分类索引
SportSchema.index({ author: 1 }); // 作者索引
SportSchema.index({ tags: 1 }); // 标签索引
SportSchema.index({ isPublished: 1, publishTime: -1 }); // 已发布文章索引
SportSchema.index({ isTop: -1, publishTime: -1 }); // 置顶文章索引
SportSchema.index({ updateTime: -1 }); // 更新时间索引