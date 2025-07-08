# NestJS Swagger 使用说明文档

## 📖 概述

Swagger 是一个强大的 API 文档生成工具，在 NestJS 中通过 `@nestjs/swagger` 包可以轻松集成，自动生成交互式的 API 文档。本文档将详细介绍如何在 NestJS 项目中使用 Swagger。

## 🚀 安装依赖

```bash
npm install @nestjs/swagger swagger-ui-express
```

## ⚙️ 基础配置

### 1. 在 main.ts 中配置 Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS
  app.enableCors();
  
  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('雷雨资讯API')           // API 标题
    .setDescription('雷雨资讯的后端API接口文档')  // API 描述
    .setVersion('1.0')                    // API 版本
    .addTag('finance', '财经相关接口')      // 添加标签
    .build();
    
  // 创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, config);
  
  // 设置 Swagger UI 路径
  SwaggerModule.setup('api-docs', app, document);
  
  await app.listen(3000);
  console.log('📖 API文档地址: http://localhost:3000/api-docs');
}
bootstrap();
```

## 🏷️ 常用装饰器详解

### 1. @ApiTags - 控制器标签

用于给控制器分组，在 Swagger UI 中显示为不同的模块。

```typescript
import { ApiTags } from '@nestjs/swagger';

@ApiTags('finance')  // 标记为财经模块
@Controller('finance')
export class FinanceController {
  // ...
}
```

### 2. @ApiOperation - 接口操作描述

为每个 API 接口添加详细的描述信息。

```typescript
import { ApiOperation } from '@nestjs/swagger';

@Get()
@ApiOperation({ 
  summary: '获取财经列表',           // 简短描述
  description: '分页获取财经信息列表'  // 详细描述
})
getFinanceList() {
  // ...
}
```

### 3. @ApiParam - 路径参数

描述 URL 路径中的参数。

```typescript
import { ApiParam } from '@nestjs/swagger';

@Get(':id')
@ApiParam({ 
  name: 'id',                    // 参数名
  description: '财经信息的唯一标识符',  // 参数描述
  type: 'string',                // 参数类型
  example: '1'                   // 示例值
})
getFinanceById(@Param('id') id: string) {
  // ...
}
```

### 4. @ApiQuery - 查询参数

描述 URL 查询字符串中的参数。

```typescript
import { ApiQuery } from '@nestjs/swagger';

@Get()
@ApiQuery({ 
  name: 'page',                  // 参数名
  required: false,               // 是否必需
  description: '页码，从1开始',    // 参数描述
  type: 'number',                // 参数类型
  example: 1                     // 示例值
})
@ApiQuery({ 
  name: 'limit', 
  required: false, 
  description: '每页数量', 
  type: 'number', 
  example: 10 
})
getFinanceList(
  @Query('page') page?: number,
  @Query('limit') limit?: number
) {
  // ...
}
```

### 5. @ApiResponse - 响应描述

描述 API 的响应格式和状态码。

```typescript
import { ApiResponse } from '@nestjs/swagger';

@Get()
@ApiResponse({ 
  status: 200,                   // HTTP 状态码
  description: '成功获取财经列表',  // 响应描述
  type: FinanceListResponse      // 响应数据类型
})
@ApiResponse({ 
  status: 400, 
  description: '请求参数错误' 
})
getFinanceList() {
  // ...
}
```

## 📋 数据模型装饰器

### 1. @ApiProperty - 属性描述

为接口或 DTO 的属性添加描述。

```typescript
import { ApiProperty } from '@nestjs/swagger';

export interface Finance {
  @ApiProperty({ 
    description: '财经信息的唯一标识符',
    example: '1'
  })
  id: string;
  
  @ApiProperty({ 
    description: '财经信息标题',
    example: '股市今日大涨'
  })
  title: string;
  
  @ApiProperty({ 
    description: '财经信息内容',
    example: '今日股市表现强劲...'
  })
  content: string;
  
  @ApiProperty({ 
    description: '财经分类',
    enum: ['stock', 'monetary', 'crypto'],
    example: 'stock'
  })
  category: string;
  
