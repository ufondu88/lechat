import { ChatRoom } from "src/chatroom/entities/chatroom.entity";
import { Community } from "src/community/entities/community.entity";
import { Message } from "src/message/entities/message.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string;

  @ManyToOne(() => Community)
  community: Community

  @ManyToMany(() => ChatRoom, chatroom => chatroom.users)
  chatRooms: ChatRoom[]

  @OneToMany(() => Message, message => message.sender)
  messages: Message[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
