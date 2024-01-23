import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';
import { ChatUser } from './entities/chat-user.entity';
import { CommunityService } from 'src/community/community.service';
import { BaseController } from 'src/helpers/base.controller';

@Injectable()
export class ChatUserService extends BaseController {
  constructor(
    @InjectRepository(ChatUser)
    private chatUserRepo: Repository<ChatUser>,
    private communityService: CommunityService
  ) { super('ChatUserService') }

  async create(createChatUserDto: CreateChatUserDto, apiKey: string) {
    const community = await this.communityService.findOneByApiKey(apiKey)

    if (!community) {
      throw new NotFoundException('Community not found')
    }

    this.logger.log('Creating chat user')

    const chatUser = this.chatUserRepo.create(createChatUserDto)
    chatUser.community = community

    this.logger.log(chatUser)

    return this.chatUserRepo.save(chatUser)
  }

  async usersExist(ids: string[]) {
    this.logger.log(`Checking if users: ${ids} exist`)

    const numFound = await this.chatUserRepo.count({
      where: {
        id: In(ids)
      }
    })

    return numFound === ids.length;
  }

  findAll() {
    this.logger.log(`Getting all chat users`)

    return `This action returns all chatUser`;
  }

  findOneByID(id: string) {
    this.logger.log(`Getting chat user: ${id}`)

    return this.chatUserRepo.findOneBy({ id })
  }

  findManyById(ids: string[]) {
    this.logger.log(`Getting chat users: ${ids}`)

    const where = ids.map(id => ({ id }));

    return this.chatUserRepo.find({ where })
  }

  update(id: number, updateChatUserDto: UpdateChatUserDto) {
    return `This action updates a #${id} chatUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatUser`;
  }
}
