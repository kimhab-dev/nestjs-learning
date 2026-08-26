import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailVerificationTokens1787720116034 implements MigrationInterface {
    name = 'CreateEmailVerificationTokens1787720116034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`change_email_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`token\` varchar(255) NOT NULL, \`newEmail\` varchar(255) NOT NULL, \`expires\` datetime NOT NULL, \`isUsed\` tinyint NOT NULL DEFAULT 0, \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`test\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` ADD CONSTRAINT \`FK_fac38dfa03cd00bf01c3a64dfd5\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`change_email_tokens\` DROP FOREIGN KEY \`FK_fac38dfa03cd00bf01c3a64dfd5\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`test\``);
        await queryRunner.query(`DROP TABLE \`change_email_tokens\``);
    }

}
