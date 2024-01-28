import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';
import { ApiKeyService } from '../api-key/api-key.service';
import { ChatUserService } from '../chat-user/chat-user.service';
import { CommunityService } from '../community/community.service';

describe('ChatroomController', () => {
  let controller: ChatroomController;
  const CHATROOM_REPO_TOKEN = getRepositoryToken(ChatRoom)
  const CHATROOM_CHATUSER_REPO_TOKEN = getRepositoryToken(ChatroomChatuser)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomController],
      providers: [
        ChatroomService,
        {
          provide: CHATROOM_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CHATROOM_CHATUSER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ApiKeyService,
          useValue: {
            findOneByID: jest.fn(),
          }
        },
        {
          provide: ChatUserService,
          useValue: {
            findOneByID: jest.fn(),
          }
        },
        {
          provide: CommunityService,
          useValue: {
            findOneByID: jest.fn(),
          }
        }
      ],
    }).compile();

    controller = module.get<ChatroomController>(ChatroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
