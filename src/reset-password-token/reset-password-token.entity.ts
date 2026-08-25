import { BaseEntity } from '../database/entities/bas-entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'reset_password_tokens' })
export class ResetPasswordToken extends BaseEntity {
  @Column({ length: 255 })
  token: string;

  @Column({ type: 'datetime' })
  expires: Date;

  @Column({ default: false })
  isUsed: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;
}
