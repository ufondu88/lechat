import { Module } from '@nestjs/common';
import { ChatUserService } from './chat-user.service';
import { ChatUserController } from './chat-user.controller';
import { ChatUser } from './entities/chat-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyAuthGuard } from 'src/api-key/api-key.guard';
import { ApiKeyModule } from 'src/api-key/api-key.module';
import { CommunityModule } from 'src/community/community.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatUser]),
    ApiKeyModule,
    CommunityModule
  ],
  controllers: [ChatUserController],
  providers: [ChatUserService, ApiKeyAuthGuard],
  exports: [ChatUserService],
})
export class ChatUserModule {}
