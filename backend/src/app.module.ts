import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { GamificationModule } from './gamification/gamification.module';
import { ChatModule } from './chat/chat.module';
import { CamerasModule } from './cameras/cameras.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET environment variable is required');
        const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as `${number}${'s'|'m'|'h'|'d'|'w'|'y'}` | number;
        return { secret, signOptions: { expiresIn } };
      },
    }),
    PassportModule,
    ScheduleModule.forRoot(),
    AuthModule,
    ProductsModule,
    OrdersModule,
    AnalyticsModule,
    CategoriesModule,
    PrismaModule,
    GamificationModule,
    ChatModule,
    CamerasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}