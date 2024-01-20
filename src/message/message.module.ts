import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { ChatUserModule } from 'src/chat-user/chat-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ChatroomModule,
    ChatUserModule
  ],
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
