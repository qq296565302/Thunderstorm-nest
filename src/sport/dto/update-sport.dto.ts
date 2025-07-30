import { PartialType } from '@nestjs/swagger';
import { CreateSportDto } from './create-sport.dto';

/**
 * 更新体育新闻DTO
 * 继承创建DTO，所有字段都是可选的
 */
export class UpdateSportDto extends PartialType(CreateSportDto) {}