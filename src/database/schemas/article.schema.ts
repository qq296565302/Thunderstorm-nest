import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 文章数据文档类型
 */
export type ArticleDocument = Article & Document;

/**
 * 文章数据模型
 */
@Schema({
  timestamps: true, // 自动添加createdAt和updatedAt字段
  collection: 'article'
})
export class Article {
  /**
   * 文章唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  id: string;

  /**
   * 文章标题
   */
  @Prop({ required: true, trim: true })
  title: string;

  /**
   * 文章分享链接
   */
  @Prop({ trim: true })
  share?: string;

  /**
   * 文章缩略图
   */
  @Prop({ trim: true })
  thumb?: string;

  /**
   * 排序时间戳
   */
  @Prop({ required: true, index: true })
  sort_timestamp: number;

  /**
   * 文章分类
   */
  @Prop({ required: true, trim: true, index: true })
  category: string;

  /**
   * 文章标签
   */
  @Prop({ trim: true })
  label?: string;
}

/**
 * 文章数据Schema
 */
export const ArticleSchema = SchemaFactory.createForClass(Article);

// 创建索引
ArticleSchema.index({ id: 1 }, { unique: true }); // 文章ID唯一索引
ArticleSchema.index({ sort_timestamp: -1 }); // 排序时间戳降序索引
ArticleSchema.index({ category: 1 }); // 分类索引