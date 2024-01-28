import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserController } from './chat-user.controller';
import { ChatUserService } from './chat-user.service';
import { ChatUser } from './entities/chat-user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommunityService } from '../community/community.service';
import { ApiKeyService } from '../api-key/api-key.service';

describe('ChatUserController', () => {
  let controller: ChatUserController;
  const CHATUSER_REPO_TOKEN = getRepositoryToken(ChatUser)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatUserController],
      providers: [
        ChatUserService,
        {
          provide: CHATUSER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          }, 
        },
        {
          provide: CommunityService,
          useValue: {
            findOneByApiKey: jest.fn()
          }
        },
        {
          provide: ApiKeyService,
          useValue: {
            findOneByValue: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<ChatUserController>(ChatUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
