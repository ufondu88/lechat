import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community } from './entities/community.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { UserService } from 'src/user/user.service';
import { BaseController } from 'src/helpers/base.controller';

@Injectable()
export class CommunityService extends BaseController {
  constructor(
    @InjectRepository(Community)
    private communityRepo: Repository<Community>,
    private apiKeyService: ApiKeyService,
    private userService: UserService
  ) { super('CommunityService') }

  /**
   * Creates a new community, associates it with a user, and generates an API key.
   *
   * @param createCommunityDto - DTO containing information for creating a community.
   * @param userId - User ID to associate with the community.
   * @returns A success message after creating the community.
   */
  async create(createCommunityDto: CreateCommunityDto, userId: string): Promise<string> {
    try {
      // get user
      const user = await this.userService.findOneByID(userId);
      if (!user) throw new NotFoundException('User not found');
      
      // check if community exists already
      const existingCommunity = await this.findOneByName(createCommunityDto.name);
      if (existingCommunity) throw new ConflictException('Community name already exists');

      // create and save the community
      const community = this.communityRepo.create(createCommunityDto);
      community.user = user;
      await this.communityRepo.save(community);

      // create the community API key
      await this.apiKeyService.generateAndSaveApiKey(community);

      this.logger.log(`Community ${community.name} created successfully`);
      
      return `Community ${community.name} created successfully`;
    } catch (error) {
      this.logger.error(`Error creating community: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Retrieves all communities with optional relations.
   *
   * @param relations - Array of relation names to include in the result.
   * @returns Array of communities.
   */
  findAll(relations: string[] = []): Promise<Community[]> {
    return this.communityRepo.find({ relations });
  }

  /**
   * Retrieves a community based on the provided ID.
   *
   * @param id - Community ID to find.
   * @returns The found community or undefined if not found.
   */
  findOne(id: string): Promise<Community | undefined> {
    return this.communityRepo.findOneBy({ id });
  }

  /**
   * Retrieves a community based on the provided name.
   *
   * @param name - Community name to find.
   * @returns The found community or undefined if not found.
   */
  findOneByName(name: string): Promise<Community | undefined> {
    return this.communityRepo.findOneBy({ name });
  }

  /**
   * Retrieves a community based on the provided API key.
   *
   * @param key - API key to find the associated community.
   * @returns The found community or throws a NotFoundException if not found.
   */
  async findOneByApiKey(key: string): Promise<Community> {
    const communities = await this.findAll(['apiKey']);
    if (!communities || communities.length === 0) 
      throw new NotFoundException('Community not found for the given API key');
    
    const community = communities.find((c) => c.apiKey.key === key);
    if (!community) 
      throw new NotFoundException('Community not found for the given API key');
  
    return community;
  }

  /**
   * Updates an existing community based on the provided ID and DTO.
   *
   * @param id - Community ID to update.
   * @param updateCommunityDto - DTO containing information to update the community.
   * @returns The updated community or throws a NotFoundException if the community is not found.
   */
  async update(id: string, updateCommunityDto: UpdateCommunityDto) {
    try {
      const community = await this.findOne(id);
      if (!community) 
        throw new NotFoundException(`Community with ID "${id}" not found`);
      
      community.name = updateCommunityDto.name;
      await this.communityRepo.save(community);

      this.logger.log(`Community with ID "${id}" updated successfully`);
      
      return community;
    } catch (error) {
      this.logger.error(`Error updating community: ${error.message}`);
      
      throw error;
    }
  }

  /**
   * Removes a community based on the provided ID.
   *
   * @param id - Community ID to remove.
   * @returns Promise<string> or throws a NotFoundException if the community is not found.
   */
  async remove(id: string) {
    try {
      const result = await this.communityRepo.delete(id);
      if (result.affected === 0) 
        throw new NotFoundException(`Community with ID "${id}" not found`);
      
      this.logger.log(`Community with ID "${id}" deleted successfully`);
      
      return `Community with ID "${id}" deleted successfully`;
    } catch (error) {
      this.logger.error(`Error removing community: ${error.message}`);
      
      throw error;
    }
  }
}
