import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community } from './entities/community.entity';

describe('CommunityController', () => {
  let controller: CommunityController;
  let service: CommunityService;

  const createCommunityDto: CreateCommunityDto = {
    name: 'Test Community'
  };

  const updateCommunityDto: UpdateCommunityDto = {
    name: 'Updated Name',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneByApiKey: jest.fn(),
            findOneByEmail: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const userId = '1'

    it('should create a community', async () => {
      jest.spyOn(service, 'create').mockResolvedValue('success');

      const result = await controller.create(userId, createCommunityDto);

      expect(service.create).toHaveBeenCalledWith(createCommunityDto, userId);
      expect(result).toContain('success');
    });
  });

  describe('findAll', () => {
    it('should retrieve all communities', async () => {
      const communities = [
        { id: '1', name: 'Community 1'},
        { id: '2', name: 'Community 2'},
      ] as Community[];

      jest.spyOn(service, 'findAll').mockResolvedValue(communities);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(communities);
    });
  });

  describe('findOneByApiKey', () => {
    it('should retrieve a community by ID', async () => {
      const communityId = '1';
      const community = { id: communityId, name: 'John Doe'} as Community;

      jest.spyOn(service, 'findOneByApiKey').mockResolvedValue(community);

      const result = await controller.findOneByApiKey(communityId);

      expect(service.findOneByApiKey).toHaveBeenCalledWith(communityId);
      expect(result).toEqual(community);
    });
  });

  describe('update', () => {
    it('should update a community by ID', async () => {
      const id = '1';
      const community = { id } as Community;

      jest.spyOn(service, 'update').mockResolvedValue(community);

      const result = await controller.update(id, updateCommunityDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCommunityDto);
      expect(result).toEqual(community);
    });
  });

  describe('remove', () => {
    it('should remove a community by ID', async () => {
      const id = '1';

      jest.spyOn(service, 'remove').mockResolvedValue('success');

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toContain('success');
    });
  });
});
