import { Community } from "src/community/entities/community.entity";
import { Message } from "src/message/entities/message.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, Entity, OneToMany } from "typeorm";

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  externalId: string;

  @ManyToOne(() => Community)
  community: Community

  @OneToMany(() => Message, message => message.sender)
  messages: Message[]
}