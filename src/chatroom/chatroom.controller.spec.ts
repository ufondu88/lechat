import { Test, TestingModule } from '@nestjs/testing';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';
import { ApiKeyService } from '../api-key/api-key.service';
import { CommunityService } from '../community/community.service';

describe('ChatroomController', () => {
  let controller: ChatroomController;
  let service: ChatroomService;

  const updateChatRoomDto: UpdateChatroomDto = {
    name: 'Updated Name',
  };

  const chatroom: ChatRoom = {
    id: '1',
    users: [],
    messages: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomController],
      providers: [
        {
          provide: ChatroomService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUserId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ApiKeyAuthGuard,
          useValue: {
            decode: jest.fn()
          }
        },
        {
          provide: ApiKeyService,
          useValue: {
            findOneByValue: jest.fn()
          }
        },
        {
          provide: CommunityService,
          useValue: {
            findOneByApiKey: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get(ChatroomController);
    service = module.get(ChatroomService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const chatters = ['1', '2']
    const req = {
      community: {
        name: 'community name'
      }
    }

    it('should create a chatroom', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(chatroom);

      const result = await controller.create(chatters, req as any);

      expect(service.create).toHaveBeenCalledWith(chatters);
      expect(result).toEqual(chatroom);
    });
  });

  describe('findAll', () => {
    it('should retrieve all communities', async () => {
      const userId = '1'
      const chatrooms = [
        chatroom,
        { id: '2' },
      ] as ChatRoom[];

      jest.spyOn(service, 'findByUserId').mockResolvedValue(chatrooms);

      await controller.findAll(userId);

      expect(service.findByUserId).toHaveBeenCalledWith(userId);
    }); 
  });

  describe('findOne', () => {
    it('should retrieve a chatroom by ID', async () => {
      const chatroomId = '1';
      const chatroom = { id: chatroomId } as ChatRoom;

      jest.spyOn(service, 'findOne').mockResolvedValue(chatroom);

      await controller.findOne(chatroomId);

      expect(service.findOne).toHaveBeenCalledWith(chatroomId);
    });
  });

  describe('update', () => {
    it('should update a chatroom by ID', async () => {
      const id = '1';
      const chatroom = { id } as ChatRoom;

      jest.spyOn(service, 'update').mockResolvedValue(chatroom);

      const result = await controller.update(id, updateChatRoomDto);

      expect(service.update).toHaveBeenCalledWith(id, updateChatRoomDto);
      expect(result).toEqual(chatroom);
    });
  });

  describe('remove', () => {
    it('should remove a chatroom by ID', async () => {
      const id = '1';

      jest.spyOn(service, 'remove').mockResolvedValue('success');

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toContain('success');
    });
  });
});
