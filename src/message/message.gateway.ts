import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Event } from './subscriptions.enum';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { BaseController } from '../helpers/classes/base.controller';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessageGateway extends BaseController implements OnModuleInit {
  @WebSocketServer() server: Server
  static rooms: Record<string, string[]> = {}

  constructor(private readonly messageService: MessageService) { super('MessageGateway') }

  onModuleInit() {
    this.server.on(Event.CONNECTION, socket => {
      console.log(`${socket.id} connected!!!`)
    })
  }

  @SubscribeMessage(Event.SEND_MESSAGE)
  async create(@MessageBody() newMessage: CreateMessageDto) {
    const message = await this.messageService.create(newMessage);

    if (message) {
      this.server
        .to(newMessage.chatroomId)
        .emit(Event.RECEIVE_MESSAGE, newMessage)
    }
  }

  @SubscribeMessage(Event.TYPING)
  async typing(@MessageBody() payload: Payload, @ConnectedSocket() client: Socket) {
    client.broadcast
      .to(payload.chatroomId)
      .emit(Event.TYPING, payload.isTyping)
  }

  @SubscribeMessage('get')
  async getMessagesInChatroom(@MessageBody() payloadIn: Payload) {
    const messages = await this.messageService.findAllByChatroom(payloadIn.chatroomId);

    const payloadOut = {
      room: payloadIn.chatroomId,
      messages
    }

    this.server.to(payloadIn.chatroomId).emit(Event.GET_MESSAGE, payloadOut)
  }

  @SubscribeMessage(Event.JOIN_ROOM)
  async joinRoom(@MessageBody() payload: Payload, @ConnectedSocket() client: Socket) {
    const room = payload.chatroomId
    let rooms = MessageGateway.rooms
    let roomRecord = MessageGateway.rooms[room]

    if (!(room in rooms) || !roomRecord || !roomRecord.includes(client.id)) {
      this.logger.log(`${client.id} joining ${room}`)

      client.join(room)

      if (roomRecord) {
        roomRecord.push(client.id)
      } else {
        roomRecord = [client.id]
      }

      MessageGateway.rooms[room] = roomRecord
    }
  }

  @SubscribeMessage(Event.LEAVE_ROOM)
  async leaveRoom(@MessageBody() payload: Payload, @ConnectedSocket() client: Socket) {
    const room = payload.chatroomId
    let rooms = MessageGateway.rooms
    let roomRecord = MessageGateway.rooms[room]

    if (rooms && roomRecord) {
      this.logger.log(`${client.id} leaving ${room}`)

      client.leave(room)

      var filteredArray = MessageGateway.rooms[room].filter(e => e !== client.id)

      MessageGateway.rooms[room] = filteredArray
    }
  }
}

interface Payload {
  chatroomId: string;
  isTyping?: boolean
}