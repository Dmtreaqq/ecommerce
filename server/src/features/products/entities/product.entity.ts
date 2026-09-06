import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export const CATEGORIES = [
  'Consoles',
  'PC Hardware',
  'Peripherals',
  'Games',
  'Accessories',
] as const;

export type Category = (typeof CATEGORIES)[number];

const CATEGORY_CHECK = `"category" IN (${CATEGORIES.map((category) => `'${category}'`).join(', ')})`;

@Entity('products')
@Check('CHK_products_category', CATEGORY_CHECK)
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Index('IDX_products_category')
  @Column({ type: 'varchar', length: 32 })
  category: Category;

  @Column({ type: 'int' })
  priceCents: number;

  @Column({ type: 'int', nullable: true })
  originalPriceCents: number | null;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  features: string[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? 0 : Number(value)),
    },
  })
  ratingAverage: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @VersionColumn()
  version: number;
}
