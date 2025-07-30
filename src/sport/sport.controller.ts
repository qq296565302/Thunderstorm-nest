import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SportService } from './sport.service';
import { Sport } from '../database/schemas/sport.schema';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { QuerySportDto } from './dto/query-sport.dto';

/**
 * 体育新闻控制器
 */
@ApiTags('体育新闻')
@Controller('sport')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  /**
   * 获取体育新闻列表
   */
  @Get()
  @ApiOperation({ summary: '获取体育新闻列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QuerySportDto) {
    return this.sportService.findAll(query);
  }

  /**
   * 根据ID获取体育新闻详情
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID获取体育新闻详情' })
  @ApiParam({ name: 'id', description: '体育新闻ID' })
  @ApiResponse({
    status: 200,
    description: '获取体育新闻详情成功',
  })
  @ApiResponse({
    status: 404,
    description: '体育新闻不存在',
  })
  async getSportById(@Param('id') id: string) {
    return this.sportService.getSportById(id);
  }

  /**
   * 创建体育新闻
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建体育新闻' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @UsePipes(new ValidationPipe())
  async create(@Body() createSportDto: CreateSportDto) {
    return this.sportService.create(createSportDto);
  }

  /**
   * 更新体育新闻
   */
  @Put(':id')
  @ApiOperation({ summary: '更新体育新闻' })
  @ApiParam({ name: 'id', description: '体育新闻ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '体育新闻不存在' })
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportService.update(id, updateSportDto);
  }

  /**
   * 删除体育新闻
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除体育新闻' })
  @ApiParam({ name: 'id', description: '体育新闻ID' })
  @ApiResponse({
    status: 200,
    description: '删除体育新闻成功',
  })
  @ApiResponse({
    status: 404,
    description: '体育新闻不存在',
  })
  async deleteSport(@Param('id') id: string) {
    return this.sportService.deleteSport(id);
  }

  /**
   * 搜索体育新闻
   */
  @Get('search/:keyword')
  @ApiOperation({ summary: '搜索体育新闻' })
  @ApiParam({ name: 'keyword', description: '搜索关键词' })
  @ApiQuery({ name: 'page', required: false, description: '页码，默认为1' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量，默认为10' })
  @ApiResponse({
    status: 200,
    description: '搜索体育新闻成功',
  })
  async searchSport(
    @Param('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.sportService.searchSport(keyword, pageNum, limitNum);
  }
}