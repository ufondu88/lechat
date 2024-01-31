import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from 'api-key/entities/api-key.entity';
import 'reflect-metadata'; // Add this line
import { Repository } from 'typeorm';
import { ApiKeyService } from '../api-key/api-key.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community } from './entities/community.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CommunityService', () => {
  let service: CommunityService;
  let apiKeyService: ApiKeyService
  let userService: UserService
  let repo: Repository<Community>

  let spyLoggerError: jest.SpyInstance
  let createSpy: jest.SpyInstance
  let saveSpy: jest.SpyInstance

  const COMMUNITY_REPO_TOKEN = getRepositoryToken(Community)
  const user: User = {
    id: "1",
    name: 'name',
    email: 'email',
    telephone: 'tel',
    isAdmin: false,
    communities: [],
    formatTelephone() { },
    updateValues() { },
  }
  const key = 'apikey';
  const apiKey: ApiKey = {
    id: '1',
    upToDate: true,
    key
  };
  const community: Community = {
    id: '1',
    name: 'Test Community',
    user,
    chatUsers: [],
    apiKey
  }
  const communities: Community[] = [
    community,
    {
      id: '2',
      name: 'Test Community 2',
      user,
      chatUsers: [],
      apiKey: { id: '2', upToDate: true, key: 'another key' }
    }
  ]

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
            createKey: jest.fn(),
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

    service = module.get(CommunityService);
    repo = module.get(COMMUNITY_REPO_TOKEN);
    apiKeyService = module.get(ApiKeyService)
    userService = module.get(UserService)

    spyLoggerError = jest.spyOn(service.logger, 'error');
    createSpy = jest.spyOn(repo, 'create')
    saveSpy = jest.spyOn(repo, 'save')

  });

  describe('create', () => {
    const createCommunityDto: CreateCommunityDto = {
      name: 'Test Community',
    };

    it('should create a community', async () => {
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(user);
      jest.spyOn(service, 'findOneByName').mockResolvedValue(undefined);
      jest.spyOn(apiKeyService, 'createKey').mockResolvedValue(undefined);
      jest.spyOn(repo, 'create').mockReturnValueOnce(community)
      jest.spyOn(repo, 'save').mockResolvedValue(community)

      const result = await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');

      expect(community.user).toEqual(user)
      expect(apiKeyService.createKey).toHaveBeenCalled()
      expect(result).toEqual(expect.stringContaining("success"));
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledTimes(1);

    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(undefined);

      try {
        await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(jest.spyOn(service, 'findOneByName')).not.toHaveBeenCalled()
      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
      expect(jest.spyOn(apiKeyService, 'createKey')).not.toHaveBeenCalled()
    });

    it('should throw ConflictException if community name already exists', async () => {
      jest.spyOn(userService, 'findOneByID').mockResolvedValue(user);
      jest.spyOn(service, 'findOneByName').mockResolvedValue(community);

      try {
        await service.create(createCommunityDto, 'b07f6d9c-5019-416b-b9ba-6156223e029f');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toContain("already exists")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(jest.spyOn(userService, 'findOneByID')).toHaveBeenCalled()
      expect(createSpy).not.toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
      expect(jest.spyOn(apiKeyService, 'createKey')).not.toHaveBeenCalled()
    });
  });

  describe('findAll', () => {
    it('should find all communitys with relations', async () => {
      const relations = ['apiKey'];
      const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([community]);

      const result = await service.findAll(relations);

      expect(findSpy).toHaveBeenCalledWith({ relations });
      expect(result).toEqual(expect.arrayContaining<Community>([]))
    });

    it('should find all communitys without relations', async () => {
      const relations = [];
      const findSpy = jest.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.findAll(relations);

      expect(findSpy).toHaveBeenCalledWith({ relations: [] });
      expect(result).toEqual(expect.arrayContaining<Community>([]))
    });
  });

  describe('findOne', () => {
    it('should find community by ID', async () => {
      const id = community.id;
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(community);

      const result = await service.findOne(id);

      expect(findSpy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(community)
    });

    it('should not find community by ID', async () => {
      const id = 'no-community'
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findOne(id);

      expect(findSpy).toHaveBeenCalledWith({ id });
      expect(result).toBe(undefined)
    });
  });

  describe('findOneByName', () => {
    it('should find community by name', async () => {
      const name = community.name;
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(community);

      const result = await service.findOneByName(name);

      expect(findSpy).toHaveBeenCalledWith({ name });
      expect(result).toEqual(community)
    });

    it('should not find community by name', async () => {
      const name = 'no-community'
      const findSpy = jest.spyOn(repo, 'findOneBy').mockResolvedValue(undefined);

      const result = await service.findOneByName(name);

      expect(findSpy).toHaveBeenCalledWith({ name });
      expect(result).toBe(undefined)
    });
  });

  describe('findOneByApiKey', () => {
    it('should find community by API key', async () => {
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(communities)
      const findSpy = jest.spyOn(Array.prototype, 'find')

      const result = await service.findOneByApiKey(key);

      expect(findAllSpy).toHaveBeenCalledWith(['apiKey'])
      expect(findSpy).toHaveBeenCalled()
      expect(result).toEqual(community)
    });

    it('should throw NotFoundException if there are no communities', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(undefined)
 
      try {
        await service.findOneByApiKey(key)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(jest.spyOn(service, 'findAll')).toHaveBeenCalledWith(['apiKey'])
      // expect(jest.spyOn(Array.prototype, 'find')).not.toHaveBeenCalled();
    })

    it('should throw NotFoundException if length of community is 0', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([])

      try {
        await service.findOneByApiKey(key)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(jest.spyOn(service, 'findAll')).toHaveBeenCalledWith(['apiKey'])
      // expect(jest.spyOn(Array.prototype, 'find')).not.toHaveBeenCalled();
    })

    it('should throw NotFoundException if community is not found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(communities)

      const findSpy = jest.spyOn(Array.prototype, 'find').mockReturnValue(undefined)

      try {
        await service.findOneByApiKey(key)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(jest.spyOn(service, 'findAll')).toHaveBeenCalledWith(['apiKey'])
      expect(findSpy).toHaveBeenCalled()
    })
  });

  describe('update', () => {
    const id = '1'
    const updateCommunityDto: UpdateCommunityDto = {
      name: 'community name',
    };

    it('should update and return community', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(community)
      jest.spyOn(repo, 'save').mockResolvedValue(community)

      const result = await service.update(id, updateCommunityDto)

      expect(result).toEqual(community)
    })

    it('should throw NotFoundException if community is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined)

      try {
        await service.update(id, updateCommunityDto)
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

    it('should delete community and return confirmation', async () => {
      const deleteResult = { affected: 1, raw: 0 }

      jest.spyOn(service, 'remove').mockResolvedValue(`Community with ID "${id}" deleted successfully`)
      jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult)

      const result = await service.remove(id)

      expect(result).toContain('success')
    })

    it('should throw NotFoundException if community is not found', async () => {
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
