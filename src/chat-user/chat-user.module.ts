import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';
import { ApiKeyModule } from '../api-key/api-key.module';
import { CommunityModule } from '../community/community.module';
import { ChatUserController } from './chat-user.controller';
import { ChatUserService } from './chat-user.service';
import { ChatUser } from './entities/chat-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatUser]),
    ApiKeyModule,
    CommunityModule
  ],
  controllers: [ChatUserController],
  providers: [ChatUserService],
  exports: [ChatUserService],
})
export class ChatUserModule { }
