import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityService } from '../community/community.service';
import { In, Repository } from 'typeorm';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';
import { ChatUser } from './entities/chat-user.entity';
import { UpdaterService } from '../helpers/classes/updater.service';

@Injectable()
export class ChatUserService extends UpdaterService<ChatUser, UpdateChatUserDto> {
  constructor(
    @InjectRepository(ChatUser)
    private chatUserRepo: Repository<ChatUser>,
    private communityService: CommunityService
  ) { super('ChatUserService', 'chatuser', chatUserRepo) }

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
}
