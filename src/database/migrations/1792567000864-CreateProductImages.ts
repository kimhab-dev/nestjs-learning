import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductImages1792567000864 implements MigrationInterface {
  name = 'CreateProductImages1792567000864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`productImages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`image_url\` varchar(500) NOT NULL, \`sort_order\` int NOT NULL DEFAULT '0', \`is_primary\` tinyint NOT NULL DEFAULT 0, \`product_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`productImages\` ADD CONSTRAINT \`FK_96d351033a97f71eeecbc57c8da\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`productImages\` DROP FOREIGN KEY \`FK_96d351033a97f71eeecbc57c8da\``,
    );
    await queryRunner.query(`DROP TABLE \`productImages\``);
  }
}
