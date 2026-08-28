import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingUser = await userRepository.findOne({
    where: {
      email: 'kimhabsok68@gmail.com',
    },
  });

  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Kimhab@1234', 10);

  const admin = userRepository.create({
    name: 'Admin smos',
    age: 30,
    role: Role.ADMIN,
    email: 'kimhabsok68@gmail.com',
    password: hashedPassword,
    isVerified: true,
  });

  await userRepository.save(admin);

  console.log('Admin user created successfully');
}
