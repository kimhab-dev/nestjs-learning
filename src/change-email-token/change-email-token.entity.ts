import { BaseEntity } from '../database/entities/bas-entity';
import { User } from '../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'change_email_tokens' })
export class ChangeEmailToken extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'varchar', length: 255 })
  newEmail: string;

  @Column({ type: 'datetime' })
  expires: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}
