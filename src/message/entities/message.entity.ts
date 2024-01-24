
import { ChatUser } from "src/chat-user/entities/chat-user.entity";
import { ChatRoom } from "src/chatroom/entities/chatroom.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => ChatUser)
  sender: ChatUser
  
  @Column({ default: false })
  read: boolean
  
  @ManyToOne(() => ChatRoom)
  chatroom: ChatRoom
  
  @Column()
  value: string
  
    @CreateDateColumn()
    created_at: Date
}
