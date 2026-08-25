import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingUser = await userRepository.findOne({
    where: {
      email: 'admin@example.com',
    },
  });

  if (existingUser) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = userRepository.create({
    name: 'Admin smos',
    age: 30,
    email: 'adminsmos@example.com',
    password: hashedPassword,
    isVerified: true,
  });

  await userRepository.save(admin);

  console.log('Admin user created successfully');
}
