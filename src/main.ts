import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * 应用启动函数
 * 配置Swagger文档和CORS支持
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用CORS跨域支持
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 配置Swagger API文档
  const config = new DocumentBuilder()
    .setTitle('雷雨资讯API')
    .setDescription('雷雨资讯的后端API接口文档')
    .setVersion('1.0')
    .addTag('finance', '财经相关接口')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 雷雨资讯已启动`);
  console.log(`📖 API文档地址: http://localhost:${port}/api-docs`);
  console.log(`🌐 服务地址: http://localhost:${port}`);
}
bootstrap();
