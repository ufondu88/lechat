import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessageGateway implements OnModuleInit {
  private logger = new Logger('MessageGateway')

  @WebSocketServer() server: Server

  constructor(private readonly messageService: MessageService) { }

  onModuleInit() {
    this.server.on('connection', socket => {
      console.log(socket.id)
      console.log('connected!!!')
    })
  }

  @SubscribeMessage('new_message')
  async create(@MessageBody() payload: CreateMessageDto) {
    // const message = await this.messageService.create(payload);

    // this.server.to(payload.chatroomId).emit('chat', message)
    this.server.emit(payload.chatroomId, 'new message')

    // return message
  }

  @SubscribeMessage('find')
  findAllByChatroom(@MessageBody() chatroomId: string) {
    return this.messageService.findAllByChatroom(chatroomId);
  }

  @SubscribeMessage('join_room')
  async joinRoom(@MessageBody() payload: any) {
    console.log(payload);
    const roomName = payload.roomName;
    this.server.socketsJoin(roomName);
  }
}
