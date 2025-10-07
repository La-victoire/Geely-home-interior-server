import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: ['http://localhost:3000', 'https://geelyhomeinteriors.vercel.app','https://nonmathematical-charley-milkier.ngrok-free.dev'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With','Accept','Origin', 'ngrok-skip-browser-warning',],
  })
  await app.listen(process.env.PORT ?? 3000); 
}
bootstrap();
