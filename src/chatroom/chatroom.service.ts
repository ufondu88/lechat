import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { Repository } from 'typeorm';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ChatRoom } from './entities/chatroom.entity';
import { BaseController } from 'src/helpers/base.controller';

@Injectable()
export class ChatroomService extends BaseController {
  constructor(
    @InjectRepository(ChatRoom)
    private chatroomRepo: Repository<ChatRoom>,
    private chatUserService: ChatUserService
  ) {
    super('ChatroomService')
  }

  async create(chatters: string[]) {
    this.logger.log(`Checking if users: ${chatters} exist`)

    const usersExist = await this.chatUserService.usersExist(chatters)

    if (!usersExist) {
      throw new BadRequestException('At least one of the users does not exist')
    }
    
    this.logger.log(`Retrieving chatroom between ${chatters}`)

    let chatroom = await this.findExistingOne(chatters)
    
    if (chatroom) {
      return chatroom
    }
    
    this.logger.log(`Creating chatroom for ${chatters}`)

    const users = await this.chatUserService.findManyById(chatters)
    chatroom = this.chatroomRepo.create({ users })
    
    return await this.chatroomRepo.save(chatroom)
  }

  async findExistingOne(chatters: string[]): Promise<ChatRoom> {
    const queryBuilder = this.chatroomRepo.createQueryBuilder('chatroom');

    queryBuilder.innerJoin('chatroom.users', 'user');
    queryBuilder.where('user.id IN (:...chatters)', { chatters });
    queryBuilder.groupBy('chatroom.id');
    queryBuilder.having(`COUNT(user.id) = :userCount`, { userCount: chatters.length });

    const chatroom = await queryBuilder.getOne();    

    return chatroom
  }

  findAll(id: string): Promise<ChatRoom[]> {
    return this.chatroomRepo
      .createQueryBuilder('chatroom')
      .innerJoin('chatroom.users', 'user')
      .where('user.id = :id', { id })
      .getMany();
  }

  findOne(id: string): Promise<ChatRoom> {
    return this.chatroomRepo.findOneBy({ id })
  }

  async userIsInChatroom(userID: string, chatroomID: string) {
    const chatroom = await this.findOne(chatroomID)
    const user = await this.chatUserService.findOneByID(userID)

    return chatroom.users.includes(user)
  }

  update(id: number, updateChatroomDto: UpdateChatroomDto) {
    return `This action updates a #${id} chatroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatroom`;
  }
}


