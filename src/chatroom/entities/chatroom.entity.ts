import { ChatUser } from "src/chat-user/entities/chat-user.entity";
import { Message } from "src/message/entities/message.entity";
import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => ChatUser)
  @JoinTable()
  users: ChatUser[]

  @OneToMany(() => Message, message => message.chatroom)
  messages: Message[]
}
