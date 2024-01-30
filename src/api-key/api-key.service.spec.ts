import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Community } from 'community/entities/community.entity';
import { Repository } from 'typeorm';
import { ApiKeyService } from './api-key.service';
import { ApiKey } from './entities/api-key.entity';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repo: Repository<ApiKey>
  let spyLoggerError: jest.SpyInstance

  const APIKEY_REPO_TOKEN = getRepositoryToken(ApiKey)

  const COMMUNITY: Community = {
    id: "1",
    name: 'Test Community',
    user: null,
    chatUsers: []
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: APIKEY_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ]
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repo = module.get<Repository<ApiKey>>(APIKEY_REPO_TOKEN);
    spyLoggerError = jest.spyOn(service.logger, 'error');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createKey', () => {
    it('should generate and save a unique API key for a community', async () => {
      const uuidMock = 'uuid-mock';
      const key = { key: uuidMock, community: COMMUNITY } as ApiKey;

      jest.spyOn(service, 'generateApiKey').mockResolvedValue(uuidMock);
      jest.spyOn(repo, 'create').mockReturnValueOnce(key);
      jest.spyOn(repo, 'save').mockResolvedValue(key);

      const apiKey = await service.createKey(COMMUNITY);

      expect(repo.create).toHaveBeenCalledWith({ key: uuidMock });
      expect(apiKey.community).toEqual(COMMUNITY)
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ key: uuidMock, community: COMMUNITY }));
      expect(apiKey).toEqual(expect.objectContaining({ key: uuidMock, community: COMMUNITY }));
    });

    it('should log an error if there is an issue during key generation and saving', async () => {
      const errorMock = new Error('Key generation failed');
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(service, 'apiKey').mockImplementation(() => {
        throw errorMock;
      });

      await expect(service.createKey(COMMUNITY)).resolves.toBeFalsy();

      expect(spyLoggerError).toHaveBeenCalledWith(`Error creating API key: ${errorMock.message}`);
    });
  });

  describe('findOneByValue', () => {
    it('should find an API key by its value', async () => {
      const apiKeyValue = 'test-api-key';
      const apiKey = { key: apiKeyValue, community: COMMUNITY } as ApiKey;

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(apiKey);

      const result = await service.findOneByValue(apiKeyValue);

      expect(repo.findOneBy).toHaveBeenCalledWith({ key: apiKeyValue });
      expect(result).toEqual(apiKey);
    });
  });

  describe('generateApiKey', () => {
    it('should generate unique API key', async () => {
      const apiKeyValue = 'test-api-key';
      const apiKey = { key: apiKeyValue, community: COMMUNITY } as ApiKey;

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(apiKey);

      const result = await service.findOneByValue(apiKeyValue);

      expect(repo.findOneBy).toHaveBeenCalledWith({ key: apiKeyValue });
      expect(result).toEqual(apiKey);
    });

    it('should retry if generated key already exists in the database', async () => {
      // Mock first call to findOne to return an existing key
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce({ id: '1', key: 'existing-key', upToDate: true });

      // Mock second call to findOne to return null, simulating no existing key
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);

      // Mock uuidv4 to return different values on each call
      const uuidMocks = ['existing-key', 'unique-key'];

      jest.spyOn(service, 'apiKey').mockImplementationOnce(() => uuidMocks[0]).mockImplementationOnce(() => uuidMocks[1]);

      const apiKey = await service.generateApiKey();

      expect(service.apiKey).toHaveBeenCalledTimes(2);
      expect(apiKey).toEqual(uuidMocks[1]);
    });
  });
});
