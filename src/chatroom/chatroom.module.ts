import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { ChatRoom } from './entities/chatroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { ApiKeyAuthGuard } from 'src/api-key/api-key.guard';
import { ChatUserModule } from 'src/chat-user/chat-user.module';
import { CommunityModule } from 'src/community/community.module';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatroomChatuser]),
    PassportModule.register({ defaultStrategy: 'apiKey' }),
    ApiKeyModule,
    ChatUserModule,
    CommunityModule
  ],
  controllers: [ChatroomController],
  providers: [
    ChatroomService,
    ApiKeyAuthGuard
  ],
  exports: [ChatroomService],
})
export class ChatroomModule {}
