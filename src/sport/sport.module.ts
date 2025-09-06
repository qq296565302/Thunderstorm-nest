import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { SportRepository } from './sport.repository';
import { Sport, SportSchema } from '../database/schemas/sport.schema';
import { League, LeagueSchema } from '../database/schemas/league.schema';   
import { Article, ArticleSchema } from '../database/schemas/article.schema';
import { WebSocketService } from '../websocket/websocket.service';

/**
 * 体育新闻模块
 */
@Module({
  imports: [
    // 注册HTTP模块用于外部API调用
    HttpModule,
    // 注册定时任务模块
    ScheduleModule.forRoot(),
    // 注册体育新闻和球队数据模型
    MongooseModule.forFeature([
      { name: Sport.name, schema: SportSchema },
      { name: League.name, schema: LeagueSchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
  controllers: [SportController],
  providers: [SportService, SportRepository, WebSocketService],
  exports: [SportService, SportRepository],
})
export class SportModule {}