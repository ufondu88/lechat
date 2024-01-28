import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatUserService } from '../chat-user/chat-user.service';
import { ChatroomService } from '../chatroom/chatroom.service';
import { CryptoService } from '../crypto/crypto.service';

describe('MessageService', () => {
  let service: MessageService;

  const MESSAGE_REPO_TOKEN = getRepositoryToken(Message)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MESSAGE_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ChatUserService,
          useValue: {
            findOneByID: jest.fn(),
          }
        },
        {
          provide: ChatroomService,
          useValue: {
            findOneByID: jest.fn(),
          }
        },
        {
          provide: CryptoService,
          useValue: {
            findOneByID: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
