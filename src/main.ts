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
    .addTag('sport', '体育新闻相关接口')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  
  // 获取本机IP地址
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // 查找局域网IP地址
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`🚀 雷雨资讯已启动`);
  console.log(`📖 API文档地址: http://localhost:${port}/api-docs`);
  console.log(`🌐 本地访问地址: http://localhost:${port}`);
  console.log(`🌐 局域网访问地址: http://${localIP}:${port}`);
  console.log(`📡 WebSocket连接地址: ws://${localIP}:${port}`);
}
bootstrap();
