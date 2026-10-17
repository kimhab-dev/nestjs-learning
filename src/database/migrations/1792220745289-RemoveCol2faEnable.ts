import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCol2faEnable1792220745289 implements MigrationInterface {
    name = 'RemoveCol2faEnable1792220745289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`twoFactorEnabled\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`twoFactorEnabled\` tinyint NOT NULL DEFAULT '0'`);
    }

}
