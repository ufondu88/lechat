import 'reflect-metadata'; // Add this line
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ApiKeyService } from '../api-key/api-key.service';
import { UserService } from '../user/user.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let apiKeyService: ApiKeyService
  let userService: UserService
  let repo: Repository<Community>

  const COMMUNITY_REPO_TOKEN = getRepositoryToken(Community)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: COMMUNITY_REPO_TOKEN,
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
            generateAndSaveApiKey: jest.fn(),
          }
        },
        {
          provide: UserService,
          useValue: {
            findOneByID: jest.fn(),
          }
        }
      ]
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    repo = module.get<Repository<Community>>(COMMUNITY_REPO_TOKEN);
    apiKeyService = module.get<ApiKeyService>(ApiKeyService)
    userService = module.get<UserService>(UserService)
  });

  describe('create', () => {
    const createCommunityDto: CreateCommunityDto = {
      name: 'Test Community',
    };

    const user: User = {
      id: "1",
      name: 'name',
      email: 'email',
      telephone: 'tel',
      isAdmin: false,
      communities: [],
      created_at: new Date(),
      updated_at: new Date(),
      formatTelephone() { },
      updateValues() { },
    }

    const community: Community = {
      id: '1',
      name: 'Test Community',
      user,
      chatUsers: [],
      created_at: new Date(),
      updated_at: new Date(),
    }

    it('should create a community', async () => {
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(user);
      jest.spyOn(service, 'findOneByName').mockResolvedValue(undefined);
      jest.spyOn(apiKeyService, 'generateAndSaveApiKey').mockResolvedValue(undefined);
      jest.spyOn(repo, 'create').mockReturnValueOnce(community)
      jest.spyOn(repo, 'save').mockResolvedValue(community)

      const result = await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');
      
      expect(apiKeyService.generateAndSaveApiKey).toHaveBeenCalled()
      expect(result).toEqual(expect.stringContaining("success"));
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledTimes(1);

    });

    it('should throw NotFoundException if user not found', async () => {
      const spyLoggerError = jest.spyOn(service.logger, 'error');
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(undefined);

      await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
    });

    it('should throw ConflictException if community name already exists', async () => {
      const spyLoggerError = jest.spyOn(service.logger, 'error');
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(user);
      jest.spyOn(service, 'findOneByName').mockResolvedValue(community);

      await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');

      expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
    });
  });

  // Add other test cases for service methods (findAll, findOne, update, remove, etc.) as needed
});
