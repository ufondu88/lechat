import { ChatUser } from "src/chat-user/entities/chat-user.entity";
import { Message } from "src/message/entities/message.entity";
import { CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => ChatUser, chatuser => chatuser.chatRooms)
  @JoinTable()
  users: ChatUser[]

  @OneToMany(() => Message, message => message.chatroom)
  messages: Message[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
