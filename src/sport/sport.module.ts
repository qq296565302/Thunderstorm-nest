import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { SportRepository } from './sport.repository';
import { Sport, SportSchema } from '../database/schemas/sport.schema';
import { League, LeagueSchema } from '../database/schemas/league.schema';   
import { WebSocketService } from '../websocket/websocket.service';

/**
 * 体育新闻模块
 */
@Module({
  imports: [
    // 注册体育新闻和球队数据模型
    MongooseModule.forFeature([
      { name: Sport.name, schema: SportSchema },
      { name: League.name, schema: LeagueSchema },
    ]),
  ],
  controllers: [SportController],
  providers: [SportService, SportRepository, WebSocketService],
  exports: [SportService, SportRepository],
})
export class SportModule {}