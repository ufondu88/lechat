import { ChatUser } from "../../chat-user/entities/chat-user.entity";
import { ChatRoom } from "../../chatroom/entities/chatroom.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatUser)
  sender: ChatUser

  @Column({ default: false })
  read?: boolean

  @ManyToOne(() => ChatRoom)
  chatroom: ChatRoom 

  @Column()
  value: string

  @CreateDateColumn()
  created_at?: Date
}
