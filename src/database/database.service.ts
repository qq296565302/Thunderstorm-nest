import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Finance, FinanceDocument } from './schemas/finance.schema';

/**
 * 数据库服务类
 * 提供常用的数据库操作方法
 */
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
  ) {}
}