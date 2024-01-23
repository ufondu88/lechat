import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io'
import { BaseSupabaseService } from 'src/helpers/base.supabase.service';
import { Subscription } from './subscriptions.enum';

const {CONNECTION, JOIN_ROOM, LEAVE_ROOM, NEW_MESSAGE} = Subscription

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessageGateway extends BaseSupabaseService implements OnModuleInit {
  @WebSocketServer() server: Server

  constructor(private readonly messageService: MessageService) { super('MessageGateway') }

  onModuleInit() {
    this.server.on(CONNECTION, socket => {
      console.log(socket.id)
      console.log('connected!!!')
    })
  }

  @SubscribeMessage(NEW_MESSAGE)
  async create(@MessageBody() payload: CreateMessageDto) {
    const message = await this.messageService.create(payload);

    if (message)
      this.server.to(payload.chatroomId).emit(NEW_MESSAGE, message)
  }

  @SubscribeMessage('find')
  findAllByChatroom(@MessageBody() chatroomId: string) {
    return this.messageService.findAllByChatroom(chatroomId);
  }

  @SubscribeMessage(JOIN_ROOM)
  async joinRoom(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    const room = payload.chatroomId;
    
    client.join(room)
  }

  @SubscribeMessage(LEAVE_ROOM)
  async leaveRoom(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    const room = payload.chatroomId;

    client.leave(room)
  }
}
