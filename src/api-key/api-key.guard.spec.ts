import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ApiKeyAuthGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';
import { CommunityService } from '../community/community.service';
import { ApiKey } from './entities/api-key.entity';
import { Community } from 'community/entities/community.entity';

describe('ApiKeyAuthGuard', () => {
  let guard: ApiKeyAuthGuard;
  let apiKeyService: ApiKeyService;
  let communityService: CommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyAuthGuard,
        {
          provide: ApiKeyService,
          useValue: {
            findOneByValue: jest.fn(),
          },
        },
        {
          provide: CommunityService,
          useValue: {
            findOneByApiKey: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(ApiKeyAuthGuard);
    apiKeyService = module.get(ApiKeyService);
    communityService = module.get(CommunityService);
  });

  it('should allow access with a valid and up-to-date API key', async () => {
    const mockApiKey = 'valid-api-key';
    const mockKey: ApiKey = { id: '1', key: mockApiKey, upToDate: true };
    const mockCommunity: Community = {
      id: '1',
      name: 'Test Community',
      chatUsers: [],
      apiKey: mockKey
    }

    jest.spyOn(apiKeyService, 'findOneByValue').mockResolvedValue(mockKey);
    jest.spyOn(communityService, 'findOneByApiKey').mockResolvedValue(mockCommunity);

    const mockExecutionContext = createMockExecutionContext({ headers: { 'x-api-key': mockApiKey } });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBeTruthy();
    expect(mockExecutionContext.switchToHttp().getRequest()['community']).toEqual(mockCommunity);
  });

  it('should throw UnauthorizedException when no API key is present', async () => {
    const mockExecutionContext = createMockExecutionContext({ headers: {} });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException with invalid API key', async () => {
    const mockApiKey = 'invalid-api-key';
    const mockExecutionContext = createMockExecutionContext({ headers: { 'x-api-key': mockApiKey } });
    
    jest.spyOn(apiKeyService, 'findOneByValue').mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when API key is not up to date', async () => {
    const mockApiKey = 'outdated-api-key';
    const mockKey: ApiKey = { id: '1', key: mockApiKey, upToDate: false };
    const mockExecutionContext = createMockExecutionContext({ headers: { 'x-api-key': mockApiKey } });

    jest.spyOn(apiKeyService, 'findOneByValue').mockResolvedValue(mockKey);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw NotFoundException when API key does not belong to a community', async () => {
    const mockApiKey = 'valid-api-key';
    const mockKey: ApiKey = { id: '1', key: mockApiKey, upToDate: true };
    const mockExecutionContext = createMockExecutionContext({ headers: { 'x-api-key': mockApiKey } });

    jest.spyOn(apiKeyService, 'findOneByValue').mockResolvedValue(mockKey);
    jest.spyOn(communityService, 'findOneByApiKey').mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(NotFoundException);
  });

  // Helper function to create a mock ExecutionContext
  function createMockExecutionContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }
});
