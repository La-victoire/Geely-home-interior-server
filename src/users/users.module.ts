import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, orderSchema } from 'src/schemas/Order.schema';
import { User, userSchema } from "src/schemas/User.schema";
import { UserSettings, UserSettingsSchema } from 'src/schemas/UserSettings.schema';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CartsService } from 'src/carts/carts.service';
import { CartsController } from 'src/carts/carts.controller';
import { Product, productSchema } from 'src/schemas/Product.schema';
import { ArcjetGuard, ArcjetModule, detectBot, fixedWindow, shield } from '@arcjet/nest';
import { CustomArcjetGuard } from './guards/custom-arcjet.guard';
import { ArcjetBypassMiddleware } from './arcjet-bypass.middleware';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name,
      schema: userSchema,
    },
    {
      name: UserSettings.name,
      schema: UserSettingsSchema,
    },
    {
      name: Order.name,
      schema: orderSchema,
    },
    {
      name: Product.name,
      schema: productSchema
    },
  ]),
   PassportModule,
    JwtModule.register({
      secret: "secret",
      signOptions: { expiresIn: '1h'}
    }),
    ArcjetModule.forRoot({
      key: <string>process.env.ARCJET_KEY,
      rules: [
        shield({ mode: 'LIVE' }),
        detectBot({
          mode: 'LIVE',
          allow: [
            'CATEGORY:SEARCH_ENGINE',
            'CATEGORY:MONITOR',
            'CATEGORY:PREVIEW',
          ],
        }),
        fixedWindow({
          mode: 'LIVE',
          window: '10s',
          max: 5,
        }),
      ],
    }),
  ],
  providers: [
      UsersService,
      {
        provide: APP_GUARD,
        useClass: CustomArcjetGuard,
      },
      CartsService, LocalStrategy, JwtStrategy
    ],
  controllers: [UsersController, CartsController]
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ArcjetBypassMiddleware).forRoutes('*');
  }
}