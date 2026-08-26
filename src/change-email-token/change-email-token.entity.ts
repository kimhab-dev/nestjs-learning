import { BaseEntity } from '../database/entities/bas-entity';
import { User } from '../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'change_email_tokens' })
export class ChangeEmailToken extends BaseEntity {
  @Column({ length: 255 })
  token: string;

  @Column({ length: 255 })
  newEmail: string;

  @Column({ type: 'datetime' })
  expires: Date;

  @Column({ default: false })
  isUsed: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}
