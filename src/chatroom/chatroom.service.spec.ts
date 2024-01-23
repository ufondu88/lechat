import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomService } from './chatroom.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { Repository } from 'typeorm';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';
import { ChatRoom } from './entities/chatroom.entity';
import { BadRequestException } from '@nestjs/common';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('ChatroomService', () => {
  let service: ChatroomService;
  let chatroomRepo: Repository<ChatRoom>;
  let chatroomChatUserRepo: Repository<ChatroomChatuser>;
  let chatUserService: ChatUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatroomService,
        ChatUserService,
        {
          provide: getRepositoryToken(ChatRoom),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ChatroomChatuser),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ChatroomService>(ChatroomService);
    chatroomRepo = module.get<Repository<ChatRoom>>(getRepositoryToken(ChatRoom));
    chatroomChatUserRepo = module.get<Repository<ChatroomChatuser>>(getRepositoryToken(ChatroomChatuser));
    chatUserService = module.get<ChatUserService>(ChatUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chatroom when users exist', async () => {
      const chatters = ['user1', 'user2'];
      jest.spyOn(chatUserService, 'usersExist').mockResolvedValue(true);
      jest.spyOn(service, 'findExistingOne').mockResolvedValue(undefined);
      const createSpy = jest.spyOn(chatroomRepo, 'create');
      const saveSpy = jest.spyOn(chatroomRepo, 'save');

      await service.create(chatters);

      expect(createSpy).toHaveBeenCalledWith({ users: expect.any(Array) });
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw BadRequestException when at least one user does not exist', async () => {
      const chatters = ['user1', 'user2'];
      jest.spyOn(chatUserService, 'usersExist').mockResolvedValue(false);

      await expect(service.create(chatters)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should find all chatrooms with relations', async () => {
      const relations = ['users'];
      const findSpy = jest.spyOn(chatroomRepo, 'find');

      await service.findAll(relations);

      expect(findSpy).toHaveBeenCalledWith({ relations });
    });
  });

  describe('findExistingOne', () => {
    it('should find an existing chatroom for the provided chatters', async () => {
      const chatters = ['user1', 'user2'];
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);
      const findSpy = jest.spyOn(Array.prototype, 'find');

      await service.findExistingOne(chatters);

      expect(findAllSpy).toHaveBeenCalledWith(['users']);
      expect(findSpy).toHaveBeenCalled();
    });
  });
});
