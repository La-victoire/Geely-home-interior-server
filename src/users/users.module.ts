import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Module } from "@nestjs/common";
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
      shield({ mode: 'LIVE'}),
      detectBot({
          mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
          // Block all bots except the following
          allow: [
            "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
            "CATEGORY:MONITOR", // Uptime monitoring services
            "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
          ],
        }),
        // Create a fixed window rate limit. Other algorithms are supported.
        fixedWindow({
          mode: "LIVE",
          window: "10s", // 10 second fixed window
          max: 5, // Allow a maximum of 2 requests
        })
    ],
  }),
  ],
  providers: [
      UsersService,
      {
        provide: APP_GUARD,
        useClass: ArcjetGuard,
      },
      CartsService, LocalStrategy, JwtStrategy
    ],
  controllers: [UsersController, CartsController]
})
export class UsersModule {}