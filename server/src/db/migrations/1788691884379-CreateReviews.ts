import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviews1788691884379 implements MigrationInterface {
  name = 'CreateReviews1788691884379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "productId" uuid NOT NULL, "authorName" character varying(100) NOT NULL, "rating" smallint NOT NULL, "title" character varying(100) NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reviews_productId" ON "reviews"  ("productId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_reviews_productId"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
