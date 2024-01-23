import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { BaseController } from 'src/helpers/base.controller';
import { Repository } from 'typeorm';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatroomChatuser } from './entities/chatromm-chatuser.entity';

@Injectable()
export class ChatroomService extends BaseController {
  constructor(
    @InjectRepository(ChatRoom)
    private chatroomRepo: Repository<ChatRoom>,
    @InjectRepository(ChatroomChatuser)
    private chatroomChatUser: Repository<ChatroomChatuser>,
    private chatUserService: ChatUserService
  ) {
    super('ChatroomService')
  }

  /**
   * Creates a new chatroom or returns an existing one for the provided chatters.
   *
   * @param chatters - Array of user IDs to create or find a chatroom.
   * @returns The created or existing chatroom.
   */
  async create(chatters: string[]): Promise<ChatRoom> {
    const usersExist = await this.chatUserService.usersExist(chatters);
    if (!usersExist) throw new BadRequestException('At least one of the users does not exist');
    
    let chatroom = await this.findExistingOne(chatters);
    if (chatroom) return chatroom;
    
    this.logger.log(`Creating chatroom for ${chatters}`);

    const users = await this.chatUserService.findManyById(chatters);
    chatroom = this.chatroomRepo.create({ users });
    return await this.chatroomRepo.save(chatroom);
  }

  /**
   * Retrieves all chatrooms optionally including user relations.
   *
   * @param withRelation - Flag to include user relations in the result.
   * @returns Array of chatrooms.
   */
  async findAll(relations: string[] = []): Promise<ChatRoom[]> {
    return await this.chatroomRepo.find({ relations });
  }

  /**
   * Retrieves an existing chatroom for the provided chatters.
   *
   * @param chatters - Array of user IDs to find an existing chatroom.
   * @returns The existing chatroom or undefined if not found.
   */
  async findExistingOne(chatters: string[]): Promise<ChatRoom | undefined> {
    this.logger.log(`Retrieving chatroom between ${chatters}`);

    // Fetch all chatrooms with their users relationship eagerly loaded
    const chatrooms = await this.findAll(['users']);

    // Fetch the first chatroom where the length of users in the chatroom
    // is equal to the length of the passed-in chatters array and
    // every user in the chatroom is in the chatters array
    return chatrooms.find((chatroom) => {
      return (
        chatroom.users.length === chatters.length &&
        chatroom.users.every((user) => chatters.includes(user.id))
      );
    });
  }

  /**
   * Retrieves chatrooms for a user based on the provided user ID.
   *
   * @param id - User ID to find chatrooms for.
   * @returns Array of chatrooms associated with the user.
   */
  async findByUserId(id: string): Promise<ChatRoom[]> {
    this.logger.log(`Finding chatrooms for user ${id}`);

    // Fetch all chatrooms with their users relationship eagerly loaded
    const chatrooms = await this.findAll(['users']);

    // Filter chatrooms based on the user ID
    return chatrooms.filter((chatroom) =>
      chatroom.users.some((user) => user.id === id)
    );
  }

  /**
   * Retrieves a chatroom based on the provided ID.
   *
   * @param id - Chatroom ID to find.
   * @returns The found chatroom or undefined if not found.
   */
  findOne(id: string): Promise<ChatRoom | undefined> {
    return this.chatroomRepo.findOneBy({ id });
  }

  /**
   * Checks if a user is part of a specific chatroom.
   *
   * @param userID - User ID to check.
   * @param chatroomID - Chatroom ID to check.
   * @returns True if the user is in the chatroom, false otherwise.
   */
  async userIsInChatroom(chatUserId: string, chatRoomId: string): Promise<boolean> {
    this.logger.log(`Checking if ${chatUserId} is in chatroom ${chatRoomId}`)

    const chatUserChatroom = await this.chatroomChatUser.findOne({
      where: { chatRoomId, chatUserId }      
    });    

    return chatUserChatroom ? true : false
  }


  update(id: number, updateChatroomDto: UpdateChatroomDto) {
    return `This action updates a #${id} chatroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatroom`;
  }
}


