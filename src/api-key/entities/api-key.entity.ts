import { Community } from "src/community/entities/community.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Community, community => community.apiKey, {onDelete: 'CASCADE'})
  @JoinColumn()
  community: Community;
  
  @Column({ unique: true })
  key: string;

  @Column({default: true})
  upToDate: boolean;
}
