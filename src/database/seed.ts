import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { runSeeders } from './seeders/database.seeder';

async function seed() {
  try {
    await AppDataSource.initialize();

    console.log('Database connected');

    await runSeeders(AppDataSource);

    await AppDataSource.destroy();

    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding failed:', error);

    process.exit(1);
  }
}

void seed();
