import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

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

  const port = process.env.PORT || 3012;
  await app.listen(port);
  
  console.log(`Bridge API is running on port ${port}`);
}
bootstrap();
