import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

/**
 * 新闻数据模型
 */
@Schema({
  timestamps: true,
  collection: 'news',
})
export class News {
  /**
   * 新闻唯一标识符
   */
  @Prop({ required: true, unique: true, index: true })
  newsId: string;

  /**
   * 新闻标题
   */
  @Prop({ required: true, index: true })
  title: string;

  /**
   * 新闻内容
   */
  @Prop({ required: true })
  content: string;

  /**
   * 新闻摘要
   */
  @Prop({ maxlength: 500 })
  summary: string;

  /**
   * 新闻分类
   */
  @Prop({ required: true, index: true })
  category: string;

  /**
   * 新闻标签
   */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /**
   * 作者信息
   */
  @Prop({
    type: {
      name: String,
      id: String,
      avatar: String,
    },
    required: true,
  })
  author: {
    name: string;
    id: string;
    avatar?: string;
  };

  /**
   * 新闻来源
   */
  @Prop({ required: true })
  source: string;

  /**
   * 新闻来源URL
   */
  @Prop()
  sourceUrl: string;

  /**
   * 发布时间
   */
  @Prop({ required: true, index: true })
  publishTime: Date;

  /**
   * 新闻状态
   */
  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published',
    index: true,
  })
  status: string;

  /**
   * 优先级
   */
  @Prop({
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true,
  })
  priority: string;

  /**
   * 新闻图片
   */
  @Prop({ type: [String], default: [] })
  images: string[];

  /**
   * 新闻视频
   */
  @Prop({ type: [String], default: [] })
  videos: string[];

  /**
   * 阅读量
   */
  @Prop({ default: 0, min: 0 })
  viewCount: number;

  /**
   * 点赞数
   */
  @Prop({ default: 0, min: 0 })
  likeCount: number;

  /**
   * 分享数
   */
  @Prop({ default: 0, min: 0 })
  shareCount: number;

  /**
   * 评论数
   */
  @Prop({ default: 0, min: 0 })
  commentCount: number;

  /**
   * 地理位置信息
   */
  @Prop({
    type: {
      country: String,
      province: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
  })
  location: {
    country?: string;
    province?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  /**
   * 语言
   */
  @Prop({ default: 'zh' })
  language: string;

  /**
   * 是否为热点新闻
   */
  @Prop({ default: false, index: true })
  isHot: boolean;

  /**
   * 是否为推荐新闻
   */
  @Prop({ default: false, index: true })
  isRecommended: boolean;

  /**
   * 是否为置顶新闻
   */
  @Prop({ default: false, index: true })
  isTop: boolean;

  /**
   * SEO关键词
   */
  @Prop({ type: [String], default: [] })
  keywords: string[];

  /**
   * 外部数据源信息
   */
  @Prop({
    type: {
      sourceId: String,
      sourceName: String,
      originalUrl: String,
      syncTime: Date,
    },
  })
  externalSource: {
    sourceId?: string;
    sourceName?: string;
    originalUrl?: string;
    syncTime?: Date;
  };

  /**
   * 创建时间
   */
  createdAt?: Date;

  /**
   * 更新时间
   */
  updatedAt?: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);

// 创建索引
NewsSchema.index({ newsId: 1 });
NewsSchema.index({ title: 'text', content: 'text', summary: 'text' });
NewsSchema.index({ category: 1, publishTime: -1 });
NewsSchema.index({ status: 1, publishTime: -1 });
NewsSchema.index({ priority: 1, publishTime: -1 });
NewsSchema.index({ isHot: 1, publishTime: -1 });
NewsSchema.index({ isRecommended: 1, publishTime: -1 });
NewsSchema.index({ isTop: 1, publishTime: -1 });
NewsSchema.index({ tags: 1 });
NewsSchema.index({ 'author.id': 1 });
NewsSchema.index({ 'location.country': 1, 'location.province': 1, 'location.city': 1 });