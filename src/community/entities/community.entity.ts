import { ApiKey } from "src/api-key/entities/api-key.entity";
import { ChatUser } from "src/chat-user/entities/chat-user.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Community { 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => ApiKey, apiKey => apiKey.community)
  apiKey: ApiKey

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @OneToMany(() => ChatUser, chatuser => chatuser.community)
  chatUsers: ChatUser[]
}
