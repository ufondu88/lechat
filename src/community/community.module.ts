import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyModule } from '../api-key/api-key.module';
import { UserModule } from '../user/user.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Community } from './entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community]),
    ApiKeyModule,
    UserModule
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule { }
