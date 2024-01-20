
import { ChatUser } from "src/chat-user/entities/chat-user.entity";
import { ChatRoom } from "src/chatroom/entities/chatroom.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: new Date() })
  timestamp: Date

  @ManyToOne(() => ChatUser)
  sender: ChatUser

  @Column({ default: false })
  read: boolean

  @ManyToOne(() => ChatRoom)
  chatroom: ChatRoom

  @Column()
  value: string
}
