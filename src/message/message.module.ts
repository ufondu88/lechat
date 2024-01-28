import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { ChatroomModule } from '../chatroom/chatroom.module';
import { CryptoService } from '../crypto/crypto.service';
import { Message } from './entities/message.entity';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ChatroomModule,
    ChatUserModule
  ],
  providers: [MessageGateway, MessageService, CryptoService],
})
export class MessageModule { }
