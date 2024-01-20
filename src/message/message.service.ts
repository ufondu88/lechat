import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserService } from 'src/chat-user/chat-user.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    private chatroomService: ChatroomService,
    private chatUserService: ChatUserService
  ) { }

  async create(createMessageDto: CreateMessageDto) {
    const { value, chatroomId } = createMessageDto

    const sender = await this.chatUserService.findOneByID(createMessageDto.sender)
    const chatroom = await this.chatroomService.findOne(chatroomId)

    const messageObject = { value, sender, chatroom }
    const message = this.messageRepo.create(messageObject)

    return this.messageRepo.save(message)
  }

  async findAllByChatroom(chatroomId: string) {
    const chatroom = await this.chatroomService.findOne(chatroomId)

    return this.messageRepo.findBy({ chatroom })
  }
}
