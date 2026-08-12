import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'int',
    nullable: true, // tell database tar can oy colunm null
  })
  age: number | null; // tell typescript this field can number orr null

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}