  @ApiProperty({ 
    description: '发布时间',
    example: '2024-01-01T00:00:00Z'
  })
  publishTime: string;
}
```

### 2. @ApiPropertyOptional - 可选属性

标记可选属性。

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinanceDto {
  @ApiProperty({ description: '标题' })
  title: string;
  
  @ApiPropertyOptional({ description: '描述' })
  description?: string;
}
```

## 🔧 高级配置

### 1. 添加认证配置

```typescript
const config = new DocumentBuilder()
  .setTitle('API文档')
  .setDescription('API接口文档')
  .setVersion('1.0')
  .addBearerAuth()  // 添加 Bearer Token 认证
  .build();
```

### 2. 添加服务器配置

```typescript
const config = new DocumentBuilder()
  .setTitle('API文档')
  .setDescription('API接口文档')
  .setVersion('1.0')
  .addServer('http://localhost:3000', '开发环境')
  .addServer('https://api.example.com', '生产环境')
  .build();
```

### 3. 自定义 Swagger UI 配置

```typescript
SwaggerModule.setup('api-docs', app, document, {
  customSiteTitle: '雷雨财经API文档',
  customfavIcon: '/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,  // 保持认证状态
    displayRequestDuration: true // 显示请求耗时
  }
});
```

## 📝 最佳实践

### 1. 控制器层面的完整示例

```typescript
import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { Finance, FinanceListResponse } from './interfaces/finance.interface';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @ApiOperation({ summary: '获取财经列表', description: '分页获取财经信息列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: '成功获取财经列表', type: FinanceListResponse })
  getFinanceList(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): FinanceListResponse {
    return this.financeService.getFinanceList(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取财经详情', description: '根据ID获取单条财经信息' })
  @ApiParam({ name: 'id', description: '财经信息ID', type: 'string', example: '1' })
  @ApiResponse({ status: 200, description: '成功获取财经详情', type: Finance })
  @ApiResponse({ status: 404, description: '财经信息不存在' })
  getFinanceById(@Param('id') id: string): Finance | null {
    return this.financeService.getFinanceById(id);
  }
}
```

### 2. 接口定义的完整示例

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * 财经信息接口
 */
export interface Finance {
  @ApiProperty({ description: '财经信息ID', example: '1' })
  id: string;
  
  @ApiProperty({ description: '标题', example: '股市今日大涨' })
  title: string;
  
  @ApiProperty({ description: '内容', example: '今日股市表现强劲...' })
  content: string;
  
  @ApiProperty({ 
    description: '分类', 
    enum: ['stock', 'monetary', 'crypto', 'realestate', 'automotive'],
    example: 'stock' 
  })
  category: string;
  
  @ApiProperty({ description: '发布时间', example: '2024-01-01T00:00:00Z' })
  publishTime: string;
}

/**
 * 财经列表响应接口
 */
export interface FinanceListResponse {
  @ApiProperty({ description: '财经信息列表', type: [Finance] })
  data: Finance[];
  
  @ApiProperty({ description: '总数量', example: 100 })
  total: number;
  
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;
  
  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;
}
```

## 🎯 使用技巧

### 1. 分组管理
- 使用 `@ApiTags` 将相关的接口分组
- 每个模块使用独立的标签名称

### 2. 详细描述
- 为每个接口添加 `@ApiOperation` 描述
- 为参数添加示例值和详细说明

### 3. 响应格式
- 明确定义所有可能的响应状态码
- 使用接口或 DTO 定义响应数据结构

### 4. 参数验证
- 结合 `class-validator` 进行参数验证
- 使用 DTO 类定义请求体结构

## 🔍 访问文档

配置完成后，启动应用程序，访问以下地址查看 API 文档：

- **Swagger UI**: http://localhost:3000/api-docs
- **JSON 格式**: http://localhost:3000/api-docs-json

## 📚 总结

NestJS Swagger 集成提供了强大的 API 文档生成能力，通过合理使用装饰器可以生成清晰、完整的 API 文档。主要优势包括：

- 🔄 **自动同步**: 代码变更时文档自动更新
- 🎨 **交互式**: 可直接在文档中测试 API
- 📖 **标准化**: 遵循 OpenAPI 规范
- 🚀 **易维护**: 文档与代码保持一致

通过本文档的指导，您可以在 NestJS 项目中高效地使用 Swagger 来管理和展示 API 文档。