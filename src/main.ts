import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: ['http://localhost:3000', 'https://geelyhomeinteriors.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With','Accept','Origin'],
  })
  await app.listen(process.env.PORT ?? 3000); 
}
bootstrap();
