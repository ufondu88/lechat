import { ApiKey } from "../../api-key/entities/api-key.entity";
import { ChatUser } from "../../chat-user/entities/chat-user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => ApiKey, apiKey => apiKey.community)
  apiKey?: ApiKey

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User

  @OneToMany(() => ChatUser, chatuser => chatuser.community)
  chatUsers: ChatUser[]

  @CreateDateColumn()
  created_at?: Date

  @UpdateDateColumn()
  updated_at?: Date
}
