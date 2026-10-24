import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Сутність ресторанної страви в PostgreSQL (Варіант 4)
 * Таблиця 'dishes' з точними типами стовпців та колонками аудиту
 */
@Entity('dishes')
export class DishEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price!: number;

  @Column({ type: 'integer' })
  weightGrams!: number;

  @Column({ type: 'integer' })
  calories!: number;

  @Column({ type: 'boolean', default: false })
  isSpicy!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt!: Date | null;

  constructor(partial?: Partial<DishEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
