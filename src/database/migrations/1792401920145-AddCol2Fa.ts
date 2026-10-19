import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCol2Fa1792401920145 implements MigrationInterface {
    name = 'AddCol2Fa1792401920145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`twoFactorEnabled\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`twoFactorEnabled\``);
    }

}
