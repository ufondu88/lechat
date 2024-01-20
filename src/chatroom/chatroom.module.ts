import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { ChatRoom } from './entities/chatroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { ApiKeyAuthGuard } from 'src/api-key/api-key.guard';
import { ChatUserModule } from 'src/chat-user/chat-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom]),
    PassportModule.register({ defaultStrategy: 'apiKey' }),
    ApiKeyModule,
    ChatUserModule
  ],
  controllers: [ChatroomController],
  providers: [
    ChatroomService,
    ApiKeyAuthGuard
  ],
  exports: [ChatroomService],
})
export class ChatroomModule {}
