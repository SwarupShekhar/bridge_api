import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { PrismaService } from './prisma/prisma.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Prisma exception filter for connection error handling
  const prismaService = app.get(PrismaService);
  app.useGlobalFilters(new PrismaExceptionFilter(prismaService));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3012);
  await app.listen(port);
   
  console.log(`Bridge API is running on port ${port}`);

  // Global error handlers to prevent crash on DB disconnection
  process.on('unhandledRejection', (reason: any) => {
    const logger = new Logger('UnhandledRejection');
    logger.error('Unhandled Rejection:', reason);
    // Do not exit - let Nest's built-in error handling deal with it
  });

  process.on('uncaughtException', (error: Error) => {
    const logger = new Logger('UncaughtException');
    logger.error('Uncaught Exception:', error.message, error.stack);
    // Attempt graceful shutdown
    setTimeout(() => process.exit(1), 5000);
  });
}
bootstrap();
