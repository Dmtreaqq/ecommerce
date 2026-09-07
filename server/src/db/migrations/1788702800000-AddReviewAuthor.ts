import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewAuthor1788702800000 implements MigrationInterface {
  name = 'AddReviewAuthor1788702800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" ADD "authorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_authorId" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    // Partial so the pre-auth guest rows (authorId NULL) and soft-deleted rows
    // stay exempt while one user still cannot review one product twice.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_reviews_author_product" ON "reviews" ("authorId", "productId") WHERE "authorId" IS NOT NULL AND "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_reviews_author_product"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_authorId"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "authorId"`);
  }
}
