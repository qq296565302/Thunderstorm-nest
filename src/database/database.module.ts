import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Finance, FinanceSchema } from './schemas/finance.schema';

/**
 * 数据库模块
 * 配置MongoDB连接和数据模型
 */
@Module({
  imports: [
    // MongoDB连接配置
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/thunderstorm-news',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    // 注册数据模型
    MongooseModule.forFeature([
      { name: Finance.name, schema: FinanceSchema },
    ]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {}