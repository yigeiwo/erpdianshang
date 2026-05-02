import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { rateLimiter } from './common/middleware/rate-limiter.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const frontendUrl = configService.get<string>('app.frontendUrl') || 'http://localhost:5173';

  app.setGlobalPrefix('api');

  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  if (process.env.CORS_ORIGINS) {
    allowedOrigins.push(...process.env.CORS_ORIGINS.split(',').map(s => s.trim()));
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.use(rateLimiter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('电商ERP系统 API')
    .setDescription('电商ERP系统 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('系统', '系统相关')
    .addTag('认证', '认证相关')
    .addTag('用户管理', '用户管理')
    .addTag('商品管理', '商品管理')
    .addTag('库存管理', '库存管理')
    .addTag('采购管理', '采购管理')
    .addTag('销售管理', '销售管理')
    .addTag('平台订单', '平台订单管理')
    .addTag('平台产品', '平台产品管理')
    .addTag('平台库存', '平台库存管理')
    .addTag('数据分析', '数据分析')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);
}

bootstrap();
