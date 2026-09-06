import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1788688269200 implements MigrationInterface {
  name = 'Migration1788688269200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(200) NOT NULL, "brand" character varying(100) NOT NULL, "category" character varying(32) NOT NULL, "priceCents" integer NOT NULL, "originalPriceCents" integer, "image" character varying(255) NOT NULL, "description" text NOT NULL, "features" jsonb NOT NULL DEFAULT '[]'::jsonb, "stock" integer NOT NULL DEFAULT '0', "ratingAverage" numeric(2,1) NOT NULL DEFAULT '0', "ratingCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, CONSTRAINT "CHK_products_category" CHECK ("category" IN ('Consoles', 'PC Hardware', 'Peripherals', 'Games', 'Accessories')), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_category" ON "products"  ("category") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_products_category"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
