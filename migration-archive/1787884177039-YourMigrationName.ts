import { MigrationInterface, QueryRunner } from "typeorm";

export class YourMigrationName1787884177039 implements MigrationInterface {
    name = 'YourMigrationName1787884177039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`test\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`description\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`price\` \`price\` decimal(10,0) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`test\` varchar(255) NULL`);
    }

}
