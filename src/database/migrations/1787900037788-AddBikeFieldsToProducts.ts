import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBikeFieldsToProducts1787900037788 implements MigrationInterface {
    name = 'AddBikeFieldsToProducts1787900037788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`year\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`engince\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`category\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`color\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`reset_password_tokens\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`price\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`color\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`engince\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`year\``);
    }

}
