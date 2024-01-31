import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdaterService } from '../helpers/classes/updater.service';
import { Repository } from 'typeorm';
import { ApiKeyService } from '../api-key/api-key.service';
import { UserService } from '../user/user.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community } from './entities/community.entity';

@Injectable()
export class CommunityService extends UpdaterService<Community, UpdateCommunityDto> {
  constructor(
    @InjectRepository(Community)
    private communityRepo: Repository<Community>,
    private apiKeyService: ApiKeyService,
    private userService: UserService
  ) { super('CommunityService', 'community', communityRepo) }

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
      const user = await this.userService.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('User not found');

      // check if community exists already
      const existingCommunity = await this.findOneBy({ name: createCommunityDto.name });
      if (existingCommunity) throw new ConflictException('Community name already exists');

      // create and save the community
      const community = this.communityRepo.create(createCommunityDto);
      community.user = user;
      await this.communityRepo.save(community);

      // create the community API key
      await this.apiKeyService.createKey(community);

      this.logger.log(`Community ${community.name} created successfully`);

      return `Community ${community.name} created successfully`;
    } catch (error) {
      this.logger.error(`Error creating community: ${error.message}`);

      throw error
    }
  }

  /**
   * Retrieves a community based on the provided API key.
   *
   * @param key - API key to find the associated community.
   * @returns The found community or throws a NotFoundException if not found.
   */
  async findOneByApiKey(key: string): Promise<Community> {
    try {
      const communities = await this.findAll(['apiKey']);
      if (!communities || communities.length === 0)
        throw new NotFoundException('Community not found for the given API key');

      const community = communities.find((c) => c.apiKey.key === key);
      if (!community)
        throw new NotFoundException('Community not found for the given API key');

      return community;
    } catch (error) {
      this.logger.error(`Error finding community by API key: ${error.message}`)

      throw error
    }
  }
}
