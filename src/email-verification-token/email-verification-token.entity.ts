import { BaseEntity } from '../database/entities/bas-entity';
import { User } from '../users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'email_verification_tokens' })
export class EmailVerificationToken extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'datetime' })
  expires: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}
