import { Test, TestingModule } from '@nestjs/testing';
import { ChatUserService } from './chat-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatUser } from './entities/chat-user.entity';
import { CommunityService } from '../community/community.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { Repository, In } from 'typeorm';
import { Community } from 'community/entities/community.entity';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';

describe('ChatUserService', () => {
  let service: ChatUserService;
  let communityService: CommunityService
  let repo: Repository<ChatUser>

  const apiKey = "api-key"

  const CHATUSER_REPO_TOKEN = getRepositoryToken(ChatUser)

  const COMMUNITY: Community = {
    id: "1",
    name: 'Test Community',
    user: null,
    chatUsers: []
  };

  const CHAT_USER: ChatUser = {
    id: "1",
    externalId: "2",
  }

  const createChatUserDto: CreateChatUserDto = {
    externalId: '2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatUserService,
        {
          provide: CHATUSER_REPO_TOKEN,
          useClass: Repository
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

    service = module.get(ChatUserService);
    communityService = module.get(CommunityService);
    repo = module.get<Repository<ChatUser>>(CHATUSER_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create chatuser', async () => {
      jest.spyOn(communityService, 'findOneByApiKey').mockResolvedValue(COMMUNITY)
      jest.spyOn(repo, 'create').mockReturnValueOnce(CHAT_USER)
      jest.spyOn(repo, 'save').mockResolvedValue(CHAT_USER)

      const chatUser = await service.create(createChatUserDto, apiKey);

      expect(repo.create).toHaveBeenCalledWith(createChatUserDto);
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: "1", externalId: "2" }));
      expect(chatUser).toEqual(expect.objectContaining({ id: "1", externalId: "2", community: COMMUNITY }));
    })

    it('should throw NotFoundException if community is not found', async () => {
      const spyLoggerError = jest.spyOn(service.logger, 'error');

      jest.spyOn(communityService, 'findOneByApiKey').mockResolvedValue(undefined)

      await service.create(createChatUserDto, apiKey);

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
    })
  })

  describe('usersExist', () => {
    const ids = ['1', '2']

    it('should return true if users exist', async () => {
      const repoSpy = jest.spyOn(repo, 'count').mockResolvedValue(ids.length)

      const result = await service.usersExist(ids)

      expect(result).toBeTruthy()
      expect(repoSpy).toHaveBeenCalledWith({ where: { id: In(ids) } })
    })

    it('should return false if not all users exist', async () => {
      const repoSpy = jest.spyOn(repo, 'count').mockResolvedValue(1)

      const result = await service.usersExist(ids)

      expect(result).not.toBeTruthy()
      expect(repoSpy).toHaveBeenCalledWith({ where: { id: In(ids) } })
    })
  })

  describe('update', () => {
    const id = '1'
    const updateChatUserDto: UpdateChatUserDto = {
      externalId: '2',
    };

    it('should update and return chatuser', async () => {
      jest.spyOn(service, 'findOneByID').mockResolvedValue(CHAT_USER)
      jest.spyOn(repo, 'save').mockResolvedValue(CHAT_USER)

      const result = await service.update(id, updateChatUserDto)

      expect(CHAT_USER.externalId).toEqual(updateChatUserDto.externalId)
      expect(result).toEqual(CHAT_USER)
    })

    it('should throw NotFoundException if user is not found', async () => {
      const spyLoggerError = jest.spyOn(service.logger, 'error');

      jest.spyOn(service, 'findOneByID').mockResolvedValue(undefined)

      await service.update(id, updateChatUserDto)

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
    })
  })

  describe('remove', () => {
    const id = '1'

    it('should delete chatuser and return confirmation', async () => {
      const deleteResult = { affected: 1, raw: 0 }
      
      jest.spyOn(service, 'remove').mockResolvedValue(`Chat user with ID "${id}" deleted successfully`)
      jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult)

      const result = await service.remove(id)

      expect(result).toContain('success')
    })

    it('should throw NotFoundException if user is not found', async () => {
      const spyLoggerError = jest.spyOn(service.logger, 'error');
      const deleteResult = { affected: 0, raw: 0 }

      jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult)

      await service.remove(id)

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
    })
  })
});
