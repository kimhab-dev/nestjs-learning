import { DataSource } from 'typeorm';
import { seedUsers } from './user.seeder';

export async function runSeeders(dataSource: DataSource) {
  console.log('Starting database seed...');

  await seedUsers(dataSource);

  console.log('Database seed completed');
}
