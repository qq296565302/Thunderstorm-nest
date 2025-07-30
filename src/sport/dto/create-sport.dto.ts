import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUrl, IsDateString } from 'class-validator';

/**
 * 创建体育新闻DTO
 */
export class CreateSportDto {
  @ApiProperty({ description: '体育新闻标题', example: '世界杯决赛精彩回顾' })
  @IsString()
  title: string;

  @ApiProperty({ description: '体育新闻内容', example: '本届世界杯决赛异常精彩...' })
  @IsString()
  content: string;

  @ApiProperty({ description: '发布时间', example: '2024-01-15T10:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  publishTime?: string;

  @ApiProperty({ description: '图片URL', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: '作者', example: '体育记者张三', required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: '是否置顶', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiProperty({ description: '标签', example: ['足球', '世界杯'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '分类', example: '足球', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '是否发布', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}