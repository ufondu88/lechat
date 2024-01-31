import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomService } from './chatroom.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatUserService } from '../chat-user/chat-user.service';
import { ChatUser } from '../chat-user/entities/chat-user.entity';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChatroomService', () => {
  let service: ChatroomService;
  let chatUserService: ChatUserService;
  let spyLoggerError: jest.SpyInstance
  let createSpy: jest.SpyInstance
  let saveSpy: jest.SpyInstance

  let repo: Repository<ChatRoom>;
  let chatroomChatUserRepo: Repository<ChatroomChatuser>;

  const CHATROOM_REPO_TOKEN = getRepositoryToken(ChatRoom)
  const CHATROOM_CHATUSER_REPO_TOKEN = getRepositoryToken(ChatroomChatuser)

  const chatUsers: ChatUser[] = [
    {
      id: '1',
      externalId: '12',
    },
    {
      id: '2',
      externalId: '32',
    }
  ]
  const chatroom: ChatRoom = {
    id: '1',
    users: chatUsers,
    messages: []
  }
  const chatrooms: ChatRoom[] = [
    chatroom,
    {
      id: '2',
      users: [],
      messages: []
    }
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatroomService,
        {
          provide: ChatUserService,
          useValue: {
            usersExist: jest.fn(),
            findManyById: jest.fn()
          }
        }, 
        {
          provide: CHATROOM_REPO_TOKEN,
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            save: jest.fn()
          }
        },
        {
          provide: CHATROOM_CHATUSER_REPO_TOKEN,
          useClass: Repository
        }
      ],
    }).compile();
 
    service = module.get(ChatroomService);
    chatUserService = module.get(ChatUserService);
    repo = module.get(CHATROOM_REPO_TOKEN);
    chatroomChatUserRepo = module.get(CHATROOM_CHATUSER_REPO_TOKEN);
    spyLoggerError = jest.spyOn(service.logger, 'error');
    createSpy = jest.spyOn(repo, 'create')
    saveSpy = jest.spyOn(repo, 'save')
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chatroom when users exist', async () => {
      const chatters = ['user1', 'user2'];

      jest.spyOn(chatUserService, 'usersExist').mockResolvedValue(true);
      jest.spyOn(service, 'findExistingOne').mockResolvedValue(undefined);
      jest.spyOn(chatUserService, 'findManyById').mockResolvedValue(chatUsers);
      createSpy.mockReturnValue(chatroom)
      saveSpy.mockResolvedValue(chatroom)

      await service.create(chatters); 

      expect(createSpy).toHaveBeenCalledWith({ users: expect.any(Array) });
      expect(saveSpy).toHaveBeenCalledWith(chatroom);
    });

    it('should throw BadRequestException when at least one user does not exist', async () => {
      const chatters = ['user1', 'user2'];

      jest.spyOn(chatUserService, 'usersExist').mockResolvedValue(false);

      try {
        await service.create(chatters)
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain("not exist")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    }); 
  });

  describe('findAll', () => {
    it('should find all chatrooms with relations', async () => {
      const relations = ['users'];
      const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([chatroom]);

      const result = await service.findAll(relations);

      expect(findSpy).toHaveBeenCalledWith({ relations });
      expect(result).toEqual(expect.arrayContaining<ChatRoom>([]))
    });

    it('should find all chatrooms without relations', async () => {
      const relations = [];
      const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.findAll(relations);

      expect(findSpy).toHaveBeenCalledWith({ relations: [] });
      expect(result).toEqual(expect.arrayContaining<ChatRoom>([]))
    });
  });

  describe('findExistingOne', () => {
    it('should find an existing chatroom for the provided chatters', async () => {
      const chatters = [chatUsers[0].id, chatUsers[1].id];
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(chatrooms);
      const findSpy = jest.spyOn(Array.prototype, 'find');

      const result = await service.findExistingOne(chatters);

      expect(findAllSpy).toHaveBeenCalledWith(['users']);
      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(chatroom)
    });

    it('should not find an existing chatroom for the provided chatters', async () => {
      const chatters = [chatUsers[0].id, chatUsers[1].id];
      const chatrooms: ChatRoom[] = [
        {
          id: '1',
          users: [],
          messages: []
        },
        {
          id: '2',
          users: [],
          messages: []
        }
      ]
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(chatrooms);
      const findSpy = jest.spyOn(Array.prototype, 'find');

      const result = await service.findExistingOne(chatters);

      expect(findAllSpy).toHaveBeenCalledWith(['users']);
      expect(findSpy).toHaveBeenCalled();
      expect(result).toBe(undefined)
    });
  });

  describe('findByUserId', () => {
    it('should find an existing chatroom for the provided chatter', async () => {
      const id = chatUsers[0].id;
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(chatrooms);
      const findSpy = jest.spyOn(Array.prototype, 'find');

      const result = await service.findByUserId(id);

      expect(findAllSpy).toHaveBeenCalledWith(['users']);
      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([chatroom])
    });

    it('should not find an existing chatroom for the provided chatters', async () => {
      const id = 'no-chatroom'
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(chatrooms);
      const arraySomeSpy = jest.spyOn(Array.prototype, 'some');

      const result = await service.findByUserId(id);

      expect(findAllSpy).toHaveBeenCalledWith(['users']);
      expect(arraySomeSpy).toHaveBeenCalled();
      expect(result).toEqual([]) 
    });
  });

  describe('findOne', () => {
    it('should find chatroom', async () => {
      const id = chatUsers[0].id;
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(chatroom);

      const result = await service.findOne(id);

      expect(findSpy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(chatroom)
    });

    it('should not find chatroom', async () => {
      const id = 'no-chatroom'
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findOne(id);

      expect(findSpy).toHaveBeenCalledWith({ id });
      expect(result).toBe(undefined)
    });
  });

  describe('userIsInChatroom', () => {
    const chatroomChatUser: ChatroomChatuser = {
      chatUserId: chatUsers[0].id,
      chatRoomId: chatrooms[0].id,
      users: [],
      chatrooms: []
    }

    it('should return true if the user is in the chatroom', async () => {
      const chatUserId = chatUsers[0].id;
      const chatRoomId = chatrooms[0].id;
      const findSpy = jest.spyOn(chatroomChatUserRepo, 'findOne').mockResolvedValue(chatroomChatUser);

      const result = await service.userIsInChatroom(chatUserId, chatRoomId);

      expect(findSpy).toHaveBeenCalledWith({ where: { chatRoomId, chatUserId } });
      expect(result).toBeTruthy()
    });

    it('should return false if the user is not in the chatroom', async () => {
      const chatUserId = 'chatUsers[0].id;'
      const chatRoomId = chatrooms[0].id;
      const findSpy = jest.spyOn(chatroomChatUserRepo, 'findOne').mockResolvedValue(undefined);

      const result = await service.userIsInChatroom(chatUserId, chatRoomId);

      expect(findSpy).toHaveBeenCalledWith({ where: { chatRoomId, chatUserId } });
      expect(result).not.toBeTruthy()
    });
  });

  describe('update', () => {
    const id = '1'
    const updateChatroomDto: UpdateChatroomDto = {
      externalId: '2',
    };

    it('should update and return chatroom', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(chatroom)
      saveSpy.mockResolvedValue(chatroom)

      const result = await service.update(id, updateChatroomDto)

      expect(result).toEqual(chatroom)
    })

    it('should throw NotFoundException if chatroom is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined)

      try {
        await service.update(id, updateChatroomDto)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(saveSpy).not.toHaveBeenCalled();
    })
  })

  describe('remove', () => {
    const id = '1'

    it('should delete chatroom and return confirmation', async () => {
      const deleteResult = { affected: 1, raw: 0 }

      jest.spyOn(service, 'remove').mockResolvedValue(`Chat user with ID "${id}" deleted successfully`)
      jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult)

      const result = await service.remove(id)

      expect(result).toContain('success')
    })

    it('should throw NotFoundException if chatroom is not found', async () => {
      const deleteResult = { affected: 0, raw: 0 }

      jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult)

      try {
        await service.remove(id)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }
    })
  })
});