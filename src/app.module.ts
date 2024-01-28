import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { CommunityModule } from './community/community.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { ChatUserModule } from './chat-user/chat-user.module';
import { MessageModule } from './message/message.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SUPABASE_JWT_SECRET,
      signOptions: {
        expiresIn: 21600,
      },
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    CommunityModule,
    ApiKeyModule,
    ChatUserModule,
    MessageModule,
    ChatroomModule,
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService, CryptoService],
})
export class AppModule {}
