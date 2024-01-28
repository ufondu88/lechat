import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';
import { ApiKeyModule } from '../api-key/api-key.module';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';
import { ChatRoom } from './entities/chatroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatroomChatuser]),
    ApiKeyModule,
    ChatUserModule,
  ],
  controllers: [ChatroomController],
  providers: [
    ChatroomService,
    ApiKeyAuthGuard
  ],
  exports: [ChatroomService],
})
export class ChatroomModule { }
