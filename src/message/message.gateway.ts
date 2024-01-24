import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io'
import { BaseSupabaseService } from 'src/helpers/base.supabase.service';
import { Subscription } from './subscriptions.enum';

const { CONNECTION, JOIN_ROOM, LEAVE_ROOM, SEND_MESSAGE, RECEIVE_MESSAGE, TYPING } = Subscription

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessageGateway extends BaseSupabaseService implements OnModuleInit {
  @WebSocketServer() server: Server

  static rooms: Record<string, string[]> = {}

  constructor(private readonly messageService: MessageService) { super('MessageGateway') }

  onModuleInit() {
    this.server.on(CONNECTION, socket => {
      console.log(`${socket.id} connected!!!`)
    })
  }

  @SubscribeMessage(SEND_MESSAGE)
  async create(@MessageBody() newMessage: CreateMessageDto) {    
    const message = await this.messageService.create(newMessage);
 
    if (message)
      this.server.to(newMessage.chatroomId).emit(RECEIVE_MESSAGE, newMessage)
  }

  @SubscribeMessage(TYPING)
  async typing(@MessageBody() payload: { chatroomId: string, isTyping: boolean }, @ConnectedSocket() client: Socket) {
    client.broadcast.to(payload.chatroomId).emit(TYPING, payload.isTyping)
  }

  @SubscribeMessage(JOIN_ROOM)
  async joinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {  
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

  @SubscribeMessage(LEAVE_ROOM)
  async leaveRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
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
