import { Community } from "../../community/entities/community.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Community, community => community.apiKey, {onDelete: 'CASCADE'})
  @JoinColumn()
  community?: Community;
  
  @Column({ unique: true })
  key: string;

  @Column({default: true})
  upToDate: boolean;

  @CreateDateColumn()
  created_at?: Date
}
