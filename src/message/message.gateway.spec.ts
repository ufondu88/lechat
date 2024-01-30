import { Test, TestingModule } from '@nestjs/testing';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatUserService } from '../chat-user/chat-user.service';
import { ChatroomService } from '../chatroom/chatroom.service';
import { CryptoService } from '../crypto/crypto.service';
import { Message } from './entities/message.entity';

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  const MESSAGE_REPO_TOKEN = getRepositoryToken(Message)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageGateway,
        {
          provide: MessageService,
          useValue: {
            create: jest.fn(),
            findAllByChatroom: jest.fn(),
          }
        },
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
        },
      ],
    }).compile();

    gateway = module.get<MessageGateway>(MessageGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
