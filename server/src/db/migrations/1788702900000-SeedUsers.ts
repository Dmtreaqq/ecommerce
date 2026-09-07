import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The demo accounts the sign-in page advertises. Hashes are pre-computed
 * literals because a migration must be deterministic and cannot hash at
 * runtime; both are bcrypt cost 12 of 'password123'.
 */
const DEMO_USERS = [
  {
    email: 'gamer@example.com',
    name: 'Alex Rivera',
    passwordHash:
      '$2b$12$/A7KwRqCyPSGRs4GaLK6KORL.MwhhmUYL3B4Yzhj/PBbOOQos5qku',
  },
  {
    email: 'sam@example.com',
    name: 'Sam Okafor',
    passwordHash:
      '$2b$12$1J2uDXxZTm0tLg36831eS.07WmcLV7our9wPf78I.jGN6O8IXsmNK',
  },
];

export class SeedUsers1788702900000 implements MigrationInterface {
  name = 'SeedUsers1788702900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const user of DEMO_USERS) {
      await queryRunner.query(
        `INSERT INTO "users" ("email", "name", "passwordHash", "version") VALUES ($1, $2, $3, 1)`,
        [user.email, user.name, user.passwordHash],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = ANY($1)`, [
      DEMO_USERS.map((user) => user.email),
    ]);
  }
}
