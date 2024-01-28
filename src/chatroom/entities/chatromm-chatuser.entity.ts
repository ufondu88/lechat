import { ChatUser } from "../../chat-user/entities/chat-user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatRoom } from "./chatroom.entity";

@Entity('chat_room_users_chat_user')
export class ChatroomChatuser {
  @PrimaryColumn()
  chatRoomId: string

  @PrimaryColumn()
  chatUserId: string

  @ManyToOne(
    () => ChatUser,
    chatuser => chatuser.chatRooms,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'chatUserId', referencedColumnName: 'id' }])
  users: ChatUser[];

  @ManyToOne(
    () => ChatRoom,
    chatroom => chatroom.users,
    { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
  )
  @JoinColumn([{ name: 'chatRoomId', referencedColumnName: 'id' }])
  chatrooms: ChatRoom[];
}