import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 体育新闻查询DTO
 */
export class QuerySportDto {
  @ApiProperty({ description: '页码', example: 1, required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '搜索关键词', example: '足球', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '分类', example: '足球', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '作者', example: '体育记者张三', required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: '是否只显示已发布', example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: '是否只显示置顶', example: false, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isTop?: boolean;

  @ApiProperty({ description: '排序字段', example: 'publishTime', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'publishTime';

  @ApiProperty({ description: '排序方向', example: 'desc', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}