import { Community } from "../../community/entities/community.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  name?: string;

  @Column({ unique: true })
  email?: string;

  @Column()
  telephone?: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Community, commnuoty => commnuoty.id)
  communities?: Community[]

  @CreateDateColumn()
  created_at?: Date

  @UpdateDateColumn()
  updated_at?: Date

  @BeforeInsert()
  @BeforeUpdate()
  formatTelephone() {
    // Remove any non-digit characters from the input
    this.telephone = this.telephone.replace(/\D/g, '');

    // Apply the US phone number format XXX-XXX-XXXX
    this.telephone = this.telephone.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateValues() {
    this.name = titleCaseTransformer(this.name);
    this.email = lowercaseTransformer(this.email);
  }
}

// Custom transformer functions
function titleCaseTransformer(value: string) {
  return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function lowercaseTransformer(value: string) {
  return value.toLowerCase();
}