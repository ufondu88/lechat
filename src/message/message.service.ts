import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { BaseController } from 'src/helpers/base.controller';

@Injectable()
export class MessageService extends BaseController {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    private chatroomService: ChatroomService,
    private chatUserService: ChatUserService
  ) { super('MessageService') }


  /**
   * Creates a new message based on the provided DTO.
   * 
   * @param createMessageDto - DTO containing information for creating a message.
   * @returns A promise that resolves to the created message.
   * @throws NotFoundException if the sender or chatroom is not found.
   * @throws BadRequestException if the sender is not part of the chatroom.
   */
  async create(createMessageDto: CreateMessageDto) {
    try {
      const { sender, value, chatroomId } = createMessageDto;

      const chatSender = await this.chatUserService.findOneByID(sender);
      if (!chatSender)
        throw new NotFoundException(`User ${sender} not found`);

      const chatroom = await this.chatroomService.findOne(chatroomId);
      if (!chatroom)
        throw new NotFoundException(`Chatroom ${chatroomId} not found`);

      const userInChatroom = await this.chatroomService.userIsInChatroom(sender, chatroomId);
      if (!userInChatroom)
        throw new BadRequestException(`User ${sender} is not part of chatroom ${chatroomId}`);

      const messageObject = { value, sender: chatSender, chatroom };
      const message = this.messageRepo.create(messageObject);

      this.logger.log(`Message created successfully`);

      return await this.messageRepo.save(message);
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
    }
  }

  /**
   * Retrieves all messages for a specific chatroom.
   * 
   * @param chatroomId - ID of the chatroom to retrieve messages for.
   * @returns A promise that resolves to an array of messages.
   */
  async findAllByChatroom(chatroomId: string) {
    try {
      const chatroom = await this.chatroomService.findOne(chatroomId);

      return await this.messageRepo.findBy({ chatroom });
    } catch (error) {
      this.logger.error(`Error retrieving messages: ${error.message}`);
    }
  }

}
