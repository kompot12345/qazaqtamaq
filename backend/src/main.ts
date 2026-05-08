import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const messages = errors
          .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`)
          .join('; ');
        return new BadRequestException(messages);
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('QazaqTamaq API')
    .setDescription(
      'API for QazaqTamaq - Kazakh hybrid agritech marketplace connecting farmers to B2B exporters and B2C consumers',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('categories', 'Category management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token',
      },
      'JWT',
    )
    .setContact('QazaqTamaq', 'https://qazaqtamaq.kz', 'support@qazaqtamaq.kz')
    .setLicense('MIT', '')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
    ✅ QazaqTamaq Server is running on http://localhost:${port}
    📚 Swagger Documentation: http://localhost:${port}/api/docs
    🌍 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
  `);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});