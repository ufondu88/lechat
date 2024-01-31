import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityService } from '../community/community.service';
import { BaseController } from '../helpers/classes/base.controller';
import { In, Repository } from 'typeorm';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';
import { ChatUser } from './entities/chat-user.entity';

@Injectable()
export class ChatUserService extends BaseController {
  constructor(
    @InjectRepository(ChatUser)
    private chatUserRepo: Repository<ChatUser>,
    private communityService: CommunityService
  ) { super('ChatUserService') }

  /**
   * Creates a new chat user associated with a community based on the provided DTO and API key.
   * 
   * @param createChatUserDto - DTO containing information for creating a chat user.
   * @param apiKey - API key associated with the community.
   * @returns A promise that resolves to the created chat user.
   * @throws NotFoundException if the community is not found.
   */
  async create(createChatUserDto: CreateChatUserDto, apiKey: string) {
    try {
      const community = await this.communityService.findOneByApiKey(apiKey);
      if (!community) throw new NotFoundException('Community not found');

      this.logger.log('Creating chat user');

      const chatUser = this.chatUserRepo.create(createChatUserDto);
      chatUser.community = community;

      this.logger.log(chatUser);

      return await this.chatUserRepo.save(chatUser);
    } catch (error) {
      this.logger.error(`Error creating chat user: ${error.message}`);

      throw error
    }
  }

  /**
   * Checks if users with the provided IDs exist.
   * 
   * @param ids - Array of user IDs to check.
   * @returns A promise that resolves to a boolean indicating whether all users exist.
   * @throws Error if an error occurs during the check.
   */
  async usersExist(ids: string[]) {
    try {
      this.logger.log(`Checking if users: ${ids} exist`);

      const numFound = await this.chatUserRepo.count({
        where: {
          id: In(ids),
        },
      });

      return numFound === ids.length;
    } catch (error) {
      this.logger.error(`Error checking if user exists: ${error.message}`);
    }
  }

  /**
   * Retrieves all chat users.
   * 
   * @returns A string indicating that this action returns all chat users.
   */
  findAll() {
    try {
      this.logger.log(`Getting all chat users`);
      return `This action returns all chatUser`;
    } catch (error) {
      this.logger.error(`Error retrieving all chat users: ${error.message}`);
    }
  }

  /**
   * Retrieves a chat user based on the provided ID.
   * 
   * @param id - User ID to retrieve.
   * @returns A promise that resolves to the found chat user.
   */
  findOneByID(id: string) {
    try {
      this.logger.log(`Getting chat user: ${id}`);
      return this.chatUserRepo.findOneBy({ id });
    } catch (error) {
      this.logger.error(`Error retrieving chat user: ${error.message}`);
    }
  }

  /**
   * Retrieves multiple chat users based on the provided IDs.
   * 
   * @param ids - Array of user IDs to retrieve.
   * @returns A promise that resolves to an array of found chat users.
   */
  findManyById(ids: string[]) {
    try {
      this.logger.log(`Getting chat users: ${ids}`);
      const where = ids.map((id) => ({ id }));
      return this.chatUserRepo.find({ where });
    } catch (error) {
      this.logger.error(`Error retrieving chat users: ${error.message}`);
    }
  }


  /**
   * Updates an existing chat user based on the provided ID and DTO.
   *
   * @param id - chat user ID to update.
   * @param updateChatUserDto - DTO containing information to update the chat user.
   * @returns The updated chat user or throws a NotFoundException if the chat user is not found.
   * @throws NotFoundException if the chat user is not found.
   */
  async update(id: string, updateChatUserDto: UpdateChatUserDto) {
    try {
      const chatuser = await this.findOneByID(id);
      if (!chatuser)
        throw new NotFoundException(`Chat user with ID "${id}" not found`);

      chatuser.externalId = updateChatUserDto.externalId;
      
      this.logger.log(`Chat user with ID "${id}" updated successfully`);
      
      return await this.chatUserRepo.save(chatuser);
    } catch (error) {
      this.logger.error(`Error updating chat user: ${error.message}`);

      throw error
    }
  }

  /**
   * Removes a chat user based on the provided ID.
   *
   * @param id - Chat user ID to remove.
   * @returns Promise<string> or throws a NotFoundException if the chat user is not found.
   * @throws NotFoundException if the chat user is not found.
   */
  async remove(id: string) {
    try {
      const result = await this.chatUserRepo.delete(id);
      if (result.affected === 0)
        throw new NotFoundException(`Chat user with ID "${id}" not found`);

      this.logger.log(`Chat user with ID "${id}" deleted successfully`);

      return `Chat user with ID "${id}" deleted successfully`;
    } catch (error) {
      this.logger.error(`Error removing chat user: ${error.message}`);

      throw error
    }
  }
}
