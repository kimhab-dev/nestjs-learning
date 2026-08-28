import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailVerificationTokens1787824445181 implements MigrationInterface {
    name = 'CreateEmailVerificationTokens1787824445181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`twoFactorPendingSecret\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`twoFactorPendingSecret\` varchar(255) NULL`);
    }

}
