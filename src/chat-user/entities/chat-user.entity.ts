import { ChatRoom } from "../../chatroom/entities/chatroom.entity";
import { Community } from "../../community/entities/community.entity";
import { Message } from "../../message/entities/message.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string;

  @ManyToOne(() => Community)
  community?: Community

  @ManyToMany(() => ChatRoom, chatroom => chatroom.users)
  chatRooms?: ChatRoom[]

  @OneToMany(() => Message, message => message.sender)
  messages?: Message[]

  @CreateDateColumn()
  created_at?: Date

  @UpdateDateColumn()
  updated_at?: Date
}
