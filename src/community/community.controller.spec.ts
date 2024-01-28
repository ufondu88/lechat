import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

jest.mock('./community.service');

describe('CommunityController', () => {
  let controller: CommunityController;
  let service: CommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [CommunityService],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
  });

  describe('create', () => {
    it('should create a community', async () => {
      const createCommunityDto: CreateCommunityDto = {
        name: 'Test Community',
        // Add other properties as needed
      };

      jest.spyOn(service, 'create').mockResolvedValue('Community created successfully');

      const result = await controller.create('userId', createCommunityDto);

      expect(result).toEqual('Community created successfully');
      expect(service.create).toHaveBeenCalledWith(createCommunityDto, 'userId');
    });

    it('should handle NotFoundException', async () => {
      const createCommunityDto: CreateCommunityDto = {
        name: 'Test Community',
        // Add other properties as needed
      };

      jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.create('userId', createCommunityDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle ConflictException', async () => {
      const createCommunityDto: CreateCommunityDto = {
        name: 'Test Community',
        // Add other properties as needed
      };

      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException('Community name already exists'));

      await expect(controller.create('userId', createCommunityDto)).rejects.toThrow(ConflictException);
    });
  });

  // Add other test cases for controller methods (findAll, findOne, update, remove) as needed
});
