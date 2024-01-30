import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { ChatUserService } from '../chat-user/chat-user.service';
import { ChatroomService } from '../chatroom/chatroom.service';
import { CryptoService } from '../crypto/crypto.service';
import { BaseController } from '../helpers/classes/base.controller';
import { ChatRoom } from 'chatroom/entities/chatroom.entity';
import { ChatUser } from 'chat-user/entities/chat-user.entity';

@Injectable()
export class MessageService extends BaseController {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    private chatroomService: ChatroomService,
    private chatUserService: ChatUserService,
    private cryptoService: CryptoService
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

      // Validate sender
      const chatSender: ChatUser = await this.validateUser(sender);
      if (!chatSender) {
        throw new NotFoundException(`User ${sender} not found`);
      }

      // Validate chatroom
      const chatroom: ChatRoom = await this.validateChatroom(chatroomId);
      if (!chatroom) {
        throw new NotFoundException(`Chatroom ${chatroomId} not found`);
      }

      // Check if the sender is part of the chatroom
      const userInChatroom: boolean = await this.validateUserInChatroom(sender, chatroomId);
      if (!userInChatroom) {
        throw new BadRequestException(`User ${sender} is not part of chatroom ${chatroomId}`);
      }

      const encryptedMessage = this.cryptoService.encrypt(value)

      const messageObject = { value: encryptedMessage, sender: chatSender, chatroom };
      const message = this.messageRepo.create(messageObject);

      this.logger.log(`Message created successfully`);

      return await this.messageRepo.save(message);
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);

      throw error
    }
  }

  validateUser(userId: string) {
    return this.chatUserService.findOneByID(userId);
  }

  validateChatroom(chatroomId: string) {
    return this.chatroomService.findOne(chatroomId);
  }

  async validateUserInChatroom(userId: string, chatroomId: string) {
    return await this.chatroomService.userIsInChatroom(userId, chatroomId);
  }

  /**
   * Retrieves all messages for a specific chatroom.
   * 
   * @param chatroomId - ID of the chatroom to retrieve messages for.
   * @returns A promise that resolves to an array of messages.
   */
  async findAllByChatroom(chatroomId: string) {    
    try {
      const messages = await this.messageRepo.find({
        relations: ['chatroom'],
        where: {
          chatroom: {
            id: chatroomId
          }
        }
      });   

      return this.decrypted(messages)
    } catch (error) {
      this.logger.error(`Error retrieving messages: ${error.message}`);

      throw error
    }
  }

  decrypted(messages: Message[]) {
    messages.forEach(message => message.value = this.cryptoService.decrypt(message.value))

    return messages
  }

}
