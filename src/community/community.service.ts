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
  ) { super('CommunityService')}

  async create(createCommunityDto: CreateCommunityDto, userId: string) {
    // get user
    const user = await this.userService.findOneByID(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // check if community exists already
    const existingCommunity = await this.findOneByName(createCommunityDto.name)

    if (existingCommunity) {
      throw new ConflictException('Community name already exists')
    }

    // create and save the community
    const community = this.communityRepo.create(createCommunityDto)

    community.user = user

    await this.communityRepo.save(community)

    // create the community API key
    await this.apiKeyService.generateAndSaveApiKey(community)

    return `Community ${community.name} created successfully`
  }

  findAll() {
    return this.communityRepo.find()
  }

  findOne(id: string) {
    return this.communityRepo.findOneBy({ id })   
  }

  findOneByName(name: string) {
    return this.communityRepo.findOneBy({ name })   
  }

  async findOneByApiKey(apiKey: string): Promise<Community> {
    const community = await this.communityRepo
      .createQueryBuilder('community')
      .innerJoin('community.apiKey', 'apiKey')
      .where('apiKey.key = :apiKey', { apiKey })
      .getOne();

    if (!community) {
      throw new NotFoundException('Community not found for the given API key');
    }

    return community;
  }

  update(id: number, updateCommunityDto: UpdateCommunityDto) {
    return `This action updates a #${id} community`;
  }

  remove(id: number) {
    return `This action removes a #${id} community`;
  }
}
